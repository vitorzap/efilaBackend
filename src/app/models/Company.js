import Sequelize, { Model } from 'sequelize';

class Company extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        is_root: Sequelize.BOOLEAN
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.hasMany(models.User, { as: 'users' });
    this.hasMany(models.QueueType, { as: 'queue_types' });
    this.hasMany(models.Queue, { as: 'queues' });
  }
}

export default Company;
