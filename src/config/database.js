const path = require('path');
require('dotenv').config();

console.log(process.env.DATABASE_HOST);

module.exports = function getDataBaseConfig() {
  console.log('getDataBaseConfig');
  const DbConfig = {
    dialect: 'postgres',
    dialectOptions: {
      ssl: true
    },
    host: '',
    database: '',
    username: '',
    password: '',

    define: {
      timestamp: true,
      underscored: true,
      underscoredAll: true,
      freezeTableName: false
    }
  };
  let envHost = process.env.DATABASE_HOST;
  let envDatabase = process.env.DATABASE_NAME;
  let envUsername = process.env.DATABASE_USER_NAME;
  let envPassword = process.env.DATABASE_USER_PASSWORD;
  if (process.env.DATABASE_URL) {
    let item2;
    let item3;
    const items = process.env.DATABASE_URL.split('//');
    [envUsername, item2, item3] = items[1].split(':');
    [envPassword, envHost] = item2.split('@');
    [, envDatabase] = item3.split('/');
  }
  console.log('=====> Config=', envHost, envDatabase, envUsername, envPassword);

  DbConfig.host = envHost;
  DbConfig.database = envDatabase;
  DbConfig.username = envUsername;
  DbConfig.password = envPassword;
  return DbConfig;
};
