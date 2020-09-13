const _ = require('lodash');

async function main({ table, key }) {
	let t = table();
	let kv = await t.get(key()) || {value: "..."};

	return _.replace(kv.value + "&World!", "&", " ");
}

function test(check) {
  check({
    table: {
      get: () => ({ value: "Hello," })
    },
    key: 69
  }).returns("Hello, World!");

  check({
    table: {
      get: () => ({ value: "&" })
    },
    key: 69
  }).returns(" &Worlddddddd!");
}

export default { main, test };