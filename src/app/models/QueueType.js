// import Sequelize, { Model } from 'sequelize';
const Sequelize = require('sequelize');
const { Model } = require('sequelize');

class QueueType extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.STRING,
        company_id: Sequelize.INTEGER
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
    this.hasMany(models.Queue, { as: 'queues' });
  }
}

// export default QueueType;
module.exports = QueueType;
