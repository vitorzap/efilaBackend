const mongoose = require('mongoose');

class CacheMongo {
  constructor() {
    this.init();
  }

  async init() {
    console.log('Conectando a database MONGO');
    mongoose
      .connect(process.env.MONGODB, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      .then(() => console.log('Conectado ao database MONGDB com sucesso !!!'))
      .catch(err => {
        console.log('Conexão a database MONGODB falhou ???', err.message);
      });
  }
}

module.exports = new CacheMongo();
