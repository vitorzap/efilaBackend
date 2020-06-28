const Yup = require('yup');
const Queue = require('../models/Queue');
const QueueType = require('../models/QueueType');
const Company = require('../models/Company');
const Position = require('../models/Position');
const Constants = require('../constants');

class QueueController {
  async index(req, res) {
    let queues;
    const { page = 1, sort = 'description' } = req.query;
    const includeCompany = { model: Company, as: 'company' };
    const includeQueueType = { model: QueueType, as: 'queue_type' };
    const sortEspec =
      sort.substring(0, sort.indexOf('.')) === 'company'
        ? [includeCompany, sort.substring(sort.indexOf('.') + 1), 'ASC']
        : sort.substring(0, sort.indexOf('.')) === 'queue_type'
        ? [includeQueueType, sort.substring(sort.indexOf('.') + 1), 'ASC']
        : sort;
    if (req.loggedUserType === Constants.USER_ROOT) {
      queues = await Queue.findAndCountAll({
        include: [includeCompany, includeQueueType],
        order: [sortEspec],
        limit: Constants.ROWS_PER_PAGE,
        offset: (page - 1) * Constants.ROWS_PER_PAGE
      });
    } else {
      queues = await Queue.findAndCountAll({
        where: { company_id: req.loggedUserCompanyId },
        include: [includeCompany, includeQueueType],
        order: [sortEspec],
        limit: Constants.ROWS_PER_PAGE,
        offset: (page - 1) * Constants.ROWS_PER_PAGE
      });
    }
    queues.perpage = Constants.ROWS_PER_PAGE;
    return res.json(queues);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required()
    });
    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Dados não válidos.' });

    const companyId =
      req.loggedUserType === Constants.USER_ROOT
        ? req.body.company_id
        : req.loggedUserCompanyId;

    const QueueWithSameDescriptionExists = await Queue.findOne({
      where: {
        description: req.body.description,
        company_id: companyId
      }
    });

    if (QueueWithSameDescriptionExists)
      return res
        .status(400)
        .json({ error: 'Já existe uma Fila com esta descrição.' });

    const company = await Company.findByPk(companyId);
    if (!company)
      return res.status(400).json({ error: 'Empresa não cadastrada.' });

    const queueType = await QueueType.findByPk(req.body.queue_type_id);
    if (!queueType)
      return res.status(400).json({ error: 'Tipo de Fila não cadastrada.' });
    if (queueType.company_id !== companyId)
      return res.status(400).json({
        error: 'Este Tipo de Fila não esta cadastrado para esta empresa.'
      });

    const { id, description } = await Queue.create({
      description: req.body.description,
      positions: 0,
      wait: 0,
      company_id: companyId,
      queue_type_id: req.body.queue_type_id
    });

    return res.json({ id, description });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string(),
      positions: Yup.number()
        .positive()
        .integer(),
      wait: Yup.number()
        .positive()
        .integer()
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Dados não válidos.' });

    const {
      description: newDescription,
      company_id: newCompanyId,
      queue_type_id: newQueueTypeId
    } = req.body;

    const queue = await Queue.findByPk(req.params.id);
    if (!queue) {
      return res.status(400).json({ error: 'Fila não cadastrada.' });
    }

    if (req.loggedUserType !== Constants.USER_ROOT) {
      if (newCompanyId !== queue.company_id) {
        return res
          .status(400)
          .json({ error: 'Não é possível alterar companhia da Fila.' });
      }
    }

    let wCompanyId = queue.company_id;
    if (newCompanyId && newCompanyId !== queue.company_id) {
      wCompanyId = newCompanyId;
      const company = await Company.findByPk(wCompanyId);
      if (!company) {
        return res.status(400).json({ error: 'Empresa não cadastrada.' });
      }
    }

    if (newDescription && newDescription !== queue.description) {
      const QueueWithSameDescriptionExists = await Queue.findOne({
        where: {
          description: newDescription,
          company_id: wCompanyId
        }
      });

      if (QueueWithSameDescriptionExists)
        return res.status(400).json({
          error: 'Já existe uma Fila com esta descrição.'
        });
    }

    if (newQueueTypeId && newQueueTypeId !== queue.queue_type_id) {
      const queueType = await QueueType.findByPk(newQueueTypeId);
      if (!queueType) {
        return res.status(400).json({ error: 'Tipo de Fila não cadastrado.' });
      }
      if (queueType.company_id !== wCompanyId) {
        return res
          .status(400)
          .json({ error: 'Fila não cadastrada (para esta empresa).' });
      }
    }

    const {
      id,
      description,
      positions,
      wait,
      company_id: companyId,
      queue_type_id: queueTypeId
    } = await queue.update(req.body);

    return res.json({
      id,
      description,
      positions,
      wait,
      companyId,
      queueTypeId
    });
  }

  async delete(req, res) {
    const queue = await Queue.findByPk(req.params.id);
    if (!queue) {
      return res.status(400).json({ error: 'Fila não cadastrada.' });
    }
    const wCompanyId =
      req.loggedUserType === Constants.USER_ROOT
        ? queue.company_id
        : req.loggedUserCompanyId;

    if (queue.company_id !== wCompanyId) {
      return res
        .status(400)
        .json({ error: 'Fila não cadastrada (para esta empresa).' });
    }

    const childPosition = await Position.findOne({
      where: { queue_id: queue.id }
    });
    if (childPosition) {
      res.status(400).json({ error: 'Fila ainda tem posições' });
    }

    const {
      id,
      description,
      company_id: companyId,
      queue_type_id: queueTypeId
    } = queue;
    await queue.destroy();

    return res.json({ id, description, companyId, queueTypeId });
  }
}

// export default new QueueController();
module.exports = new QueueController();
