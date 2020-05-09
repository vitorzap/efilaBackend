const Sequelize = require('sequelize');
const Company = require('../app/models/Company');
const User = require('../app/models/User');
const QueueType = require('../app/models/QueueType');
const Queue = require('../app/models/Queue');
const Position = require('../app/models/Position');

const databaseConfig = require('../config/database');

const models = [Company, User, QueueType, Queue, Position];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

// export default new Database()
module.exports = new Database();
