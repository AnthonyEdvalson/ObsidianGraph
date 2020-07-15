function parseReq(req) {
    let data = req.body;

    if (typeof(data) !== "object")
        throw new Error("Server could not understand the message '" + JSON.stringify(data) + "'. It expects a JSON dictionary");
    
    return [data.location, data.args];
}

function respondFail(name, args, err, res) {
    let body = JSON.stringify({
        title: err.name,
        message: err.message,
        tb: []
    });

    console.log(err.stack);
    console.log(`${JSON.stringify(name)} ${JSON.stringify(args)} !!! ${body}`);
    res.status(500).send(body);
}

function respondSuccess(name, args, data, res) {
    if (typeof(data) === "undefined")
        data = null;
        
    let body = JSON.stringify(data, null, 2);
    console.log(`${JSON.stringify(name)} ${JSON.stringify(args)} >>> ${body}`);
    res.send(body);
}

module.exports = {
    parseReq,
    respondFail,
    respondSuccess
}

