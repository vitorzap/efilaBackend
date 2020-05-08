import jwt from 'jsonwebtoken';
import * as Yup from 'yup';

import User from '../models/User';
import Company from '../models/Company';
import authConfig from '../../config/auth';
import Constants from '../constants';

class SessionController {
  async login(req, res) {
    const schema = Yup.object().shape({
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string().required(),
      company_id: Yup.number()
        .positive()
        .integer()
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation failed' });

    const { email, password, company_id: alterCompanyId } = req.body;

    const user = await User.findOne({
      where: { email },
      include: [{ model: Company, as: 'company' }],
      order: ['name']
    });

    if (!user) return res.status(401).json({ error: 'User not found.' });

    if (!(await user.checkPassword(password)))
      return res.status(401).json({ error: 'Password does not match.' });

    const {
      id: loggedUserId,
      name: loggedUserName,
      email: loggedUserEmail,
      is_root: loggedUserIsRoot,
      company_id: loggedUserCompanyId
    } = user;
    const {
      name: loggedUserCompanyName,
      is_root: loggedUserCompanyIsRoot
    } = user.company;
    console.log(`loggedUserIsRoot = ${loggedUserIsRoot}`);
    console.log(`loggedUserCompanyIsRoot = ${loggedUserCompanyIsRoot}`);

    let finalLoggedUserType;
    if (loggedUserCompanyIsRoot) {
      console.log('Root company');
      finalLoggedUserType = loggedUserIsRoot
        ? Constants.USER_ROOT
        : Constants.USER_ORDINARY;
    } else {
      console.log('Commom company');
      finalLoggedUserType = loggedUserIsRoot
        ? Constants.USER_LOCALROOT
        : Constants.USER_ORDINARY;
    }

    console.log(`finalLoggedUserType = ${finalLoggedUserType}`);

    let finalLoggedUserCompanyId = loggedUserCompanyId;
    let finalLoggedUserCompanyName = loggedUserCompanyName;
    if (alterCompanyId) {
      if (finalLoggedUserType !== Constants.USER_ROOT) {
        return res
          .status(401)
          .json({ error: 'Change company is not permited for this user' });
      }
      const alterCompany = await Company.findByPk(alterCompanyId);
      if (!alterCompany) {
        return res
          .status(401)
          .json({ error: 'Company target does not exists' });
      }
      finalLoggedUserCompanyId = alterCompanyId;
      finalLoggedUserCompanyName = alterCompany.name;
      finalLoggedUserType = Constants.USER_LOCALROOT;
    }

    console.log(`finalLoggedUserType = ${finalLoggedUserType}`);

    return res.json({
      loggedUser: {
        id: loggedUserId,
        name: loggedUserName,
        email: loggedUserEmail,
        type: finalLoggedUserType,
        company_id: finalLoggedUserCompanyId,
        company_name: finalLoggedUserCompanyName
      },
      token: jwt.sign(
        {
          loggedUserId,
          finalLoggedUserType,
          finalLoggedUserCompanyId
        },
        authConfig.secret,
        {
          expiresIn: authConfig.expiresIn
        }
      )
    });
  }

  async change(req, res) {
    const schema = Yup.object().shape({
      company_id: Yup.number()
        .required()
        .positive()
        .integer()
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation failed' });
    console.log(req.body);

    const user = await User.findByPk(req.loggedUserId);
    if (!user) {
      return res
        .status(400)
        .json({ error: 'Logged user does not exists ????' });
    }
    const company = await Company.findByPk(user.company_id);
    if (!company) {
      return res
        .status(400)
        .json({ error: 'Company of Logged user does not exists ????' });
    }
    if (!user.is_root || !company.is_root) {
      return res
        .status(401)
        .json({ error: 'Change company is not permited for this user' });
    }

    const { company_id: alterCompanyId } = req.body;
    const alterCompany = await Company.findByPk(alterCompanyId);
    if (!alterCompany) {
      return res.status(401).json({ error: 'Company target does not exists' });
    }
    return res.json({
      user: {
        loggedUser: {
          id: user.id,
          name: user.name,
          email: user.email,
          type: req.loggedUserType,
          company_id: alterCompanyId,
          company_name: alterCompany.name
        },
        token: jwt.sign(
          {
            loggedUserId: req.loggedUserId,
            finalLoggedUserCompanyId: alterCompanyId,
            finalLoggedUserType: req.loggedUserType
          },
          authConfig.secret,
          {
            expiresIn: authConfig.expiresIn
          }
        )
      }
    });
  }
}

export default new SessionController();
