module.exports = {
  url: 'postgres://postgres:docker@localhost:5432/eQueue',
  config: {
    dialect: 'postgres',
    define: {
      timestamp: true,
      underscored: true,
      underscoredAll: true,
      freezeTableName: false
    }
  }
};
