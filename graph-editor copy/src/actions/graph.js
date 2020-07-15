import { uuid4, cleanName } from "./node";
import { copy } from "./clipboard";
import { getFilePath } from "../logic/paths";

const path = window.require("path");
const fs = window.require("fs");

function LOAD_GRAPH(state, action) {
    let newState = {
        ...action.data,
        path: action.folderPath || path.dirname(action.filePath),
        newLink: null,
        selection: {all: [], items: [], dragging: false}
    };

    for (let [k, v] of Object.entries(action.data.nodes)) {
        let path = getFilePath(v.name, v.type, newState.path);

        if (!path)
            continue;

        let file = newState.nodes[k].file;
        
        if (!fs.existsSync(path))
            fs.writeFileSync(path, file.contents);
    }

    return newState;
}

function NEW_GRAPH(state, action) {
    let name = action.name;
    let dir = path.join(action.directory, action.name)

    let frontDir = path.join(dir, "front");
    let backDir = path.join(dir, "back");
    let resDir = path.join(dir, "resources");
    let obgPath = path.join(dir, name + ".obg");

    fs.access(dir, err => {
        if (!err) throw(new Error(dir + " already exists"));

        fs.mkdir(dir, { recursive: true }, err => {
            if (err) throw(err);
            fs.mkdir(frontDir, {}, err => {if (err) throw(err)});
            fs.mkdir(backDir,  {}, err => {if (err) throw(err)});
            fs.mkdir(resDir,   {}, err => {if (err) throw(err)});
            
            fs.open(obgPath, "wx", (err, fd) => {
                if (err) throw err;
                fs.close(fd, err => {
                    if (err) throw err;
                });
            });
        });
    });

    let data = {
        meta: {
            name: action.name,
            author: action.author,
            description: action.description,
            tags: "",
            hideInLibrary: false
        },
        nodes: {},
        links: {},
        ports: {}
    };

    return LOAD_GRAPH(state, {data, folderPath: dir});
}


function SAVE_GRAPH(state, action) {
    let data = {
        meta: state.meta,
        nodes: state.nodes,
        ports: state.ports,
        links: state.links,
        transform: state.transform
    };

    let obgPath = action.path || path.join(state.path, state.meta.name + ".obg");

    for (let [k, v] of Object.entries(state.nodes)) {
        let path = getFilePath(v.name, v.type, state.path);

        if (!path)
            continue;

        data.nodes[k].file = {
            contents: fs.readFileSync(path).toString(),
            modified: fs.statSync(path).mtime.toISOString()
        };
    }

    fs.writeFile(obgPath, JSON.stringify(data, null, 2), err => {
        if (err) throw err;
    });

    return state;
}

function clientToGraph(x, y, gt) {
    return {
        x: (x - gt.x) / gt.scale,
        y: (y - gt.y) / gt.scale
    }
}

function MOVE_GRAPH(state, {ds, dy, dx, pivot}) {
    let newState = {
        ...state,
        transform: { ...state.transform }
    };

    if (ds) {
        let {x, y} = clientToGraph(pivot.x, pivot.y, newState.transform);
        newState.transform.scale *= ds;
        newState.transform.x -= (x * (1 - 1 / ds)) * newState.transform.scale;
        newState.transform.y -= (y * (1 - 1 / ds)) * newState.transform.scale;
    }
    if (dx)
        newState.transform.x += dx;
    if (dy)
        newState.transform.y += dy;
    return newState;
}


function paste(graph, clip) {
    let newGraph = {
        ...graph,
        nodes: { ...graph.nodes },
        ports: { ...graph.ports },
        links: { ...graph.links },
        selection: { ...graph.selection, items: [] }
    };

    let portMap = {};

    for (let [, node] of Object.entries(clip.nodes)) {
        let newNodeKey = uuid4();

        let nodeCopy = {
            ...node,
            inputs: node.inputs.map(input => pastePort(clip, newGraph, input, newNodeKey, portMap)),
            output: pastePort(clip, newGraph, node.output, newNodeKey, portMap),
            x: node.x + 20,
            y: node.y + 20,
            name: cleanName(newGraph.nodes, node.name, newNodeKey)
        };

        newGraph.nodes[newNodeKey] = nodeCopy;
        newGraph.selection.items.push({type: "node", key: newNodeKey});
    }

    for (let [sink, source] of Object.entries(clip.links)) {
        let newSink = portMap[sink];
        let newSource = portMap[source];

        if (newSink && newSource) {
            newGraph.links[newSink] = newSource;
        }
    }
    
    return newGraph;
}

function pastePort(clip, newGraph, key, nodeKey, portMap) {
    let newPortKey = uuid4();

    let port = clip.ports[key];
    port.node = nodeKey;
    newGraph.ports[newPortKey] = port;

    portMap[key] = newPortKey;

    return newPortKey;
}

function PASTE(state, action, fullState) {
    return paste(state, fullState.clipboard);
}

function DUPLICATE(state, action) {
    let clip = copy(state);
    return paste(state, clip);
}

export default { LOAD_GRAPH, NEW_GRAPH, SAVE_GRAPH, MOVE_GRAPH, PASTE, DUPLICATE };
