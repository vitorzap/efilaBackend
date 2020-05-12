const Sequelize = require('sequelize');

const Company = require('../app/models/Company');
const User = require('../app/models/User');
const QueueType = require('../app/models/QueueType');
const Queue = require('../app/models/Queue');
const Position = require('../app/models/Position');

const { config: dbConfig } = require('../config/database');

const models = [Company, User, QueueType, Queue, Position];

class Database {
  constructor() {
    this.init();
  }

  async init() {
    console.log('Conectando a database');
    this.connection = new Sequelize(process.env.DATABASE_URL, dbConfig);
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));

    try {
      await this.connection.authenticate();
      console.log('Conectado ao database com sucesso !!!');
    } catch (error) {
      console.log('Conexão a database falhou ???', error);
    }
  }
}

// export default new Database()
module.exports = new Database();
