const app = require('./app');
// import app from './app';

console.log('SERVER <=====================');

const port = process.env.PORT || 3333;
// const port = 8080;

console.log('SERVER PORT = ', port);

app.listen(port);
