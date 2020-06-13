import React, { useState } from 'react';
import './Graph.css';
import Links from './Node/Port/Links';
import Node from './Node';
import { useDispatch, useSelector } from 'react-redux';
import Toolbar from './Toolbar';
import useSelectable from './useSelectable';
import RectSelect from './RectSelect';
import Panner from './Panner';
import graphs, { useGraphSelector, OpenGraphContext } from '../../logic/graphs';
import projects from '../../logic/projects';


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
      dispatch({type: "SELECT_RECT", region, ctrl, graphId: graph.key});
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
      <GraphRenderContents moving={moving} transform={t} setTransform={setT} setMoving={setMoving} handleDrag={handleDrag} selectRect={selectRect}/>
    </div>
  );
}
/*
function GraphRender(props) {
  let project = useSelector(state => state.project);
  let packs = projects.getPackages(project.path);
  console.log(props, project, packs)
  let graph = graphs.getGraphFromLocation(props.location, project, packs);
  return (
    <OpenGraphContext.Provider value={graph}>
      <GraphRenderContents { ...props } />
    </OpenGraphContext.Provider>
  )
}*/

function GraphRenderContents({ moving, transform, setTransform, setMoving, handleDrag, selectRect }) {
  return (
    <Panner transform={transform} setTransform={setTransform} setMoving={setMoving} handleDrag={handleDrag}>
      <div className="graph-body">
        <RectSelect region={selectRect} />
        {
          Object.keys(useGraphSelector(graph => graph.nodes)).map(key => (
            <Node moving={moving} key={key} k={key} transform={transform}/>
          ))
        } 
        <Links />
      </div>
    </Panner>
  )
}


export default Graph;
//export { GraphRender };
