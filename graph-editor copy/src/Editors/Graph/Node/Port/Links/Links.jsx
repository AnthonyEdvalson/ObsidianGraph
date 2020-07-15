import React from 'react';
import Link from './Link';
import { useSelector } from 'react-redux';

function Links() {
    let links = useSelector(state => state.graph.present.links);

    return (
        <svg className="Links" width={10000} height={10000} viewBox="-5000 -5000 10000 10000" style={{transform: "translate(-5000px, -5000px)"}}>
            {
                Object.entries(links).map(([sink, source]) => {
                    return <Link sink={sink} source={source} key={sink}></Link>
                })
            }
        </svg>
    )
}

export default Links;
