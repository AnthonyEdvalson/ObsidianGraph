const { runServer, cli, cloneApp } = require('obsidian');
const express = require('express');
const socketIO = require('socket.io');
const concurrently = require('concurrently');

async function main() {
	server = runServer(express, socketIO);
	server.publish();
	
	await cloneApp("./app.json", "./back/src", "B");
	await cloneApp("./app.json", "./front/src", "F");
	
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