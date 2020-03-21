import React, { useRef } from 'react';
import './Graph.css';
import Links from './Node/Port/Links';
import Node from './Node';
import { useSelector } from 'react-redux';
import Toolbar from './Toolbar';


function Graph(props) {
  const graphRef = useRef(null);
  //const dispatch = useDispatch();
  const graph = useSelector(state => state);

  /*const handleMouseDown = useCallback((e) => {
    if (e.button === 2)
      dispatch({type: "NEW_NODE", key: uuid4()});
  }, [dispatch]);*/

  let content = null;

  if (graph !== null)
  {
    if (graph.state === "error")
      content = <h1>Cannot connect to server</h1>;
    else
      content = Object.keys(graph.nodes).map(key => (
        <Node
          key={key}
          k={key}
        />
      ));
  }
  return (
    <div className="Graph" /*onMouseDown={handleMouseDown}*/ ref={graphRef}>
      <Toolbar />
      <div className="graph-body">
        {content}
        <Links />
      </div>
    </div>
  );
}


export default Graph;
