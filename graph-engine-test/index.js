const fs = require('fs');
const { runServer } = require('obsidian');

let data = {
	app: JSON.parse(fs.readFileSync("./app.json")),
	packInfo: JSON.parse(fs.readFileSync("./package.json")),
	path: __dirname
}

runServer(data);
