module.exports = {
  dialect: 'postgres',
  host: 'localhost',
  username: 'postgres',
  password: 'docker',
  database: 'eQueue',
  define: {
    timestamp: true,
    underscored: true,
    underscoredAll: true,
    freezeTableName: false
  }
};
