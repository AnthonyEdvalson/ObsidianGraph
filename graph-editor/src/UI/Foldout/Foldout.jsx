import React, { useState } from 'react';
import './Foldout.css';
import Heading from '../Heading';
import Collapse from '../Collapse';

function Foldout(props) {
    const [open, setOpen] = useState(props.open || true);

    return (<div className="ui-elem Foldout" onClick={() => {}}>
        <Heading label={props.label}>
            <Collapse open={open} onClick={() => setOpen(prevState => (!prevState))}></Collapse>
            {props.actions}
        </Heading>
        <div className={"foldout-body" + (open ? " foldout-body-open" : "")}>
            {props.children}
        </div>
    </div>);
}

export default Foldout;
