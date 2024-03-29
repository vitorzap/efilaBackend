// import Sequelize, { Model } from 'sequelize';
const Sequelize = require('sequelize');
const { Model } = require('sequelize');

class Queue extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.STRING,
        positions: Sequelize.INTEGER,
        wait: Sequelize.INTEGER,
        company_id: Sequelize.INTEGER,
        queue_type_id: Sequelize.INTEGER
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    this.belongsTo(models.QueueType, {
      foreignKey: 'queue_type_id',
      as: 'queue_type'
    });
  }
}

// export default Queue;
module.exports = Queue;
