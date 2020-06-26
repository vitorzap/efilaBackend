// const * as Yup from 'yup';
const Yup = require('yup');
const { Op } = require('sequelize');
const { startOfHour, parseISO } = require('date-fns');
const Position = require('../models/Position');
const Company = require('../models/Company');
const Queue = require('../models/Queue');
// import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';

const Constants = require('../constants');

class PositionController {
  async index(req, res) {
    const { queue_id: queueId } = req.body;
    let positions;
    if (req.loggedUserType === Constants.USER_ROOT) {
      positions = await Position.findAll({
        where: { queue_id: queueId },
        include: [
          {
            model: Queue,
            as: 'queue',
            where: { company_id: req.loggedUserCompanyId }
          }
        ],
        order: [['queue_id', 'ASC'], ['arrived_at', 'ASC']]
      });
    } else {
      positions = await Position.findAll({
        include: [
          {
            model: Queue,
            as: 'queue',
            where: { company_id: req.loggedUserCompanyId }
          }
        ],
        order: [['queue_id', 'ASC'], ['arrived_at', 'ASC']]
      });
    }

    return res.json(positions);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      arrived_at: Yup.date().required(),
      name: Yup.string().required(),
      phone: Yup.number()
        .required()
        .positive(),
      email: Yup.string()
        .required()
        .email(),
      queue_id: Yup.number()
        .required()
        .positive()
        .integer()
    });
    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation failed' });

    const {
      arrived_at: arrivedAt,
      name,
      phone,
      email,
      queue_id: queueId
    } = req.body;

    if (parseISO(arrivedAt) === 'Invalid Date') {
      return res.status(400).json({ error: 'Invalid Date format' });
    }
    const company = await Company.findByPk(req.loggedUserCompanyId);
    if (!company)
      return res.status(400).json({ error: 'Company does not exists.' });

    const queue = await Queue.findByPk(queueId);
    if (!queue)
      return res.status(400).json({ error: 'Queue does not exists.' });
    if (queue.company_id !== req.loggedUserCompanyId) {
      return res
        .status(400)
        .json({ error: 'Queue does not exists (in this company).' });
    }

    const PositionAlreadyExists = await Position.findOne({
      where: {
        queue_id: queue.id,
        [Op.or]: [{ name }, { phone }, { email }]
      }
    });

    if (PositionAlreadyExists)
      return res
        .status(400)
        .json({ error: 'This position seems to already exist.' });

    if (parseISO(arrivedAt) === 'Invalid Date') {
      return res.status(400).json({ error: 'Data em formato invalido' });
    }

    const { id } = await Position.create(req.body);

    return res.json({ id, arrivedAt, name, phone, email, queueId });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      arrived_at: Yup.date(),
      name: Yup.string(),
      phone: Yup.number()
        .positive()
        .integer(),
      email: Yup.string().email()
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation failed' });

    const {
      arrived_at: newArrivedAt,
      name: newName,
      phone: newPhone,
      email: newEmail,
      queue_id: newQueueId
    } = req.body;

    if (newQueueId) {
      return res.status(400).json({ error: 'queue can not be changed' });
    }
    if (parseISO(newArrivedAt) === 'Invalid Date') {
      return res.status(400).json({ error: 'Invalid Date format' });
    }
    const company = await Company.findByPk(req.loggedUserCompanyId);
    if (!company)
      return res.status(400).json({ error: 'Company does not exists.' });

    const position = await Position.findByPk(req.params.id);
    if (!position) {
      return res.status(400).json({ error: 'Position does not exists.' });
    }

    const queue = await Queue.findByPk(position.queue_id);
    if (!queue) {
      return res
        .status(400)
        .json({ error: 'Queue of this position does not exists.' });
    }
    if (queue.company_id !== req.loggedUserCompanyId) {
      return res.status(400).json({
        error: 'Queue of this position does not exists (in this company).'
      });
    }

    if (newName && newName !== position.name) {
      const PositionWithSameNameExists = await Position.findOne({
        where: {
          name: newName,
          queue_id: position.queue_id
        }
      });

      if (PositionWithSameNameExists)
        return res.status(400).json({
          error: 'There is already a position with this name in this queue.'
        });
    }
    if (newPhone && newPhone !== position.phone) {
      const PositionWithSamePhoneExists = await Position.findOne({
        where: {
          phone: newPhone,
          queue_id: position.queue_id
        }
      });

      if (PositionWithSamePhoneExists)
        return res.status(400).json({
          error:
            'There is already a position with this phone number in this queue.'
        });
    }

    if (newEmail && newEmail !== position.email) {
      const PositionWithSameEmailExists = await Position.findOne({
        where: {
          email: newEmail,
          queue_id: position.queue_id
        }
      });

      if (PositionWithSameEmailExists)
        return res.status(400).json({
          error: 'There is already a position with this email in this queue.'
        });
    }

    const {
      id,
      arrived_at: arrivedAt,
      name,
      phone,
      email,
      queue_id: queueId
    } = await position.update(req.body);

    return res.json({ id, arrivedAt, name, phone, email, queueId });
  }

  async delete(req, res) {
    const company = await Company.findByPk(req.loggedUserCompanyId);
    if (!company)
      return res.status(400).json({ error: 'Company does not exists.' });

    const position = await Position.findByPk(req.params.id);
    if (!position) {
      return res.status(400).json({ error: 'Position does not exists.' });
    }
    const queue = await Queue.findByPk(position.queue_id);
    if (!queue) {
      return res
        .status(400)
        .json({ error: 'Queue of this position does not exists.' });
    }
    if (queue.company_id !== req.loggedUserCompanyId) {
      return res.status(400).json({
        error: 'Queue of this position does not exists (in this company).'
      });
    }

    const {
      id,
      arrived_at: arrivedAt,
      name,
      phone,
      email,
      queue_id: queueId
    } = position;
    await position.destroy();

    return res.json({ id, arrivedAt, name, phone, email, queueId });
  }
}

// export default new PositionController();
module.exports = new PositionController();
