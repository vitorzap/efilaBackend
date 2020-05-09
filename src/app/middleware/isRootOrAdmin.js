// import Constants from '../constants';
const Constants = require('../constants');

// export default async (req, res, next) => {
module.exports = async (req, res, next) => {
  if (req.loggedUserType === Constants.USER_ORDINARY)
    return res
      .status(401)
      .json({ error: 'Operation forbidden for this type of user *' });
  console.log('passou =====check Is ROOT or Admin=========================');
  return next();
};