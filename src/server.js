const app = require('./app');

app.on('connection', socket => {
  console.log(`Socket conectado: ${socket.id}`);
});

const port = process.env.PORT || 3333;

app.listen(port, () => console.log(`Server port = (${port})`));
