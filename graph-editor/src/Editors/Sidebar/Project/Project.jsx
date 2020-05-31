import React from 'react';
import Tree from '../../Tree';
import './Project.css';
import { useSelector, useDispatch } from 'react-redux';


async function openGraph(key, dispatch) {
    dispatch({ type: "LOAD_GRAPH", key });
}

async function importGraph(key, dispatch) {
    dispatch({ type: "NEW_NODE", nodeType: "graph", key });

}

function Project() {
    //let [tree, setTree] = useState(null);
    let dispatch = useDispatch();

    let project = useSelector(state => state.project);

    /*useEffect(() => {
        async function fetchTree() {
            let root = await traverseProject(projPath, dispatch);
            setTree(root);
        }
        fetchTree();
    }, [projPath, dispatch]);*/

    let tree = {
        contents: [],
        label: project.name
    }

    for (let [key, graph] of Object.entries(project.graphs)) {
        tree.contents.push({
            label: graph.present.meta.name,
            onClick: event => {
                if (event.button === 0)
                    openGraph(key, dispatch);
                if (event.button === 2)
                    importGraph(key, dispatch);
            }
        });
    }

    return (
        <div className="Project">
            <Tree root={tree}/>
        </div>
    )
}

export default Project;