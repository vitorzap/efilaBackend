module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('companies', 'cgc', {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn('companies', 'cgc', {
      type: Sequelize.STRING,
      allowNull: false
    });
  }
};
