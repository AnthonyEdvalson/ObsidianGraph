import React, { useEffect, useCallback } from 'react';
import './Graph.css';
import Links from './Node/Port/Links';
import Node from './Node';
import { useSelector, useDispatch } from 'react-redux';
import Toolbar from './Toolbar';
import Draggable from './Draggable';
import useSelectable from './useSelectable';

function useGraphMove(transform, dispatch) {
  let {x, y} = transform;

  const drag = Draggable(x, y, null, useCallback(({dx, dy}) => {
    dispatch({type: "MOVE_GRAPH", dx, dy});
  }, [dispatch]));

  function handleScroll(e) {
    dispatch({type: "MOVE_GRAPH", ds: (e.deltaY > 0 ? 0.9 : 1.1), pivot: {x: e.clientX, y: e.clientY}});
  }

  return [drag.handleMouseDown, handleScroll];
}

function Graph(props) {
  const dispatch = useDispatch();
  const graph = useSelector(state => state.graph.present);
  let [, setSelect] = useSelectable("graph", null);
  let [dragHandleMouseDown, handleScroll] = useGraphMove(graph.transform || {x: 0, y: 0}, dispatch);

  useEffect(() => {
    function downHandler({key}) {
      if (key === "Delete" || key === "Backspace") {
        dispatch({type: "DELETE_SELECTION"});
      }
    }

    window.addEventListener('keydown', downHandler);
    return () => {window.removeEventListener('keydown', downHandler)};
  }, [dispatch]);

  if (!graph.meta)
    return <div className="Graph" />;

    let t = graph.transform;


  function handleMouseDown(e) {
    if (e.button === 0)
      setSelect(e);

    if (e.button === 2)
      dragHandleMouseDown(e);
  }


  return (
    <div className="Graph" onMouseDown={handleMouseDown} onWheel={handleScroll}>
      <Toolbar />
      <div className="graph-body" style={{transform: `scale(${t.scale}) translate(${(t.x - 300) / t.scale}px, ${(t.y - 30) / t.scale}px)`}}>
        {
          Object.keys(graph.nodes).map(key => (
            <Node key={key} k={key} />
          ))
        } 
        <Links />
      </div>
    </div>
  );
}


export default Graph;
