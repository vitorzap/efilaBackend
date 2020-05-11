const Sequelize = require('sequelize');
const Company = require('../app/models/Company');
const User = require('../app/models/User');
const QueueType = require('../app/models/QueueType');
const Queue = require('../app/models/Queue');
const Position = require('../app/models/Position');

const databaseConfig = require('../config/databaselocal');
const localDatabaseConfig = require('../config/databaselocal');

const models = [Company, User, QueueType, Queue, Position];

class Database {
  constructor() {
    this.init();
  }

  async init() {
    console.log('Conectando a database Postgres - Remote');
    this.connection = new Sequelize(databaseConfig);
    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));

    try {
      await this.connection.authenticate();
      console.log('Conectado com sucesso a database remoto.');
    } catch (error1) {
      console.error(
        'Não foi possivel conexão a database Postgres - Remote:',
        error1
      );

      console.log('Conectando a database Postgres - Local');
      this.connection = new Sequelize(localDatabaseConfig);
      models
        .map(model => model.init(this.connection))
        .map(
          model => model.associate && model.associate(this.connection.models)
        );

      try {
        await this.connection.authenticate();
        console.log('Conectado com sucesso a database local.');
      } catch (error2) {
        console.error(
          'Não foi possivel conexão a database Postgres - Local:',
          error2
        );
      }
    }
  }
}

// export default new Database()
module.exports = new Database();
