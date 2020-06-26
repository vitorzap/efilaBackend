// import * as Yup from 'yup';
const Yup = require('yup');
const User = require('../models/User');
const Company = require('../models/Company');
const Constants = require('../constants');

class UserController {
  async index(req, res) {
    let users;
    const { page = 1, sort = 'name' } = req.query;
    const includeCompany = { model: Company, as: 'company' };
    const sortEspec =
      sort.substring(0, sort.indexOf('.')) === 'company'
        ? [includeCompany, sort.substring(sort.indexOf('.') + 1), 'ASC']
        : sort;

    if (req.loggedUserType === Constants.USER_ROOT) {
      users = await User.findAndCountAll({
        include: [includeCompany],
        order: [sortEspec],
        limit: Constants.ROWS_PER_PAGE,
        offset: (page - 1) * Constants.ROWS_PER_PAGE
      });
    } else {
      users = await User.findAndCountAll({
        where: { company_id: req.loggedUserCompanyId },
        include: [includeCompany],
        order: [sortEspec],
        limit: Constants.ROWS_PER_PAGE,
        offset: (page - 1) * Constants.ROWS_PER_PAGE
      });
    }
    users.perpage = Constants.ROWS_PER_PAGE;
    return res.json(users);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      password: Yup.string()
        .required()
        .min(6),
      confirmPassword: Yup.string()
        .required()
        .oneOf([Yup.ref('password'), null]),
      company_id: Yup.number()
        .required()
        .positive()
        .integer(),
      is_root: Yup.boolean()
    });
    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Dados não válidos.' });

    const AnotherUserSameEmailExists = await User.findOne({
      where: { email: req.body.email }
    });
    if (AnotherUserSameEmailExists)
      return res.status(400).json({ error: 'Usuário já existente.' });

    let company;
    if (req.loggedUserType === Constants.USER_ROOT) {
      company = await Company.findByPk(req.body.company_id);
    } else {
      company = await Company.findByPk(req.loggedUserCompanyId);
    }
    if (!company)
      return res
        .status(400)
        .json({ error: 'Empresa do usuário não cadastrada.' });

    const { name: companyName } = company;

    const {
      id,
      name,
      email,
      company_id: companyId,
      is_root: isRoot
    } = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      is_root: req.body.is_root,
      company_id: company.id
    });

    return res.json({
      id,
      name,
      email,
      isRoot,
      companyId,
      companyName
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
      is_root: Yup.boolean()
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Dados não válidos' });

    // const { email: newEmail, oldPassword, company_id: newCompanyId } = req.body;
    const { email: newEmail, oldPassword, company_id: newCompanyId } = req.body;
    if (newCompanyId) {
      return res.status(400).json({ error: 'Empresa não pode ser alterada.' });
    }

    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(400).json({ error: 'Usuário não cadastrado.' });
    }

    if (newEmail && newEmail !== user.email) {
      const AnotherUserSameEmailExists = await User.findOne({
        where: { email: newEmail }
      });
      if (AnotherUserSameEmailExists)
        return res.status(400).json({ error: 'Usuário já cadastrado.' });
    }

    if (oldPassword && !(await user.checkPassword(oldPassword)))
      return res.status(401).json({ error: 'Senha não confere.' });

    const {
      id,
      name,
      email,
      company_id: companyId,
      is_root: isRoot
    } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      isRoot,
      companyId
    });
  }

  async delete(req, res) {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(400).json({ error: 'Usuário não cadatrado.' });
    }

    if (req.loggedUserType !== Constants.USER_ROOT) {
      if (user.company_id !== req.loggedUserCompanyId) {
        return res
          .status(400)
          .json({ error: 'Usuário não cadastrado (nesta empresa).' });
      }
    }
    const { id, name, email, is_root: isRoot, company_id: companyId } = user;
    await user.destroy();

    return res.json({
      id,
      name,
      email,
      isRoot,
      companyId
    });
  }
}

// export default new UserController();
module.exports = new UserController();
