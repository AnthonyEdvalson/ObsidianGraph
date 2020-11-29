// GENERATED
import { Engine } from 'obsidian';
import { performance } from 'perf_hooks';

let app = {};
app.graph = require("./graph/_index");

let highPrecisionTime = () => performance.timeOrigin + performance.now();
export default (debug) => new Engine("back", highPrecisionTime, app, debug);
