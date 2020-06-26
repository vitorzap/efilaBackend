// import Constants from '../constants';
const Constants = require('../constants');

// export default async (req, res, next) => {
module.exports = async (req, res, next) => {
  if (req.loggedUserType !== Constants.USER_ROOT)
    return res
      .status(401)
      .json({ error: 'Usuário não autorizado para esta operação #' });
  return next();
};
