import regeneratorRuntime from "regenerator-runtime";  // Required for babel

import { Courier, Engine } from 'obsidian';
import app from './app';
import { performance } from 'perf_hooks';

let courier = new Courier("http://localhost:5000/back", {
  onConnect: () => { console.log("Connected!"); },
  onEval: req => { return engine.evalFromRemote(req) },
  onTest: req => { return engine.test(req.functionId) }
}, true);
let highPrecisionTime = () => performance.timeOrigin + performance.now();

let engine = new Engine("back", highPrecisionTime, courier, app, true);
