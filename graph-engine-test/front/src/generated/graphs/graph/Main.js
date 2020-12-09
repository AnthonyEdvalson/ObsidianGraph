import { useEffect, useState } from 'react';


function Main({backend}, props) {
    console.log(123);
    let [motd, setMotd] = useState("...");

    useEffect(() => {
        backend("Hello, ").then((v) => {
            console.log(v);
            setMotd(v);
        });
    }, []);

    console.log(motd)
    return <span>{motd}</span>
}


let node = { main: Main };
export default node;
