import React, { useCallback, useState } from 'react';
import './Graph.css';
import Links from './Node/Port/Links';
import Node from './Node';
import { useSelector, useDispatch } from 'react-redux';
import Toolbar from './Toolbar';
import Draggable from './Draggable';
import useSelectable from './useSelectable';
import RectSelect from './RectSelect';

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

function clientToGraph(x, y, gt) {
  return {
      x: (x - gt.x) / gt.scale,
      y: (y - gt.y) / gt.scale
  }
}

function useRectSelect(gt) {
  let [region, setRegion] = useState(null);
  let [ctrl, setCtrl] = useState(false);
  const dispatch = useDispatch();

  const drag = Draggable(0, 0, null, useCallback(({dx, dy, e}) => {
    if (!region) {
      let {x, y} = clientToGraph(e.clientX, e.clientY, gt);
      setRegion({x, y, width: dx, height: dy});
      setCtrl(e.ctrlKey);
    }
    else {
      let dx2 = dx / gt.scale;
      let dy2 = dy / gt.scale;
      let newRegion = {...region, width: region.width + dx2, height: region.height + dy2};
      setRegion(newRegion);
      if (Math.abs(newRegion.width) > 1 && Math.abs(newRegion.height) > 1)
        dispatch({type: "SELECT_RECT", region: newRegion, ctrl});
    }
  }, [region, setRegion, dispatch, gt, ctrl]), () => {setRegion(null)});

  return [region, drag.handleMouseDown, ctrl];
}

function Graph(props) {
  const dispatch = useDispatch();
  const graph = useSelector(state => state.graph.present);
  let [, setSelect] = useSelectable("graph", null);
  let t = graph.transform || {x: 0, y: 0};
  let [handlePan, handleScroll] = useGraphMove(t, dispatch);
  let [selectRegion, handleSelect] = useRectSelect(t || {x: 0, y: 0});

  /*function handleKeyDown({key}) {
    if (key === "Delete" || key === "Backspace") {
      dispatch({type: "DELETE_SELECTION"});
    }
  }*/

  if (!graph.meta)
    return <div className="Graph" />;

  function handleMouseDown(e) {
    if (e.button === 0) {
      setSelect(e);
      handleSelect(e);
    }

    if (e.button === 1)
      handlePan(e);
  }

  return (
    <div className="Graph" onMouseDown={handleMouseDown} onWheel={handleScroll} /*onKeyDown={handleKeyDown}*/>
      <Toolbar />
      <div className="graph-body" style={{transform: `scale(${t.scale}) translate(${(t.x - 300) / t.scale}px, ${(t.y - 30) / t.scale}px)`}}>
        <RectSelect region={selectRegion} />
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
