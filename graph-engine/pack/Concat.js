const _ = require('lodash');

function main(o) {
	return _.replace(o.load(o.ins["a"]) + "&" + o.load(o.ins["b"]), "&", " ");
}

module.exports = main;