import regeneratorRuntime from "regenerator-runtime";  // Required for babel

import express from 'express';
import loadObn from './loadObn';
import postman from './postman';

const app = express();
const port = process.env.PORT || 5000;
const obnPath = process.argv[2];

loadObn(obnPath).then(engine => {
  app.use(express.json());
  
  app.post('/api/call', async (req, res) => {
    const [location, args] = postman.parseReq(req);
    console.log("REQ: " + JSON.stringify(location) + ", " + JSON.stringify(args));
  
    try {
      let data = await engine.call(location, args);
      postman.respondSuccess(location, args, data, res);
    }
    catch (err) {
      postman.respondFail(location, args, err, res);
    }
  });
  
  app.listen(port, () => console.log(`Listening on port ${port}`));
});
