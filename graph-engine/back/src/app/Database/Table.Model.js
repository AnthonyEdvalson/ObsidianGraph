const { DataTypes } = require('sequelize');

let tables = {};

function main({config, db}) {
  config = config();
  console.log(tables, config.name)
  return tables[config.name];
}

function start({config, db}) {
  config = config();
  db = db();

  let columns = {};

  for (let colDef of config.columns) {
    columns[colDef.name] = {
      type:            DataTypes[colDef.type],
      defaultValue:    colDef.defaultValue,
      allowNull:       colDef.allowNull,
      primaryKey:      colDef.primaryKey,
    }

    if (colDef.foreignKey) {
      let parts = colDef.foreignKey.split(".");
      columns[colDef.name].references = {
        model: parts[0],
        key: parts[1] || "id"
      };
    }
  }

  if (config.simpleId) {
    columns["id"] = {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    }
  }

  let table = db.define(config.name, columns, {
    timestamps: config.timestamps,
    freezeTableName: true
  });

  table.sync();

  tables[config.name] = table;
}

export default { main, start };
