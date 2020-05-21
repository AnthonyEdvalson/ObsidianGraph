import React, { useState, useRef, useEffect } from 'react';
import './Graph.css';
import Links from './Node/Port/Links';
import Node from './Node';
import { useSelector, useDispatch } from 'react-redux';
import Toolbar from './Toolbar';
import useSelectable from './useSelectable';
import RectSelect from './RectSelect';
import Panner from './Panner';
import { useDrag } from 'react-use-gesture';

function clientToGraph(x, y, gt, offset=true) {
  return [
      (x - (offset ? gt.x : 0)) / gt.s,
      (y - (offset ? gt.y : 0)) / gt.s
  ];
}

function Graph(props) {
  const dispatch = useDispatch();
  const graph = useSelector(state => state.graph.present);
  let [, setSelect] = useSelectable("graph", null);
  let [t, setT] = useState({x: 0, y: 0, s: 1});
  let [selectRect, setSelectRect] = useState(null);

  function handleDrag(button, region, ctrl, tap, last) {
    if (button !== 0)
      return;

    if (tap) {
      setSelect();
      setSelectRect(null);
    }
    else {
      dispatch({type: "SELECT_RECT", region, ctrl});
      setSelectRect(region);
    }

    if (last) 
      setSelectRect(null);
  }

  if (!graph.meta)
    return <div className="Graph" />;
  /*
  function handleMouseDown(e) {
    if (e.button === 0)
      setSelect(e);
  }

  function handleMouseUp(e) {
    if (e.button === 0)
      setSelectRect(null);
  }*/

  return (
    <div className="Graph">
      <Toolbar />
      <Panner transform={t} setTransform={setT} handleDrag={handleDrag}>
        <div className="graph-body">
          <RectSelect region={selectRect} />
          {
            Object.keys(graph.nodes).map(key => (
              <Node key={key} k={key} transform={t}/>
            ))
          } 
          <Links />
        </div>
      </Panner>
    </div>
  );
}


export default Graph;
