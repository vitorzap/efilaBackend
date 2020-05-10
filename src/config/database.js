module.exports = {
  dialect: 'postgres',
  dialectOptions: {
    ssl: true
  },
  host: 'ec2-54-81-37-115.compute-1.amazonaws.com',
  username: 'sgtxzajrpgjyth',
  password: '8418add9f25f9b5218f59782bfe3be3be5925624a588caa7a4af8676d3c75ac7',
  database: 'db7isbfgi7h2in',
  define: {
    timestamp: true,
    underscored: true,
    underscoredAll: true,
    freezeTableName: false
  }
};
// module.exports = {
//   dialect: 'postgres',
//   host: 'localhost',
//   username: 'postgres',
//   password: 'docker',
//   database: 'eQueue',
//   define: {
//     timestamp: true,
//     underscored: true,
//     underscoredAll: true,
//     freezeTableName: false
//   }
// };
