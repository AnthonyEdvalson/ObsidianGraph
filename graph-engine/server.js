const express = require('express');
const Graph = require('./front/src/shared/engine');
const loadObn = require('./loadObn');
const postman = require('./postman');

const app = express();
const port = process.env.PORT || 5000;
const obnPath = process.argv[2];
const mode = "dev";
let obnData = loadObn(obnPath);

// MUST load pack after loading the OBN so that import errors within the pack can be corrected
const pack = require('./pack/_index');
let back_graph = new Graph(obnData.back, pack);


app.use(express.json());

app.post('/api/call', (req, res) => {
  const [node, args] = postman.parseReq(req);
  console.log(node, args);

  try {
    if (node[0] == "@")
      data = obsidianExec(node.substring(1), args);
    else
      data = back_graph.run(node, { args, mode });
  } 
  catch (e) {
    console.log(e.stack);
    postman.respondFail(node, args, e, res);
    return;
  }
  console.log(data);
  postman.respondSuccess(node, args, data, res);
});


app.listen(port, () => console.log(`Listening on port ${port}`));
