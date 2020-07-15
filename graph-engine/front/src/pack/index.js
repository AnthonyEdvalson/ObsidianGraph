import appInfo from './_app.json';


function transform(object, map) {
    let newObject = {};
    for (let [k, v] of Object.entries(object))
        newObject[k] = map(v);
    return newObject;
}

class App {
    constructor() {
        this.name = appInfo.name;

        this.projects = {};

        for (let project of appInfo.projects) {
            let data = require('./' + project + "/_project.json");
            this.projects[project] = new Project(this, data);
        }
    }

    call(location=appInfo.root, args=[], iargs) {
        let { projectName, functionName } = location;

        let project = this.projects[projectName];

        if (!iargs)
            iargs = new Iargs(project, "???");

        iargs.stepTTL();
        iargs.project = project;

        return project.call(functionName, args, iargs);
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

	callApp(location, args, iargs) {
        return this.app.call(location, args, iargs);		
    }

    call(functionName, args, iargs) {
        if (functionName in this.functions)
            return this.functions[functionName].main(args, iargs);

        // name is a node name, but on the backend
        if (this.remoteFunctions.has(functionName))
            return callRemote(this.funcToLocaiton(functionName), args);
        
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
        
        const funcMap = {
            "code": (args, iargs) => {
                let inputs = iargs.makeInputsCallable(fDef.inputs, false);
                return fDef.code.main(inputs, ...args);
            },
            "call": (args, iargs) => {
                let newIargs = iargs.clone(fDef.parameters, fDef.inputs);
                return project.callApp(fDef.location, args, newIargs);
            },
            "data": () => fDef.json,
            "in": (args, iargs) => iargs.inputs[fDef.label](args),
            "edit": (_, iargs) => iargs.parameters,
            "out": (args, iargs) => {
                let inputs = iargs.makeInputsCallable(fDef.inputs);
                return inputs["value"](args);
            }
        }
        
        if (!(fDef.type in funcMap))
            throw new Error("Could not set a main function for type '" + fDef.type + "' on the function '" + name + "'");

        this.main = (args, iargs) => {
            let v = funcMap[fDef.type](args, iargs);
            console.log(name + "(" + args.map(JSON.stringify).join(", ") + ") -> ", v);
            return v;
        }
	}
}

class Iargs {
    constructor(project, side, parameters=null, inputs={}, ttl=50) {
        this.parameters = parameters;
        this.side = side;
        this.ttl = ttl;
        this.project = project;
        this.inputs = this.makeInputsCallable(inputs);
    }
    clone(parameters, inputs) {
        return new Iargs(this.project, this.side, parameters, inputs, this.ttl);
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

    stepTTL() {
        this.ttl--;
        if (this.ttl <= 0)
            throw new Error("Infinite loop detected");
    }
}


function callRemote(location, args={}) {
    let body = JSON.stringify({ location, args }, null, 2);
	
	return new Promise((resolve, reject) => {
		fetch('/api/call', {
            body,
			headers: { 'Content-Type': 'application/json' }, 
			method: 'POST',
			credentials: "same-origin"
		}).then(res => {
			if (res.ok)
				resolve(res.json());
			else
				res.json().then(reject, reject);
		});
	});
}

const app = new App();
export default app;