import React from 'react';
import './Panel.css';

function Panel(props) {
    let orientation = props.vertical ? "vertical" : "horizontal";
    
    return (
        <div className={"Panel " + orientation}>
            {props.children}
        </div>
    )
}

export default Panel;