
// THIS FILE IS GENERATED
// ANY EDITS WILL BE LOST

import { App } from 'obsidian';
import aDef from './app.json';
import _backend from './graph/backend';

aDef.graphs.graph.nodes.backend.module = _backend;

let app = new App("B", aDef);
export default app;
