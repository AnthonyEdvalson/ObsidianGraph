import React from 'react';
import './TreeNode.css';
import UI from '../../../UI';

function TreeNode(props) {
    let data = props.data;
    if (!data)
        return null;
        
    const { label, contents, render, onClick } = data;

    if (render)
        return render(data);

    if (typeof(contents) !== "undefined") {
        return (
            <div className="TreeNode tree-node-container">
                <UI.Foldout label={label} open={false}>
                    {
                        contents.map(n => <TreeNode data={n} key={n.label} />)
                    }
                </UI.Foldout>
            </div>
        );
    }
    else {
        return (
            <div className="TreeNode tree-node-item" onMouseUp={onClick}>
                { label }
            </div>
        );
    }
}

export default TreeNode;
