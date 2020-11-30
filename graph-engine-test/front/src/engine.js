// GENERATED
import { Engine, App } from 'obsidian';
import aDef from './app.json';

let graphs = {
    graph: require("./graph/_index")
};

let app = new App(aDef, graphs);

let highPrecisionTime = () => performance.timeOrigin + performance.now();
let engineFactory = (debug) => new Engine("front", highPrecisionTime, app, debug);
export default engineFactory;
