import obsidian from 'obsidian'
import fs from 'fs'

const { runServer } = obsidian;

let data = {
	app: JSON.parse(fs.readFileSync("./app.json")),
	packInfo: JSON.parse(fs.readFileSync("./package.json")),
	path: __dirname
}

async function main() {
	await runServer("server", data);
	await runServer("back", data);
	await runServer("front", data);
}

main();