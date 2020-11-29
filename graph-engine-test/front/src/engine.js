// GENERATED
import { Engine } from 'obsidian';

let app = {};
app.graph = require("./graph/_index");

let highPrecisionTime = () => performance.timeOrigin + performance.now();
export default (debug) => new Engine("front", highPrecisionTime, app, debug);
