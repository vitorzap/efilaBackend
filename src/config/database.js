module.exports = {
  dialect: 'postgres',
  dialectOptions: {
    ssl: true
  },
  host: 'ec2-54-217-204-34.eu-west-1.compute.amazonaws.com',
  username: 'msxkivqjdxdbao',
  password: 'dd9d8af288ea982cc3d2a67dc8018e07fee4426ae0f095944af127eddf7e8b0f',
  database: 'd81sm4vf6l7fc1',
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
