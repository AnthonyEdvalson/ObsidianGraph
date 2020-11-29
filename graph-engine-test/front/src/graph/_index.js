import { Graph } from 'obsidian';
import app from '../app.json';

let graph = app.graphs.graph;
graph.nodes.backend.module = require("./Main");

export default new Graph(graph);
