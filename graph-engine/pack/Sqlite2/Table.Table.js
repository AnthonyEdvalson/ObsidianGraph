class Table {
  constructor(db, schema) {
    this.db = db;
    this.name = schema.name;
    this.schema = schema;
    this.cols = schema.columns;
    this.colNames = new Set(this.cols.map(c => c.name));
  }

  async create() {
    // Ensure the table exists. TODO optimize by making this only run once
    let query = this.cols.map(col => `\t${col.name} ${col.fieldType}`);
    query = `CREATE TABLE IF NOT EXISTS ${this.schema.name} (\n\t${query.join(",\n\t")}\n)`;
    this.run(this.db.run, query, []);
  }

  async get(id, defaultValue) {
    let res = await this.run(this.db.get, `SELECT * FROM ${this.name} WHERE id = ?`, [id]);
    return res || defaultValue;
  }

  async getAll() {
    return this.run(this.db.all, `SELECT * FROM ${this.name}`, []);
  }
  
  async insert(data) {
    let keys = [];
    let vals = [];

    for (let [k, v] of Object.entries(data)) {
      if (this.colNames.has(k)) {
        keys.push(k);
        vals.push(v);
      }
    }

    let cols = keys.join(", ");
    let valRep = vals.map(() => "?").join(", ");
    return this.run(this.db.run, `INSERT INTO ${this.name} (${cols}) VALUES(${valRep})`, vals);
  }

  async upsert(data) {
    let keys = [];
    let vals = [];

    for (let [k, v] of Object.entries(data)) {
      if (this.colNames.has(k)) {
        keys.push(k);
        vals.push(v);
      }
    }

    let cols = keys.join(", ");
    let valRep = vals.map(() => "?").join(", ");
    let updateRep = keys.map(k => `${k} = excluded.${k}`).join(",\n\t");
    return this.run(this.db.run, `INSERT INTO ${this.name} (${cols}) VALUES(${valRep}) ON CONFLICT(id)
      DO UPDATE SET
      ${updateRep}`, vals);
  }

  async run(action, sql, params) {
    let bound = action.bind(this.db);
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        bound(sql, params, (err, row) => {
          if (err) {
            console.log("!!!", sql, params);
            reject(err);
          } else {
            console.log(">>>", sql, params);
            resolve(row);
          }
        });
      });
    });
  }
}

function main({ db, schema }) {
    
    let table = new Table(db(), schema());
    table.create();
    
    return table;
}

module.exports = { main };
