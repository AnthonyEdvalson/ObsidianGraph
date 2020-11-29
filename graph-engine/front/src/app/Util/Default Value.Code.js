function main({defaultValue, override}, ...args) {
  let o = override(...args);
  
  if (o !== undefined)
    return o;
  
  return defaultValue(...args);
}

function test(check) {
  check({
    defaultValue: 10,
    override: 5
  }).returns(5);

  check({
    defaultValue: 10
  }).returns(10);
}

export default { main, test };
