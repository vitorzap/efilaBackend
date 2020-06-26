// import Constants from '../constants';
const Constants = require('../constants');

module.exports = async (req, res, next) => {
  if (req.loggedUserType === Constants.USER_ORDINARY)
    return res
      .status(401)
      .json({ error: 'Usuário não autorizado para esta operação *' });
  return next();
};
