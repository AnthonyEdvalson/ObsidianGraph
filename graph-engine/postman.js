function parseReq(req) {
    data = req.body;

    if (typeof(data) !== "object")
        throw new Error("Server could not understand the message '" + JSON.stringify(data) + "'. It expects a valid JSON dictionary");
    
    return [data.node, data.args];
}

function respondFail(node, args, err, res) {
    let body = JSON.stringify({
        title: err.name,
        message: err.message,
        tb: []
    });

    console.log(`${node} ${JSON.stringify(args)} !!! ${body}`);
    res.status(500).send(body);
}

function respondSuccess(node, args, data, res) {
    if (typeof(data) === "undefined")
        data = null;
        
    let body = JSON.stringify(data, null, 2);
    console.log(`${node} ${JSON.stringify(args)} >>> ${body}`);
    res.send(body);
}

module.exports = {
    parseReq,
    respondFail,
    respondSuccess
}

