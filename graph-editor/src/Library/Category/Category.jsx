import React from 'react';
import UI from '../../UI';
import LibNode from '../LibNode';
import './Category.css';

function Category(props) {
    if (props.data === null)
        return null;

    const {name, categories, nodes} = props.data;
    const search = props.search;

    let content = [];

    categories.forEach(catData => {
        content.push(<Category key={catData.name} data={catData} search={search} />);
    });

    nodes.forEach(nodeData => {
        content.push(<LibNode key={nodeData.name} data={nodeData} search={search} />);
    });

    return (
        <div className="Category">
            <UI.Foldout label={name}>
                {content}
            </UI.Foldout>
        </div>
    );
}

export default Category;
