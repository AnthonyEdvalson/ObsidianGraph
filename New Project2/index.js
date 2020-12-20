const { runServer, cli, oPackFS } = require('obsidian');
const express = require('express');
const socketIO = require('socket.io');
const concurrently = require('concurrently');

async function main() {
	let def = await oPackFS.loadOPackDef("./opack");
	await oPackFS.fragmentDef(def, "F", "./front/src/generated");
	await oPackFS.fragmentDef(def, "B", "./back/src/generated");

	server = runServer(express, socketIO);
	server.publish();

	cli.log("server", "Running backend and frontend...")
	concurrently(
		[
			{
				command: "cd ./back && npm start",
				name: "back",
				prefixColor: "yellow"
			},
			{
				command: "cd ./front && npm start",
				name: "front",
				prefixColor: "red"
			}
		], 
		{
			killOthers: ['failure', 'success']
		}
	);
}

main();
