const fs = require('fs');
const { runServer, cli } = require('obsidian');
const express = require('express');
const socketIO = require('socket.io');
const concurrently = require('concurrently');

let data = {
	app: JSON.parse(fs.readFileSync("./app.json")),
	packInfo: JSON.parse(fs.readFileSync("./package.json")),
	path: __dirname
}

server = runServer(data, express, socketIO);
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