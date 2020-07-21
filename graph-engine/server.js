import regeneratorRuntime from "regenerator-runtime";  // Required for babel

import express from 'express';
import loadObn from './loadObn';
import postman from './postman';
import engineActions from './engine';
//import cors from 'cors';
import socketIO from 'socket.io';

const app = express();

const port = process.env.PORT || 5000;
const obnPath = process.argv[2];

/*let corsWhitelist = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:5000']
let corsOptions = {
  origin: function (origin, callback) {
    callback(null, true);
    
    if (origin) {
      if (corsWhitelist.includes(origin.replace(/\/$/, ""))) {
        callback(null, true)
        return;
      }
    }

    callback(new Error(origin + ' is not allowed by CORS'))
  }
}*/

loadObn(obnPath).then(Engine => {
  let engine = new Engine("back");
  
  //app.use(express.json({limit: '50mb'}));
  //app.use(cors(corsOptions));
  
  let server = app.listen(port, () => console.log(`Listening on port ${port}`));

  let io = socketIO(server, {
    pingTimeout: 40000
  });
  let editors = io.of("/editor");
  
  io.on("connection", socket => {
    console.log("New Connection")
    socket.on("report", data => {
      console.error("ERROR REPORTED");
      editors.emit("report", data);
    });

    socket.on("call", async (req, res) => {
      handleRequest(req, (location, args) => engine.start(socket, location, args), res, err => {
        editors.emit("report", errorData);
      });
    })
  });

  editors.on("connection", socket => {
    socket.on("engine", async (req, res) => {
      let action = async (location, args) => engineActions[location](args);
      handleRequest(req, action, res);
    });
  });
});

function handleRequest(req, action, res, handleError = () => {}) {
  const [location, args] = postman.parseReq(req);
  console.log("REQ: " + JSON.stringify(location) + ", " + trim(JSON.stringify(args)));

  try {
    let data = action(location, args);
    postman.respondSuccess(location, args, data, res);
  }
  catch (err) {
    postman.respondFail(location, args, err, res);
    handleError();
  }
}

function trim(text, length=300) {
  return text.length < length ? text : text.substring(0, length);
}
