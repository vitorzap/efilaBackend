// const * as Yup from 'yup';
const Yup = require('yup');

const OpQueue = require('../models/OpQueue');
const OpPosition = require('../models/OpPosition');

class OpPositionController {
  async index(req, res) {
    let filter = {};
    const { queue_id: queueId } = req.body;
    if (!queueId) {
      filter = { company_id: req.loggedUserCompanyId };
    } else {
      filter = {
        $and: [{ company_id: req.loggedUserCompanyId }, { queue_id: queueId }]
      };
    }
    const positions = await OpPosition.find(
      filter,
      {},
      { sort: { queue_id: 1, position: 1 } },
      err => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
      }
    );
    return res.json(positions);
  }

  async enqueue(req, res) {
    console.log('1- ENQUEUE<== <== <== <== <== <==<==<==<==<==<==<==');
    const schema = Yup.object().shape({
      queue_id: Yup.number()
        .required()
        .positive()
        .integer(),
      // arrived_at: Yup.date().required(),
      name: Yup.string().required(),
      phone: Yup.string().required(),
      email: Yup.string()
        .required()
        .email()
    });
    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation failed' });

    console.log('1- ENQUEUE<== <== <== <== <== <==<==<==<==<==<==<==');
    const { queue_id: queueId, name, phone, email } = req.body;

    const opQueue = await OpQueue.findOne({
      $and: [{ company_id: req.loggedUserCompanyId }, { queue_id: queueId }]
    });
    if (!opQueue)
      return res.status(400).json({ error: 'Queue does not exists.' });

    const duplPosition = await OpPosition.findOne(
      {
        $and: [
          { company_id: req.loggedUserCompanyId },
          { queue_id: queueId },
          { $or: [{ phone }, { email }] }
        ]
      },
      err => {
        if (err) {
          return res.send(err);
        }
      }
    );
    if (duplPosition) {
      return res.status(400).json({
        error: 'Já existe posição na fila com este email ou numero de telefone.'
      });
    }

    const newFirstPosition =
      opQueue.first_position === 0 ? 1 : opQueue.first_position;
    const newLastPosition = opQueue.last_position + 1;
    const newPositions = opQueue.positions + 1;
    const opPosition = {
      company_id: req.loggedUserCompanyId,
      queue_id: queueId,
      arrived_at: new Date(),
      name,
      phone,
      email,
      position: newLastPosition
    };

    const returnObj = {};
    OpPosition.create(opPosition, (err1, result1) => {
      if (err1) {
        return res.send(err1);
      }
      returnObj.opPosition = result1;
      OpQueue.findOneAndUpdate(
        {
          $and: [{ company_id: req.loggedUserCompanyId }, { queue_id: queueId }]
        },
        {
          first_position: newFirstPosition,
          last_position: newLastPosition,
          positions: newPositions
        },
        { new: true, useFindAndModify: false },
        (err2, result2) => {
          if (err2) {
            return res.send(err2);
          }
          returnObj.opQueue = {
            _id: result2._id,
            queue_id: result2.queue_id,
            first_position: result2.first_position,
            last_position: result2.last_position,
            positions: result2.positions
          };
          console.log('EMIT ===> ', `enqueue${req.loggedUserCompanyId}`);
          req.io.emit(`enqueue${req.loggedUserCompanyId}`, returnObj);
          return res.json(returnObj);
        }
      );
    });
  }

  async dequeue(req, res) {
    console.log('1- DEQUEUE<== <== <== <== <== <==<==<==<==<==<==<==');
    const opQueue = await OpQueue.findById(req.params.id);
    if (!opQueue)
      return res.status(400).json({ error: 'Queue does not exists.' });
    if (opQueue.company_id !== req.loggedUserCompanyId) {
      return res
        .status(400)
        .json({ error: 'Queue does not exist in your company.' });
    }
    console.log('opQueue._id', opQueue._id);
    const opPosition = await OpPosition.findOne({
      $and: [
        { company_id: req.loggedUserCompanyId },
        { queue_id: opQueue.queue_id },
        { position: opQueue.first_position }
      ]
    });
    if (!opPosition) {
      return res.status(400).json({ error: 'Position does not exists.' });
    }
    console.log('opPosition', opPosition._id, opPosition.position);

    const newFirstPosition = opQueue.first_position + 1;
    const newPositions = opQueue.positions - 1;
    const served_at = new Date();
    const timeElapsed = Math.abs(
      served_at.getTime() - opPosition.arrived_at.getTime()
    );
    let newWait = 0;
    if (opQueue.wait > 0) {
      newWait = (opQueue.wait + timeElapsed) / newPositions;
    } else {
      newWait = timeElapsed;
    }
    console.log(
      'Entrada=',
      opPosition.arrived_at.toLocaleString('pt-BR', { timeZone: 'UTC' })
    );
    console.log(
      'Saida  =',
      served_at.toLocaleString('pt-BR', { timeZone: 'UTC' })
    );
    const days = Math.floor(timeElapsed / (1000 * 60 * 60 * 24));
    let resto = timeElapsed % (1000 * 60 * 60 * 24);
    const horas = Math.floor(resto / (1000 * 60 * 60));
    resto = timeElapsed % (1000 * 60 * 60);
    const minutos = Math.ceil(resto / (1000 * 60));
    console.log('Espera', days, horas, minutos);

    const returnObj = {};
    OpPosition.deleteOne({ _id: opPosition._id }, err1 => {
      if (err1) {
        return res.send(err1);
      }
      returnObj.opPosition = { _id: opPosition._id };
      OpQueue.findByIdAndUpdate(
        req.params.id,
        {
          first_position: newFirstPosition,
          positions: newPositions
        },
        { new: true, useFindAndModify: false },
        (err2, result2) => {
          if (err2) {
            return res.send(err2);
          }
          returnObj.opQueue = {
            _id: result2._id,
            queue_id: result2.queue_id,
            first_position: result2.first_position,
            positions: result2.positions,
            wait: newWait
          };

          console.log('EMIT ===> ', `dequeue${req.loggedUserCompanyId}`);
          req.io.emit(`dequeue${req.loggedUserCompanyId}`, returnObj);
          return res.json(returnObj);
        }
      );
    });
  }
}

module.exports = new OpPositionController();
