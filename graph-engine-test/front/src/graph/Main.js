import { useEffect } from "react";
import { useEffect, useState } from 'react';

function Main({backend}, props) {
    let [motd, setMotd] = useState("...");

    useEffect(() => {
        backend("Hello, ").then(setMotd);
    });

    return <span>{motd}</span>
}

export default { main: Main }
