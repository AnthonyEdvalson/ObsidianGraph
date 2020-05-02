const React = require('react');

function main(o) {
    let text = o.useRemote("input");
    return <span>{text}</span>
}

module.exports = main;
