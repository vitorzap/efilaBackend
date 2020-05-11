const jwt = require('jsonwebtoken');
const { promisify } = require('util');

const authConfig = require('../../config/auth');

// export default async (req, res, next) => {
module.exports = async (req, res, next) => {
  const headerAuthorization = req.headers.authorization;

  if (!headerAuthorization)
    return res.status(401).json({ error: 'Token não informado' });

  const [, token] = headerAuthorization.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    req.loggedUserId = decoded.loggedUserId;
    req.loggedUserCompanyId = decoded.finalLoggedUserCompanyId;
    req.loggedUserType = decoded.finalLoggedUserType;

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Usuario não autorizado' });
  }
};
