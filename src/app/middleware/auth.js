const jwt = require('jsonwebtoken');
const { promisify } = require('util');

module.exports = async (req, res, next) => {
  const headerAuthorization = req.headers.authorization;
  console.log('headerAuthorization <== <=== <== <===');
  console.log('headerAuthorization 2', headerAuthorization);

  if (!headerAuthorization) {
    console.log('Token não informado');
    return res.status(401).json({ error: 'Token não informado' });
  }

  const [, token] = headerAuthorization.split(' ');
  console.log('token', token);

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.AUTH_SECRET);
    req.loggedUserId = decoded.loggedUserId;
    req.loggedUserCompanyId = decoded.finalLoggedUserCompanyId;
    req.loggedUserType = decoded.finalLoggedUserType;
    console.log('req.loggedUserId', req.loggedUserId);
    console.log('req.loggedUserCompanyId', req.loggedUserCompanyId);
    console.log('req.loggedUserType', req.loggedUserType);

    return next();
  } catch (error) {
    console.log('Token não informado');
    return res.status(401).json({ error: 'Usuario não autorizado' });
  }
  // req.loggedUserId = 15;
  // req.loggedUserCompanyId = 3;
  // req.loggedUserType = 2;
  // return next();
};
