// import Constants from '../constants';
const Constants = require('../constants');

// export default async (req, res, next) => {
module.exports = async (req, res, next) => {
  if (req.loggedUserType !== Constants.USER_ROOT)
    return res
      .status(401)
      .json({ error: 'Operation forbidden for this type of user #' });
  console.log('passou =========================================');
  return next();
};
