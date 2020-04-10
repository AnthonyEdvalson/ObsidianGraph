const path = window.require("path");
const fs = window.require("fs");

let emptyTemplate = {
    nodes: {},
    ports: {},
    links: {}
}

let webAppTemplate = {
    nodes: {
        A: {
            type: "in",
            name: "Input",
            x: 50,
            y: 50,
            inputs: [],
            output: {key: "Aout", label: "value", type: "py"}
        },
        B: {
            type: "out",
            name: "Output",
            x: 950,
            y: 50,
            inputs: [{key: "Bin", label: "input", type: "py"}],
            output: null
        },
        C: {
            type: "py",
            name: "Python",
            x: 350,
            y: 50,
            inputs: [{key: "Cin", label: "input", type: "py"}],
            output: {key: "Cout", label: "value", type: "py"}
        },
        D: {
            type: "js",
            name: "JavaScript",
            x: 650,
            y: 50,
            inputs: [{key: "Din", label: "input", type: "js"}],
            output: {key: "Dout", label: "value", type: "js"}
        }
    },
    ports: {
        Aout: { node: "A" },
        Bin: { node: "B" },
        Cin: { node: "C" },
        Cout: { node: "C" },
        Din: { node: "D" },
        Dout: { node: "D" }
    },
    links: {
        Bin: "Dout",
        Din: "Cout",
        Cin: "Aout"
    }
};

let frontendTemplate = {
    nodes: {
        A: {
            type: "in",
            name: "Input",
            x: 50,
            y: 50,
            inputs: [],
            output: {key: "Aout", label: "value", type: "js"}
        },
        B: {
            type: "out",
            name: "Output",
            x: 650,
            y: 50,
            inputs: [{key: "Bin", label: "input", type: "js"}],
            output: null
        },
        C: {
            type: "js",
            name: "JavaScript",
            x: 350,
            y: 50,
            inputs: [{key: "Cin", label: "input", type: "js"}],
            output: {key: "Cout", label: "value", type: "js"}
        }
    },
    ports: {
        Aout: { node: "A" },
        Bin: { node: "B" },
        Cin: { node: "C" },
        Cout: { node: "C" }
    },
    links: {
        Bin: "Cout",
        Cin: "Aout"
    }
};

let backendTemplate = {
    nodes: {
        A: {
            type: "in",
            name: "Input",
            x: 50,
            y: 50,
            inputs: [],
            output: {key: "Aout", label: "value", type: "py"}
        },
        B: {
            type: "out",
            name: "Output",
            x: 650,
            y: 50,
            inputs: [{key: "Bin", label: "input", type: "py"}],
            output: null
        },
        C: {
            type: "py",
            name: "Python",
            x: 350,
            y: 50,
            inputs: [{key: "Cin", label: "input", type: "py"}],
            output: {key: "Cout", label: "value", type: "py"}
        }
    },
    ports: {
        Aout: { node: "A" },
        Bin: { node: "B" },
        Cin: { node: "C" },
        Cout: { node: "C" }
    },
    links: {
        Bin: "Cout",
        Cin: "Aout"
    }
};

function LOAD_GRAPH(state, action) {
    let newState = {
        ...action.data,
        path: action.folderPath || path.dirname(action.filePath),
        newLink: null,
        selection: {all: [], items: []},
        transform: { x: 0, y: 0, scale: 1 }
    };

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

    let template = {
        "Empty": emptyTemplate,
        "Web App": webAppTemplate,
        "Backend": backendTemplate,
        "Frontend": frontendTemplate
    }[action.template];

    template.meta = {
        name: action.name,
        author: action.author,
        description: action.description,
        tags: "",
        hideInLibrary: false
    };
    template.path = dir;

    return LOAD_GRAPH(state, {data: template});
}


function SAVE_GRAPH(state, action) {
    let data = JSON.stringify({
        meta: state.meta,
        nodes: state.nodes,
        ports: state.ports,
        links: state.links,
        transform: state.transform
    }, null, 2);

    let p = action.path || path.join(state.path, state.meta.name + ".obg");
    fs.writeFile(p, data, err => {
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
        console.log(x, y);
        newState.transform.scale *= ds;
        newState.transform.x -= (x * (1 - 1 / ds)) * newState.transform.scale;
        newState.transform.y -= (y * (1 - 1 / ds)) * newState.transform.scale;
    }
    if (dx)
        newState.transform.x += dx;
    if (dy)
        newState.transform.y += dy;
    console.log(newState.transform.x, newState.transform.y, newState.transform)
    return newState;
}

export default { LOAD_GRAPH, NEW_GRAPH, SAVE_GRAPH, MOVE_GRAPH };
