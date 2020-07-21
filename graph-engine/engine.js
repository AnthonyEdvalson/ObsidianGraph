import fs from 'fs';
import util from 'util';

const writeFile = util.promisify(fs.writeFile);

async function loadObn(args) {
    let data = Buffer.from(args.data, "base64");
    await writeFile("./main.obn", data);
}

export default {
    loadObn
}