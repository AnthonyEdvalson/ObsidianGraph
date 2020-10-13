
import express from 'express';
import cors from 'cors';
import socketIO from 'socket.io';
import { cli, util, messaging } from 'obsidian';

const app = express();

const port = process.env.PORT || 5000;

//let corsWhitelist = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000']
let corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
    /*TODO return;
    if (origin) {
      if (corsWhitelist.includes(origin.replace(/\/$/, ""))) {
        callback(null, true)
        return;
      }
    }

    callback(new Error(origin + ' is not allowed by CORS'))*/
  },
  credentials: true
}

class Server {
    constructor(groups, debug) {
        this.debug = debug;
        this.app = express();
        this.app.use(cors(corsOptions));

        this.expressServer = app.listen(port, () => cli.info("server", `Listening on port ${port}`));
        this.socketServer = socketIO(this.expressServer, {
            pingTimeout: 40000
        });

        this.groups = util.transform(groups, g => new Group(this.socketServer, g, debug));
    }

    on(groupName, eventName, handler) {
        if (groupName === "*")
            for (let group of Object.values(this.groups))
                group.on(eventName, handler);
        else 
            this.groups[groupName].on(eventName, handler);
    }

    publish() {
        for (let group of Object.values(this.groups))
            group.publish();
    }

    async emit(groupName, socketId, eventName, ...args) {
        return this.groups[groupName].emit(socketId, eventName, ...args);
    }

    async emitAll(groupName, eventName, ...args) {
        return this.groups[groupName].emitAll(eventName, ...args);
    }

    async emitAny(groupName, eventName, ...args) {
        return this.groups[groupName].emitAny(eventName, ...args);
    }
}

class Group {
    constructor(socketServer, name, debug) {
        this.debug = debug;
        this.name = name;
        this.socketGroup = socketServer.of("/" + name);
        this.handlers = {};
    }

    on(eventName, handler) {
        this.handlers[eventName] = handler;
    }

    async emit(socket, eventName, ...args) {
        if (typeof(socket) === "string")
            socket = this.socketGroup.connected[socket];


        if (!socket)
            throw new Error("Could not find socket '" + socket + "' in the " + this.name + " group");

        if (this.debug && eventName != "profile")
            cli.printMessageSent(" " + this.name + "|" + eventName, ...args);

        let reply;
        try {
            reply = await messaging.send(socket, eventName, ...args);
        } catch (error) {
            console.log(this.name, eventName, "Could not reply because of the following error:\n", error);
            throw error;
        }

        if (this.debug && eventName != "profile")
            cli.printMessageReceived("*" + this.name + "|" + eventName, reply)
        
        return reply;
    }

    async emitAny(eventName, ...args) {
        let sockets = Object.values(this.socketGroup.sockets);

        if (sockets.length === 0) {
            cli.warn("server", "Cannot emit event '" + eventName + "' to " + this.name + ", none are connected.");
            return;
        }

        return this.emit(sockets[0], eventName, ...args);
    }

    async emitAll(eventName, ...args) {
        let sockets = Object.values(this.socketGroup.sockets);

        sockets.map(s => this.emit(s, eventName, ...args));
    }

    publish() {
        // TODO Courier has nearly identital code in it's constructor, merge???

        this.socketGroup.on("connection", socket => {
            console.log("new " + this.name + " connected")
            for (let [name, handler] of Object.entries(this.handlers)) {
                messaging.on(socket, name, async (...args) => {
                    if (this.debug && name != "profile")
                        cli.printMessageReceived(" " + this.name + "|" + name, ...args);
                        
                    let ret;
                    try {
                        ret = await handler(socket, ...args);
                    } catch (error){
                        console.log("Failed to Return", this.name, name, error.stack);
                        throw error;
                    }

                    if (this.debug && name != "profile")
                        cli.printMessageSent("*" + this.name + "|" + name, ret);
                    
                    return ret;
                });
            }
        })
    }
}

export default Server;