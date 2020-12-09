
// THIS FILE IS GENERATED
// ANY EDITS WILL BE LOST

import { App, appFS } from 'obsidian';
import aDef from './app.json';
import _Main from './graphs/graph/Main';

let aDef = appFS.assembleFragment('TODO!!!!');

aDef.graphs.graph.nodes.Main.module = _Main;

let app = new App("F", aDef);
export default app;
