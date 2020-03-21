import React, { useMemo } from 'react';
import './Link.css';

function Link(props) {
    return useMemo(() => {
        if (props.x1 === null || props.x2 === null)
            return null;

        let x1 = props.x1;
        let y1 = props.y1;
        let x2 = props.x2;
        let y2 = props.y2;

        let xm = (x1 + x2) / 2;
        let ym = (y1 + y2) / 2;

        let c = Math.min(x1 - 75, (xm + x1) / 2);
        c = Math.max(c, x1 - 0.35 * Math.abs(y1 - y2));

        let pathProps = {
            strokeLinecap: "round",
            d: `M ${x1} ${y1} Q ${c} ${y1}, ${xm} ${ym} T ${x2} ${y2}`,
            stroke: "var(--js-bright)",
            strokeWidth: 6,
            fill: "none",
            opacity: 1
        };

        if (props.dashed)
            pathProps.strokeDasharray = "0, 14, 12, 14";

        return (
            <path {...pathProps}/>
        );
    }, [props.x1, props.y1, props.x2, props.y2, props.dashed]);
}

export default Link;
