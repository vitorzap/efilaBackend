const Sequelize = require('sequelize');

const Company = require('../app/models/Company');
const User = require('../app/models/User');
const QueueType = require('../app/models/QueueType');
const Queue = require('../app/models/Queue');
const Position = require('../app/models/Position');

// const getDatabaseConfig = require('../config/database');

// const databaseConfig = getDatabaseConfig();

const databaseConfig = require('../config/databaseX');

console.log('databaseConfig', databaseConfig);

const models = [Company, User, QueueType, Queue, Position];
console.log('initDatabase');
class Database {
  constructor() {
    this.init();
  }

  async init() {
    console.log('Conectando a database Postgres', databaseConfig);
    this.connection = new Sequelize(databaseConfig);
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));

    try {
      await this.connection.authenticate();
      console.log('Conectado com sucesso a database Postgres');
    } catch (error) {
      console.log('Não foi possivel conexão a database Postgres', error);
    }
  }
}

// export default new Database()
module.exports = new Database();
