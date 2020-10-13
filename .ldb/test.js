let __data = {};

function __trace(id, v) {
  return __data[id] = v;
}

import _ from "/Users/work/Documents/Projects/Obsidian/T072 - Obsidian/live-debug/node_modules/lodash/lodash.js";

async function main({
  table,
  key
}) {
  let t = __trace(4, table());

  let kv = __trace(5, (await t.get(key())) || {
    value: "..."
  });

  return __trace(6, _.replace(kv.value + "&World!", "&", " "));
}

function test(check) {
  __trace(10, check({
    table: {
      get: () => ({
        value: "Hello,"
      })
    },
    key: 69
  }).returns("Hello, World!"));

  __trace(17, check({
    table: {
      get: () => ({
        value: "&"
      })
    },
    key: 69
  }).returns(" &World!"));
}

export default {
  main,
  test,
  "__data": __data
};