// import * as Yup from 'yup';
const Yup = require('yup');
const Company = require('../models/Company');
const User = require('../models/User');
const QueueType = require('../models/QueueType');
const Constants = require('../constants');

class CompanyController {
  async index(req, res) {
    let companies;
    const { page = 1, sort = 'name' } = req.query;
    if (req.loggedUserType === Constants.USER_ROOT) {
      companies = await Company.findAndCountAll({
        order: [sort || 'name'],
        limit: Constants.ROWS_PER_PAGE,
        offset: (page - 1) * Constants.ROWS_PER_PAGE
      });
      companies.perpage = Constants.ROWS_PER_PAGE;
    } else {
      companies = await Company.findByPk(req.loggedUserCompanyId);
    }

    return res.json(companies);
  }

  async listcompanies(req, res) {
    let companies;
    if (req.loggedUserType === Constants.USER_ROOT) {
      companies = await Company.findAll({
        attributes: ['id', 'name'],
        order: ['name']
      });
    } else {
      companies = await Company.findByPk(req.loggedUserCompanyId);
    }
    return res.json(companies);
  }

  async getOne(req, res) {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(400).json({ error: 'Empresa não existe.' });
    }

    const { id, name, email, is_root } = company;

    return res.json({
      id,
      name,
      email,
      is_root
    });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      is_root: Yup.boolean()
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Dados invalidos' });

    const companyWithSameEmailExists = await Company.findOne({
      where: { email: req.body.email }
    });

    if (companyWithSameEmailExists)
      return res
        .status(400)
        .json({ error: 'Já existe uma empresa com este email.' });

    if (req.body.is_root === true) {
      const companyRootAlreadyExists = await Company.findOne({
        where: { is_root: req.body.is_root }
      });

      if (companyRootAlreadyExists)
        return res.status(400).json({ error: 'Já existe uma empresa raiz.' });
    }

    const { id, name, email, is_root: isRoot } = await Company.create(req.body);

    return res.json({
      id,
      name,
      email,
      isRoot
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email()
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Dados invalidos' });

    const { email: newEmail, is_root: newIsRoot } = req.body;

    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(400).json({ error: 'Empresa não existe.' });
    }

    if (newEmail && newEmail !== company.email) {
      const companyWithSameEmailExists = await Company.findOne({
        where: { email: newEmail }
      });

      if (companyWithSameEmailExists)
        return res
          .status(400)
          .json({ error: 'Já existe uma empresa com este email.' });
    }
    if (newIsRoot === true && newIsRoot !== company.is_root) {
      const companyRootAlreadyExists = await Company.findOne({
        where: { is_root: newIsRoot }
      });

      if (companyRootAlreadyExists)
        return res.status(400).json({ error: 'Já existe uma empresa raiz.' });
    }
    const { id, name, email, is_root: isRoot } = await company.update(req.body);

    return res.json({
      id,
      name,
      email,
      isRoot
    });
  }

  async delete(req, res) {
    const company = await Company.findByPk(req.params.id);
    if (!company) {
      return res.status(400).json({ error: 'Empresa não existe.' });
    }

    const queueType = await QueueType.findOne({
      where: { company_id: req.params.id }
    });
    if (queueType) {
      return res.status(400).json({
        error: 'Existe pelo menos uma fila ligada a esta empresa.'
      });
    }

    const user = await User.findOne({
      where: { company_id: req.params.id }
    });
    if (user) {
      return res
        .status(400)
        .json({ error: 'Existe pelo menos um usuário ligado a esta empresa.' });
    }
    const { id, name, email, is_root: isRoot } = company;
    await company.destroy();

    return res.json({
      id,
      name,
      email,
      isRoot
    });
  }
}

// export default new CompanyController();
module.exports = new CompanyController();
