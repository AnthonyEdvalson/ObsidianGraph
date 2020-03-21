import React, { useState } from 'react';
import './Foldout.css';
import Heading from '../Heading';
import Collapse from '../Collapse';

function Foldout(props) {
    const [open, setOpen] = useState(props.open || true);
    let body = null;
    
    if (open) {
        body = (
            <div className="foldout-body">
                {open && props.children}
            </div>
        )
    }

    return (<div className={open ? "Foldout ui-elem" : "Foldout ui-elem foldout-open"} onClick={() => {}}>
        <Heading label={props.label}>
            <Collapse open={open} onClick={() => setOpen(prevState => (!prevState))}></Collapse>
            {props.actions}
        </Heading>
        {body}
    </div>);
}

export default Foldout;
