module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('queues', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        allowNull: false,
        autoIncrement: true
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      posicoes: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      espera: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id'
        }
      },
      queue_type_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'queue_types',
          key: 'id'
        }
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('queues');
  }
};
