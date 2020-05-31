import React, { useState } from 'react';
import './Graph.css';
import Links from './Node/Port/Links';
import Node from './Node';
import { useDispatch } from 'react-redux';
import Toolbar from './Toolbar';
import useSelectable from './useSelectable';
import RectSelect from './RectSelect';
import Panner from './Panner';
import { useGraphSelector } from '../../logic/graphs';


function Graph(props) {
  const dispatch = useDispatch();
  const graph = useGraphSelector();
  let [, setSelect] = useSelectable("graph", null);
  let [t, setT] = useState({x: 0, y: 0, s: 1});
  let [selectRect, setSelectRect] = useState(null);
  let [moving, setMoving] = useState(false);

  function handleDrag(button, region, ctrl, tap, last) {
    if (button !== 0)
      return;

    if (tap) {
      setSelect();
      setSelectRect(null);
    }
    else if (selectRect !== null || (region.width > 3 || region.height > 3)) {
      dispatch({type: "SELECT_RECT", region, ctrl});
      setSelectRect(region);
    }

    if (last) 
      setSelectRect(null);
  }

  if (!graph)
    return <div className="Graph" />;

  return (
    <div className="Graph">
      <Toolbar />
      <Panner transform={t} setTransform={setT} setMoving={setMoving} handleDrag={handleDrag}>
        <div className="graph-body">
          <RectSelect region={selectRect} />
          {
            Object.keys(graph.nodes).map(key => (
              <Node moving={moving} key={key} k={key} transform={t}/>
            ))
          } 
          <Links />
        </div>
      </Panner>
    </div>
  );
}


export default Graph;
