import React from 'react';
import './RectSelect.css';

function RectSelect(props) {
    const {region} = props;

    if (!region)
        return null;
    
    let x = Math.min(region.x, region.x + region.width);
    let y = Math.min(region.y, region.y + region.height);
    let width = Math.abs(region.width);
    let height = Math.abs(region.height);

    if (width + height < 1)
        return null;

    let style = {transform: `translate(${x}px, ${y}px)`, width, height};
    return (<div className="RectSelect" style={style} />);
}

export default RectSelect;
