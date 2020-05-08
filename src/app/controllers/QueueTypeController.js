import * as Yup from 'yup';
import QueueType from '../models/QueueType';
import Company from '../models/Company';
import Queue from '../models/Queue';
import Constants from '../constants';

class QueueTypeController {
  async index(req, res) {
    let queueTypes;
    const { page = 1, sort = 'description' } = req.query;
    const includeCompany = { model: Company, as: 'company' };
    const sortEspec =
      sort.substring(0, sort.indexOf('.')) === 'company'
        ? [includeCompany, sort.substring(sort.indexOf('.') + 1), 'ASC']
        : sort;
    console.log('sortEpec', sortEspec, sort);
    if (req.loggedUserType === Constants.USER_ROOT) {
      queueTypes = await QueueType.findAndCountAll({
        include: [includeCompany],
        // order: [sortEspec || 'description'],
        order: [sortEspec],
        limit: Constants.ROWS_PER_PAGE,
        offset: (page - 1) * Constants.ROWS_PER_PAGE
      });
    } else {
      queueTypes = await QueueType.findAndCountAll({
        where: { company_id: req.loggedUserCompanyId },
        include: [includeCompany],
        order: [sortEspec],
        limit: Constants.ROWS_PER_PAGE,
        offset: (page - 1) * Constants.ROWS_PER_PAGE
      });
    }
    queueTypes.perpage = Constants.ROWS_PER_PAGE;
    return res.json(queueTypes);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string().required(),
      company_id: Yup.number()
        .required()
        .positive()
        .integer()
    });
    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation failed' });

    const QueueTypeWithSameDescriptionExists = await QueueType.findOne({
      where: {
        description: req.body.description,
        company_id: req.loggedUserCompanyId
      }
    });

    if (QueueTypeWithSameDescriptionExists)
      return res
        .status(400)
        .json({ error: 'There is already QueueType with this description.' });

    //      const company = await Company.findByPk(req.body.company_id);
    let company;
    if (req.loggedUserType === Constants.USER_ROOT) {
      company = await Company.findByPk(req.body.company_id);
    } else {
      company = await Company.findByPk(req.loggedUserCompanyId);
    }
    if (!company)
      return res
        .status(400)
        .json({ error: 'Queue type company does not exists.' });

    const { name: companyName } = company;

    const { id, description, company_id: companyId } = await QueueType.create({
      description: req.body.description,
      company_id: company.id
    });

    return res.json({ id, description, companyId, companyName });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string()
      // ,
      // company_id: Yup.number()
      //   .positive()
      //   .integer()
    });

    if (!(await schema.isValid(req.body)))
      return res.status(400).json({ error: 'Validation failed' });

    const { description: newDescription, company_id: newCompanyId } = req.body;
    if (newCompanyId) {
      return res.status(400).json({ error: 'Company can not be changed.' });
    }

    const queueType = await QueueType.findByPk(req.params.id);
    if (!queueType) {
      return res.status(400).json({ error: 'Queue type does not exists.' });
    }
    if (req.loggedUserType !== Constants.USER_ROOT) {
      if (queueType.company_id !== req.loggedUserCompanyId) {
        return res
          .status(400)
          .json({ error: 'Queue type does not exists (in this company).' });
      }
    }

    if (newDescription && newDescription !== queueType.description) {
      const queueTypeWithSameDescriptionExists = await QueueType.findOne({
        where: {
          description: newDescription,
          company_id: req.loggedUserCompanyId
        }
      });

      if (queueTypeWithSameDescriptionExists)
        return res.status(400).json({
          error: 'There is already Queue type with this description.'
        });
    }

    // if (newCompanyId && newCompanyId !== queueType.company_id) {
    //   const company = await Company.findByPk(req.body.company_id);
    //   if (!company)
    //     return res.status(400).json({ error: 'Company does not exists.' });
    // }
    const { id, description, company_id: companyId } = await queueType.update(
      req.body
    );

    return res.json({ id, description, companyId });
  }

  async delete(req, res) {
    const queueType = await QueueType.findByPk(req.params.id);
    if (!queueType) {
      return res.status(400).json({ error: 'QueueType does not exists.' });
    }
    if (queueType.company_id !== req.loggedUserCompanyId) {
      return res
        .status(400)
        .json({ error: 'Queue type does not exists (in this company).' });
    }

    const queue = await Queue.findOne({
      where: { queue_type_id: req.params.id }
    });
    if (queue) {
      return res.status(400).json({
        error: 'There is at least one queue linked to this queue type.'
      });
    }

    const { id, description, company_id: companyId } = queueType;
    await queueType.destroy();

    return res.json({ id, description, companyId });
  }
}

export default new QueueTypeController();
