// import * as Yup from 'yup';
const Yup = require('yup');
const Queue = require('../models/Queue');
const QueueType = require('../models/QueueType');
const Company = require('../models/Company');
const Constants = require('../constants');

class QueueController {
  async index(req, res) {
    let queues;
    if (req.loggedUserType === Constants.USER_ROOT) {
      queues = await Queue.findAll({
        include: [
          { model: Company, as: 'company' },
          { model: QueueType, as: 'queue_type' }
        ],
        order: ['description']
      });
    } else {
      queues = await Queue.findAll({
        where: { company_id: req.loggedUserCompanyId },
        include: [
          { model: Company, as: 'company' },
          { model: QueueType, as: 'queue_type' }
        ],
        order: ['description']
      });
    }

    return res.json(queues);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
      // company_id: Yup.number()
      //   .required()
      //   .positive()
      //   .integer(),
      queue_type_id: Yup.number()
        .required()
        .positive()
        .integer()
    });
    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation failed' });

    const QueueWithSameDescriptionExists = await Queue.findOne({
      where: {
        description: req.body.description,
        company_id: req.loggedUserCompanyId
      }
    });

    if (QueueWithSameDescriptionExists)
      return res
        .status(400)
        .json({ error: 'There is already Queue with this description.' });

    // const company = await Company.findByPk(req.body.company_id);
    const company = await Company.findByPk(req.loggedUserCompanyId);
    if (!company)
      return res.status(400).json({ error: 'Company does not exists.' });

    const queueType = await QueueType.findByPk(req.body.queue_type_id);
    if (!queueType)
      return res.status(400).json({ error: 'Queue type does not exists.' });
    // if (queueType.company_id !== company.id)
    if (queueType.company_id !== req.loggedUserCompanyId)
      return res.status(400).json({
        error: 'Company does not have this queue type.'
      });

    const { id, description } = await Queue.create({
      description: req.body.description,
      posicoes: 0,
      espera: 0,
      company_id: req.loggedUserCompanyId,
      queue_type_id: req.body.queue_type_id
    });

    return res.json({ id, description });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string(),
      posicoes: Yup.number()
        .positive()
        .integer(),
      espera: Yup.number()
        .positive()
        .integer(),
      // company_id: Yup.number()
      //   .positive()
      //   .integer(),
      queue_type_id: Yup.number()
        .positive()
        .integer()
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation failed' });

    const {
      description: newDescription,
      company_id: newCompanyId,
      queue_type_id: newQueueTypeId
    } = req.body;
    if (newCompanyId) {
      return res.status(400).json({ error: 'Company can not be changed.' });
    }

    const queue = await Queue.findByPk(req.params.id);
    if (!queue) {
      return res.status(400).json({ error: 'Queue does not exists.' });
    }
    if (queue.company_id !== req.loggedUserCompanyId) {
      return res
        .status(400)
        .json({ error: 'Queue does not exists (in this company).' });
    }

    if (newDescription && newDescription !== queue.description) {
      const QueueWithSameDescriptionExists = await Queue.findOne({
        where: {
          description: newDescription,
          company_id: req.loggedUserCompanyId
        }
      });

      if (QueueWithSameDescriptionExists)
        return res.status(400).json({
          error: 'There is already Queue type with this description.'
        });
    }

    if (newCompanyId && newCompanyId !== queue.company_id) {
      const company = await Company.findByPk(newCompanyId);
      if (!company)
        return res.status(400).json({ error: 'Company does not exists.' });
    }

    // if (newQueueTypeId && newQueueTypeId !== queue.queue_type_id) {
    //   const queueType = await QueueType.findByPk(newQueueTypeId);
    //   if (!queueType)
    //     return res.status(400).json({ error: 'Queue type does not exists.' });
    // }

    const {
      id,
      description,
      posicoes,
      espera,
      company_id: companyId,
      queue_type_id: queueTypeId
    } = await queue.update(req.body);

    return res.json({
      id,
      description,
      posicoes,
      espera,
      companyId,
      queueTypeId
    });
  }

  async delete(req, res) {
    const queue = await Queue.findByPk(req.params.id);
    if (!queue) {
      return res.status(400).json({ error: 'Queue does not exists.' });
    }
    if (queue.company_id !== req.loggedUserCompanyId) {
      return res
        .status(400)
        .json({ error: 'Queue type does not exists (in this company).' });
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
