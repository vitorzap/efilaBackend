import Sequelize, { Model } from 'sequelize';

class Queue extends Model {
  static init(sequelize) {
    super.init(
      {
        description: Sequelize.STRING,
        posicoes: Sequelize.INTEGER,
        espera: Sequelize.INTEGER,
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

export default Queue;
