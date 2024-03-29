require('dotenv').config();

const Yup = require('yup');
const jwt = require('jsonwebtoken');

const User = require('../models/User');
const Company = require('../models/Company');
const Constants = require('../constants');

class SessionController {
  async ping(req, res) {
    return res.json({
      Hello: {
        id: 'eFila',
        msg: 'Ready to work'
      }
    });
  }

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

    let finalLoggedUserType;
    if (loggedUserCompanyIsRoot) {
      finalLoggedUserType = loggedUserIsRoot
        ? Constants.USER_ROOT
        : Constants.USER_ORDINARY;
    } else {
      finalLoggedUserType = loggedUserIsRoot
        ? Constants.USER_LOCALROOT
        : Constants.USER_ORDINARY;
    }

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
        process.env.AUTH_SECRET,
        {
          expiresIn: process.env.AUTH_EXPIRES_IN
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
          process.env.AUTH_SECRET,
          {
            expiresIn: process.env.AUTH_EXPIRES_IN
          }
        )
      }
    });
  }
}

// export default new SessionController();
module.exports = new SessionController();
