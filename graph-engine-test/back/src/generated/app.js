
// THIS FILE IS GENERATED
// ANY EDITS WILL BE LOST

import { App, appFS } from 'obsidian';
import aDef from './app.json';
import _backend from './graphs/graph/backend';

let aDef = appFS.assembleFragment('TODO!!!!');

aDef.graphs.graph.nodes.backend.module = _backend;

let app = new App("B", aDef);
export default app;
