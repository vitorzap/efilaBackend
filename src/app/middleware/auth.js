import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const headerAuthorization = req.headers.authorization;

  if (!headerAuthorization)
    return res.status(401).json({ error: 'Token not provided' });

  const [, token] = headerAuthorization.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);
    req.loggedUserId = decoded.loggedUserId;
    req.loggedUserCompanyId = decoded.finalLoggedUserCompanyId;
    req.loggedUserType = decoded.finalLoggedUserType;

    console.log('***********************************');
    console.log('User ------------------------------');
    console.log(`UserId=${req.loggedUserId}`);
    console.log(`UserType=${req.loggedUserType}`);
    console.log(`UserCompanyId=${req.loggedUserCompanyId}`);
    console.log('-----------------------------------');
    console.log('***********************************');

    return next();
  } catch (error) {
    return res.status(401).json({ error: 'Usuario não autorizado' });
  }
};
