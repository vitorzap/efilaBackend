const { Router } = require('express');
const UserController = require('./app/controllers/UserController');
const CompanyController = require('./app/controllers/CompanyController');
const QueueTypeController = require('./app/controllers/QueueTypeController');
const QueueController = require('./app/controllers/QueueController');
const SessionController = require('./app/controllers/SessionController');
const PositionController = require('./app/controllers/PositionController');
//
const OpQueueController = require('./app/controllers/OpQueueController');
const OpPositionController = require('./app/controllers/OpPositionController');
//
const authMiddleware = require('./app/middleware/auth');
const isRootOrAdminMiddleware = require('./app/middleware/isRootOrAdmin');
const isRootMiddleware = require('./app/middleware/isRoot');

const routes = new Router();
// const upload = multer(multerConfig);

// Session
routes.get('/ping', SessionController.ping);
routes.post('/login', SessionController.login);

// Verifica autenticacáo
routes.use(authMiddleware);
// Verifica se é administrador ou root
routes.use(isRootOrAdminMiddleware);
// Change company
routes.put('/change', SessionController.change);
// Operation
routes.get('/opqueues', OpQueueController.index);
routes.post('/opqueues', OpQueueController.store);
routes.delete('/opqueues', OpQueueController.delete);
routes.get('/oppositions', OpPositionController.index);
routes.post('/oppositions', OpPositionController.enqueue);
routes.delete('/oppositions/:id', OpPositionController.dequeue);
// Users
routes.post('/users', UserController.store);
routes.get('/users', UserController.index);
routes.put('/users/:id', UserController.update);
routes.delete('/users/:id', UserController.delete);
// Queue Types
routes.get('/queuetypes', QueueTypeController.index);
routes.post('/queuetypes', QueueTypeController.store);
routes.put('/queuetypes/:id', QueueTypeController.update);
routes.delete('/queuetypes/:id', QueueTypeController.delete);
routes.get('/listqueuetypes', QueueTypeController.listqueuetypes);
// Queues
routes.get('/queues', QueueController.index);
routes.post('/queues', QueueController.store);
routes.put('/queues/:id', QueueController.update);
routes.delete('/queues/:id', QueueController.delete);
// Positions
routes.get('/positions', PositionController.index);
routes.post('/positions', PositionController.store);
routes.put('/positions/:id', PositionController.update);
routes.delete('/positions/:id', PositionController.delete);

// Companies
routes.get('/companies', CompanyController.index);
routes.get('/listcompanies', CompanyController.listcompanies);
// Verifica se é root
routes.use(isRootMiddleware);
//
routes.get('/companies/:id', CompanyController.getOne);
routes.post('/companies', CompanyController.store);
routes.put('/companies/:id', CompanyController.update);
routes.delete('/companies/:id', CompanyController.delete);

// export default routes;
module.exports = routes;
