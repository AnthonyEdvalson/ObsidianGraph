const { runServer, cli, appFS } = require('obsidian');
const express = require('express');
const socketIO = require('socket.io');
const concurrently = require('concurrently');

async function main() {
	let def = appFS.loadOPackDef("./app");
	let frontFragment = appFS.fragmentDef(def, "./back/src", "B");
	let backFragment = appFS.fragmentDef(def, "./front/src", "F");
	appFS.saveOPackDef(frontFragment, "./front/src");
	appFS.saveOPackDef(backFragment, "./back/src");

	server = runServer(express, socketIO);
	server.publish();

	await frontPromise;
	await backPromise;
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