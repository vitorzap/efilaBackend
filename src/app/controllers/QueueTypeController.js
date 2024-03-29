const Yup = require('yup');
const QueueType = require('../models/QueueType');
const Company = require('../models/Company');
const Queue = require('../models/Queue');
const Constants = require('../constants');

class QueueTypeController {
  async index(req, res) {
    let queueTypes;
    const { page = 1, sort = 'description' } = req.query;
    const includeCompany = { model: Company, as: 'company' };
    const sortEspec =
      sort.substring(0, sort.indexOf('.')) === 'company'
        ? [includeCompany, sort.substring(sort.indexOf('.') + 1), 'ASC']
        : sort;
    if (req.loggedUserType === Constants.USER_ROOT) {
      queueTypes = await QueueType.findAndCountAll({
        include: [includeCompany],
        order: [sortEspec],
        limit: Constants.ROWS_PER_PAGE,
        offset: (page - 1) * Constants.ROWS_PER_PAGE
      });
    } else {
      queueTypes = await QueueType.findAndCountAll({
        where: { company_id: req.loggedUserCompanyId },
        include: [includeCompany],
        order: [sortEspec],
        limit: Constants.ROWS_PER_PAGE,
        offset: (page - 1) * Constants.ROWS_PER_PAGE
      });
    }
    queueTypes.perpage = Constants.ROWS_PER_PAGE;
    return res.json(queueTypes);
  }

  async listqueuetypes(req, res) {
    const { companyid } = req.query;
    const queueTypes = await QueueType.findAll({
      where: { company_id: companyid },
      attributes: ['id', 'description'],
      order: ['description']
    });
    return res.json(queueTypes);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
      company_id: Yup.number()
        .required()
        .positive()
        .integer()
    });
    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Dados não válidos' });

    const QueueTypeWithSameDescriptionExists = await QueueType.findOne({
      where: {
        description: req.body.description,
        company_id: req.loggedUserCompanyId
      }
    });

    if (QueueTypeWithSameDescriptionExists)
      return res
        .status(400)
        .json({ error: 'Já existe um Tipo de Fila com esta descrição.' });

    let company;
    if (req.loggedUserType === Constants.USER_ROOT) {
      company = await Company.findByPk(req.body.company_id);
    } else {
      company = await Company.findByPk(req.loggedUserCompanyId);
    }
    if (!company)
      return res.status(400).json({ error: 'Tipo de Fila não cadastrado.' });

    const { name: companyName } = company;

    const { id, description, company_id: companyId } = await QueueType.create({
      description: req.body.description,
      company_id: company.id
    });

    return res.json({ id, description, companyId, companyName });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string()
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Dados não válidos' });

    const { description: newDescription, company_id: newCompanyId } = req.body;
    if (newCompanyId) {
      return res.status(400).json({ error: 'Empresa não pode ser alterada.' });
    }

    const queueType = await QueueType.findByPk(req.params.id);
    if (!queueType) {
      return res.status(400).json({ error: 'Tipo de Fila não cadastrado.' });
    }
    if (req.loggedUserType !== Constants.USER_ROOT) {
      if (queueType.company_id !== req.loggedUserCompanyId) {
        return res
          .status(400)
          .json({ error: 'Tipo de Fila não cadastrado (para esta empresa).' });
      }
    }

    if (newDescription && newDescription !== queueType.description) {
      const queueTypeWithSameDescriptionExists = await QueueType.findOne({
        where: {
          description: newDescription,
          company_id: req.loggedUserCompanyId
        }
      });

      if (queueTypeWithSameDescriptionExists)
        return res.status(400).json({
          error: 'Já existe um Tipo de Fila com esta descrição.'
        });
    }

    const { id, description, company_id: companyId } = await queueType.update(
      req.body
    );

    return res.json({ id, description, companyId });
  }

  async delete(req, res) {
    const queueType = await QueueType.findByPk(req.params.id);
    if (!queueType) {
      return res.status(400).json({ error: 'Tipo de Fila não cadastrado.' });
    }
    if (req.loggedUserType !== Constants.USER_ROOT) {
      if (queueType.company_id !== req.loggedUserCompanyId) {
        return res
          .status(400)
          .json({ error: 'Tipo de Fila não cadastrado (para esta empresa).' });
      }
    }

    const queue = await Queue.findOne({
      where: { queue_type_id: req.params.id }
    });
    if (queue) {
      return res.status(400).json({
        error: 'Existe pelo menos um Fila ligada a este Tipo de Fila.'
      });
    }

    const { id, description, company_id: companyId } = queueType;
    await queueType.destroy();

    return res.json({ id, description, companyId });
  }
}

module.exports = new QueueTypeController();
