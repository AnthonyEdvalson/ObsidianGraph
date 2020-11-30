import { useEffect, useState } from 'react';

function Main({backend}, props) {
    let [motd, setMotd] = useState("...");

    useEffect(() => {
        backend("Hello, ").then(setMotd);
    }, []);

    return <span>{motd}</span>
}

let node = { main: Main }
export default node;
