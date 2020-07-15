import React from 'react';
import './Tree.css';
import TreeNode from './TreeNode';


function Tree(params) {
    let root = params.root;

    return (
        <div className="Tree">
            <TreeNode data={root} />
        </div>
    );
}

export default Tree;
