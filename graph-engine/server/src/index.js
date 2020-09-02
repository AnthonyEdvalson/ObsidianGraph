import regeneratorRuntime from "regenerator-runtime";  // Required for babel

import loadObn from './loadObn';
import { cli } from 'obsidian';
import Server from './server';
import concurrently from "concurrently";
import util from 'util';
import fs from 'fs';

const obnPath = "main.obn";

let loadPromise = loadObn(obnPath);

let server = new Server(["editor", "front", "back"], true);

server.on("editor", "loadObn", async (binary) => {
  let buffer = Buffer.from(binary, "base64");
  await util.promisify(fs.writeFile)("./main.obn", buffer);
});

server.on("front", "eval", async req => {
  req.sudo = false;
  return server.emit("back", "eval", req);
});

server.on("back", "eval", async req => {
  req.sudo = false;
  throw new Error("Not Implemented");
});

server.on("*", "error", error => {
  cli.error("server", "ERROR REPORTED", data);
  cli.warn("server", "Reporting Error: ", error);
  server.emit("editor", "error", error);
});

server.on("*", "profile", async profile => {
  return server.emit("editor", "profile", profile);
});

server.publish();

loadPromise.then(() => {
  cli.info("server", "Running backend and frontend...")
  concurrently([
      {
        command: "cd ../back && npm start",
        name: "back",
        prefixColor: "yellow"
      },
      {
        command: "cd ../front && npm start",
        name: "front",
        prefixColor: "red"
      }
    ], {
      killOthers: ['failure', 'success']
    }
  );
});