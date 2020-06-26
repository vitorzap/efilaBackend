const Queue = require('../models/Queue');
const OpQueue = require('../models/OpQueue');
const OpPosition = require('../models/OpPosition');
const Constants = require('../constants');

class OpQueueController {
  async index(req, res) {
    const { company_id: companyId } = req.query;
    const wCompanyId =
      req.loggedUserType === Constants.USER_ROOT && companyId
        ? companyId
        : req.loggedUserCompanyId;
    await OpQueue.find(
      { company_id: wCompanyId },
      {},
      { sort: { description: 1 } },
      (err, result) => {
        if (err) {
          return res.status(400).json({ error: err.message });
        }
        return res.json(result);
      }
    );
  }

  async store(req, res) {
    await OpQueue.collection
      .deleteMany({ company_id: req.loggedUserCompanyId })
      .catch(err => {
        return res.status(400).json({ error: err.message });
      });
    await OpPosition.collection
      .deleteMany({ company_id: req.loggedUserCompanyId })
      .catch(err => {
        return res.status(400).json({ error: err.message });
      });
    const queues = await Queue.findAll({
      where: { company_id: req.loggedUserCompanyId },
      order: ['description']
    });
    const thisDate = new Date();
    const oqueues = queues.map(queue => {
      const oQueue = {};
      oQueue.today = thisDate;
      oQueue.queue_id = queue.id;
      oQueue.company_id = queue.company_id;
      oQueue.queue_type_id = queue.queue_type_id;
      oQueue.description = queue.description;
      oQueue.first_position = 0;
      oQueue.last_position = 0;
      oQueue.positions = 0;
      oQueue.wait = 0;
      return oQueue;
    });
    await OpQueue.collection.insertMany(oqueues).catch(err => {
      return res.status(400).json({ error: err.message });
    });
    req.io.emit(`startqueues${req.loggedUserCompanyId}`);
    return res.json(oqueues);
  }

  async delete(req, res) {
    await OpQueue.collection
      .deleteMany({ company_id: req.loggedUserCompanyId })
      .catch(err => {
        return res.status(400).json({ error: err.message });
      });
    await OpPosition.collection
      .deleteMany({ company_id: req.loggedUserCompanyId })
      .catch(err => {
        return res.status(400).json({ error: err.message });
      });
    return res.json({
      company_id: req.loggedUserCompanyId,
      message: 'exclusão ok'
    });
  }
}

module.exports = new OpQueueController();
