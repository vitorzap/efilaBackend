module.exports = {
  dialect: 'postgres',
  url: process.env.DATABASE_URL,
  define: {
    timestamp: true,
    underscored: true,
    underscoredAll: true,
    freezeTableName: false
  }
};

// host: 'localhost',
// username: 'postgres',
// password: 'docker',
// database: 'eQueue',
// url: 'postgres://postgres:docker@localhost:5432/eQueue',
