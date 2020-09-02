const sqlite = require('sqlite3').verbose();

let cache = null;

function main({ location }) {
  location = location();

  if (!cache) {
    console.log("!!! New DB Connection to " + location);
    cache = new sqlite.Database(location, err => {
      if (err) throw err;
    });
  }
  
  return cache;
}

export default { main };