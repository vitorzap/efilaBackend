require('dotenv').config();

const express = require('express');
const cors = require('cors');
require('./databases/dbPostgres');
require('./databases/dbMongo');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const routes = require('./routes');

app.use((req, res, next) => {
  console.log('req.io = io');
  req.io = io;
  next();
});

app.use(cors());
app.use(express.json());
app.use(routes);

io.on('connection', socket => {
  console.log(`Socket conectado: ${socket.id}`);
});

const port = process.env.PORT || 3333;
server.listen(port, () => console.log(`Server port = (${port})`));
