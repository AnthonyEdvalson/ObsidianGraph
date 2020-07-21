import appInfo from './_app.json';


class EngineError extends Error {
    constructor(innerError, ctx) {
        super(innerError.message);
        this.innerError = innerError;
        this.ctx = ctx;
    }
}

class App {
    constructor(side, errorHandler) {
        this.name = appInfo.name;
        this.side = side;

        this.projects = {};
        this.errorHandler = errorHandler;

        for (let project of appInfo.projects) {
            let data = require('./' + project + "/_project.json");
            this.projects[project] = new Project(this, data);
        }
    }

    start(socket, location=appInfo.root, args=[]) {
        let ctx = new Context(null, this.side, socket);
        return this.call(location, args, ctx);
    }

    call(location, args, ctx) {
        let { projectName, functionName } = location;
        let project = this.projects[projectName];

        ctx.project = project;

        try {
            return project.call(functionName, args, ctx);
        }
        catch (err) {
            if (err instanceof EngineError) {
                if (!(err.innerError instanceof EngineError)) {
                    this.handleError(err);
                    err.handled = true;
                }
            }

            throw err;
        }
    }

    handleError(engineErr) {
        let flatTrace = [];

        let ctx = engineErr.ctx;

        while (ctx.frame) {
            let frame = {
                ...ctx.frame.details,
                ...ctx.data
            }
            flatTrace.push(frame);
            ctx = ctx.parent;
        }
        
        console.log(flatTrace, engineErr.ctx)
        this.errorHandler(flatTrace);
    }
}

class Project {
	constructor(app, project) {
        this.app = app;
        this.name = project.name;
        this.remoteFunctions = new Set(project.remoteFunctions);

        // This does some extra deserialization on the functions that the JSON parser doesn't get
        let functions = transform(project.functions, def => {
            if (def.type === "code")
                def.code = require("./" + project.name + "/" + def.name);
        
            if (def.type === "data")
                def.json = JSON.parse(def.value); // Need to fix this, storing nested JSON strings is messy, pick a format and be consistent
            
            return def;
        });

        this.functions = transform(functions, v => new Func(v, this));
	}

	callApp(location, args, ctx) {
        return this.app.call(location, args, ctx);		
    }

    call(functionName, args, ctx) {
        if (functionName in this.functions)
            return this.functions[functionName].main(args, ctx);

        if (this.remoteFunctions.has(functionName))
            return callRemote(ctx.socket, this.funcToLocaiton(functionName), args);
        
        throw new Error("Engine Error: Cannot find the function '" + functionName + "'. " + 
            "Local names include: " + Object.keys(this.functions).sort().join(", ") + ". " +
            "Remote names include: " + Object.values(this.remoteFunctions).sort().join(", "));		
    }

    funcToLocaiton(functionName) {
        return { functionName, projectName: this.name };
    }
}


class Func {
	constructor(fDef, project) {
        let name = fDef.name;
        this.name = name;
        this.type = fDef.type;
        this.nodeId = fDef.nodeId;
        this.location = {
            projectName: project.name,
            functionName: this.name
        }

        this.funcMap = {
            "code": (args, ctx) => {
                let inputs = ctx.makeInputsCallable(fDef.inputs, false);
                return fDef.code.main(inputs, ...args);
            },
            "call": (args, ctx) => {
                let newCtx = ctx.clone(fDef.parameters, fDef.inputs);
                return project.callApp(fDef.location, args, newCtx);
            },
            "data": () => fDef.json,
            "in": (args, ctx) => ctx.inputs[fDef.label](args),
            "edit": (_, ctx) => ctx.data.parameters,
            "out": (args, ctx) => {
                let inputs = ctx.makeInputsCallable(fDef.inputs);
                return inputs["value"](args);
            }
        }
    }

    main(args, prevCtx) {
        let ctx = prevCtx.pushFrame(this.makeFrame(args, prevCtx));
        let v;

        try {
            v = this.funcMap[this.type](args, ctx);
        }
        catch (err) {
            throw new EngineError(err, ctx);
        }

        return v;
    }
    
    makeFrame(args, ctx) {
        return {
            ctx,
            details: {
                location: this.location,
                args,
                type: this.type,
                nodeId: this.nodeId
            }
        }
    }
}

// Context must be immutable, a refence to the context is saved in every frame, and
// it is used when errors occur.
class Context {
    constructor(project, side, socket, parameters=null, inputs={}, ttl=300, frame=null, parent=null) {
        this.project = project;
        this.inputs = this.makeInputsCallable(inputs);
        this.frame = frame;
        this.parent = parent;
        this.socket = socket;

        this.data = {
            parameters,
            side,
            ttl
        }

        if (ttl <= 0)
            throw new Error("Timed out");
    }

    clone(parameters, inputs) {
        return new Context(this.project, this.data.side, this.socket, parameters, inputs, this.data.ttl, this.frame, this.parent);
    }

    makeInputsCallable(inputs, argumentsAsList=true) {
        return transform(inputs, functionName => {
            let location = this.project.funcToLocaiton(functionName)
            let caller = (args) => this.project.callApp(location, args, this);
            
            if (!argumentsAsList)
                return (...args) => caller(args);
            
            return caller;
        });
    }

    pushFrame(frame) {
        return new Context(this.project, this.data.side, this.socket, this.data.parameters, this.inputs, this.data.ttl - 1, frame, this);
    }
}

async function callRemote(socket, location, args={}) {
	return new Promise((resolve, reject) => {
        socket.emit('call', { location, args }, res => {
            resolve(res);
            // TODO reject if there was an error
        });
	});
}

function transform(object, map) {
    let newObject = {};
    for (let [k, v] of Object.entries(object))
        newObject[k] = map(v);
    return newObject;
}

export default App;