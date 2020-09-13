import React, { useMemo } from 'react';

import './EventBlock.css';

function EventBlock({event, transform, now}) {
    let {offset, scale} = transform;
    let eventEnd = event.end;

    let end = eventEnd || now;
    let { start, depth, error, type, name } = event;

    let left = ((start - offset) * scale) - 1;
    let top = depth * 20;
    let width = (end - start) * scale + 1;

    if (left < -3) {
        width += left;
        left = -3;
    }

    return useMemo(() => {
        if (left + width < 0 || left > 4000)
            return null;

        let style = {
            left: left + "px",
            top: top + "px",
            width: width + "px",
            height: "20px"
        };

        let small = width < 45;
    
        return (
            <div className={"EventBlock block-" + type + (error ? " error" : "") + (small ? " small" : "")} style={style}>
                { !small && name }
            </div>
        )
    }, [left, top, width, error, type, name]);
}

export default EventBlock;