import React, { useRef, useEffect } from 'react';
import './Graph.css';
import Links from './Node/Port/Links';
import Node from './Node';
import { useSelector, useDispatch } from 'react-redux';
import Toolbar from './Toolbar';


function Graph(props) {
  const graphRef = useRef(null);
  const dispatch = useDispatch();
  const graph = useSelector(state => state.graph.present);

  function handleMouseDown(e) {
    if (e.button === 0)
      dispatch({type: "SET_SELECTION", items: [{type: "graph"}]})
  }

  useEffect(() => {
    function downHandler({key}) {
      if (key === "Delete" || key === "Backspace") {
        dispatch({type: "DELETE_SELECTION"});
      }
    }

    window.addEventListener('keydown', downHandler);
    return () => {window.removeEventListener('keydown', downHandler)};
  }, [dispatch]);

  return (
    <div className="Graph" onMouseDown={handleMouseDown} ref={graphRef}>
      <Toolbar />
      <div className="graph-body">
        {
          Object.keys(graph.nodes).map(key => (
            <Node key={key} k={key}/>
          ))
        }
        <Links />
      </div>
    </div>
  );
}


export default Graph;
