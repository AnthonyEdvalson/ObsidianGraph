const _ = require('lodash');

async function main({ table, key }) {
	let t = table();
	let kv = await t.get(key()) || {value: "..."};

	return _.replace(kv.value + "&World!", "&", " ");
}

module.exports = { main };