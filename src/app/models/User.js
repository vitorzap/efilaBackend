// import Sequelize, { Model } from 'sequelize';
const Sequelize = require('sequelize');
const { Model } = require('sequelize');
// import bcrypt from 'bcryptjs';
const bcrypt = require('bcryptjs');

class User extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        password: Sequelize.VIRTUAL,
        password_hash: Sequelize.STRING,
        is_root: Sequelize.BOOLEAN,
        company_id: Sequelize.INTEGER
      },
      { sequelize }
    );

    this.addHook('beforeSave', async user => {
      if (user.password) {
        user.password_hash = await bcrypt.hash(user.password, 8);
      }
    });
    return this;
  }

  static associate(models) {
    this.belongsTo(models.Company, { foreignKey: 'company_id', as: 'company' });
  }

  checkPassword(password) {
    return bcrypt.compare(password, this.password_hash);
  }
}

// export default User;
module.exports = User;
