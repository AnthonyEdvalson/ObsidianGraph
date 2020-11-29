import regeneratorRuntime from "regenerator-runtime";  // Required for babel

import loadObn from './loadObn';
import { cli } from 'obsidian';
import Server from './server';
import concurrently from "concurrently";
import util from 'util';
import fs from 'fs';


const obnPath = "main.obn";
const frontFolder = "../front/src/app/";
const backFolder = "../back/src/app/";


let loadPromise = loadObn(obnPath, frontFolder, backFolder);
let server = new Server(["editor", "front", "back"], true);


server.on("editor", "loadObn", async (_, binary) => {
  let buffer = Buffer.from(binary, "base64");
  await util.promisify(fs.writeFile)("./main.obn", buffer);
});


server.on("editor", "test", async (_, req) => {
  throw new Error("Not Implemented");
  /*
  if (req.side === "front"
    return server.emitAny("front", "test", req);
    
  if (req.side === "back")
    return server.emitAny("back", "test", req);*/
});


server.on("front", "eval", async (source, req) => {
  req.sudo = false;
  req.source = source.id;
  return await server.emitAny("back", "eval", req);
});


server.on("back", "eval", async (source, req) => {
  req.sudo = false;
  req.source = source.id;
  return await server.emit("front", req.target, "eval", req);
});

server.app.post("/", (req, res, next) => {
  console.log(req.body);
  let { event, body } = req.body;

  server.emitAny("back", event, body).then(data => {
    console.log(data); 
    res.send(data);
  }).catch(next);
});


server.on("*", "error", (_, error) => {
  cli.error("server", "ERROR REPORTED", data);
  cli.warn("server", "Reporting Error: ", error);
  server.emitAll("editor", "error", error);
});


server.on("*", "profile", async (_, profile) => {
  server.emitAll("editor", "profile", profile);
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