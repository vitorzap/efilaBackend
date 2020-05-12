module.exports = {
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
