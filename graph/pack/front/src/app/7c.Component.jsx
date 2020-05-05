import React from 'react';

function main(o) {
    let text = o.useRemote("input");
    return <span>{text}</span>
}

export default main;
