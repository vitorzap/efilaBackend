require('dotenv').config();
const app = require('./app');

console.log('Database:', process.env.DATABASE_HOST);

const port = process.env.PORT || 3333;

console.log(`Server port = (${port})`);

app.listen(port);
