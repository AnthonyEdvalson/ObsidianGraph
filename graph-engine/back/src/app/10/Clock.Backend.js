let i = 0;
let x = 0;

function main({mul}, interval, callback) {

	i = setInterval(async () => {
    console.log("tick... " + x);
    let result = await callback(x, 15);
    x += 1;
    console.log("<<< " + result)
  }, 5000);

  return "Starting";
}

export default { main }