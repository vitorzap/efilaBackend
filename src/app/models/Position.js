// import Sequelize, { Model } from 'sequelize';
const Sequelize = require('sequelize');
const { Model } = require('sequelize');

class Position extends Model {
  static init(sequelize) {
    super.init(
      {
        arrived_at: Sequelize.DATE,
        name: Sequelize.STRING,
        phone: Sequelize.STRING,
        email: Sequelize.STRING,
        queue_id: Sequelize.INTEGER
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Queue, {
      foreignKey: 'queue_id',
      as: 'queue'
    });
  }
}

// export default Position;
module.exports = Position;
