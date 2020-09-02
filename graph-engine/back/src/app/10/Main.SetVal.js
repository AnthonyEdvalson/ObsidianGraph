const _ = require('lodash');

async function main({ table, key }, value) {
  key = key();

  if (value === "Hello, ")
    throw new Error("That's not allowed!");
    
	let t = table();
  await t.upsert({id: key, value});
}

export default { main };