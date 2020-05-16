const express = require('express');
const Graph = require('./front/src/shared/engine');
const loadObn = require('./loadObn');
const postman = require('./postman');

const app = express();
const port = process.env.PORT || 5000;
const obnPath = process.argv[2];
let pack = null;
let back_graph = null;

async function processCall(node, args) {
  return back_graph.main(node, args);
}

loadObn(obnPath, () => {
  // MUST load pack after loading the OBN so that import errors within the pack can be corrected
  pack = require('./pack/7/_index');
  back_graph = new Graph(pack, "back");

  app.use(express.json());

  app.post('/api/call', (req, res) => {
    const [node, args] = postman.parseReq(req);
    console.log("REQ: " + node + ", " + JSON.stringify(args));

    let p = processCall(node, args).then(data => {
      postman.respondSuccess(node, args, data, res);
    }).catch(e => {
      postman.respondFail(node, args, e, res);
    });
  });

  app.listen(port, () => console.log(`Listening on port ${port}`));
});
