import React, { useMemo } from 'react';

import './EventBlock.css';

function EventBlock({event, transform, now}) {
    let {offset, scale} = transform;
    let eventEnd = event.end;

    let end = eventEnd || now;
    let { start, depth, error, type, location } = event;

    let left = Math.round((-offset + start) * scale) - 1;
    let top = depth * 20;
    let width = Math.round(scale * end) - Math.round(scale * start) + 2;

    return useMemo(() => {
        let style = {
            left: left + "px",
            top: top + "px",
            width: width + "px",
            height: "20px"
        };

        let small = width < 45;
    
        return (
            <div className={"EventBlock block-" + type + (error ? " error" : "") + (small ? " small" : "")} style={style}>
                { !small && location.functionName }
            </div>
        )
    }, [left, top, width, error, type, location]);
}

export default EventBlock;