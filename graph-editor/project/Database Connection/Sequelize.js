const { Sequelize } = require('sequelize');

let db;

function main() {
  return db;
}

function start({config}) {
  config = config();

  console.log(config);

  db = new Sequelize(config.databaseName, config.userName, config.password, {
    dialect: config.dialect,
    storage: config.storage
  });
}

export default { main, start };
