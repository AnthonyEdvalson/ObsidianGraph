const { DataTypes } = require('sequelize');

let table;

function main({config, db}) {
  return table;
}

function start({config, db}) {
  config = config();
  db = db();

  let columns = {};

  for (let colDef of config.columns) {
    columns[colDef.name] = {
      type:         DataTypes[colDef.type],
      defaultValue: colDef.defaultValue,
      allowNull:    colDef.allowNull,
      primaryKey:   colDef.primaryKey
    }
  }

  table = db.define(config.name, columns, {
    timestamps: config.timestamps
  });

  table.sync();
}

export default { main, start };
