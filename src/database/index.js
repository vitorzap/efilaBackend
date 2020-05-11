const Sequelize = require('sequelize');

const connectionUrl =
  'dbname=db7isbfgi7h2in host=ec2-54-81-37-115.compute-1.amazonaws.com port=5432 user=sgtxzajrpgjyth password=8418add9f25f9b5218f59782bfe3be3be5925624a588caa7a4af8676d3c75ac7 sslmode=require';
// 'postgres://sgtxzajrpgjyth:8418add9f25f9b5218f59782bfe3be3be5925624a588caa7a4af8676d3c75ac7@ec2-54-81-37-115.compute-1.amazonaws.com:5432/db7isbfgi7h2i';

const Company = require('../app/models/Company');
const User = require('../app/models/User');
const QueueType = require('../app/models/QueueType');
const Queue = require('../app/models/Queue');
const Position = require('../app/models/Position');

const databaseConfig = require('../config/database');
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
