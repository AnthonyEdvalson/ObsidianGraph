async function main({key, table}, value) {
    let id = key();
    let t = table();
    await t.upsert({id, value});

    return value;
}

module.exports = { main };
