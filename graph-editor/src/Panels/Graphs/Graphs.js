import React, { useState } from 'react';
import './Graphs.css';
import Links from './Node/Port/Links';
import Node from './Node';
import Toolbar from './Toolbar';
import useSelectable from './useSelectable';
import RectSelect from './RectSelect';
import Panner from './Panner';
import { useGraphDispatch, useGraphSelector } from '../../logic/scope';
import Panel from '../Panel';
import EditNode from '../../Modals/EditNode/EditNode';


function EditGraphs(props) {
  let [transform, setTransform] = useState({x: 0, y: 0, s: 1});
  let [editingNodeId, setEditingNodeId] = useState(null);
  let [moving, setMoving] = useState(false);
  let [handleDrag, selectRect] = useGraphDrag();
  let nodes = useGraphSelector(graph => graph.nodes);

  let content = null;
  
  if (nodes) {
    content = (
      <>
        <Toolbar />
        <Panner transform={transform} setTransform={setTransform} setMoving={setMoving} handleDrag={handleDrag}>
          <div className="graph-body">
            <RectSelect region={selectRect} />
            {
              Object.keys(nodes).map(key => 
                <Node moving={moving} key={key} k={key} transform={transform} setEditingNodeId={setEditingNodeId}/>
              )
            } 
            <Links />
          </div>
        </Panner>
      </>
    );
  }

  return (
    <Panel>
      <div className="Graph">
        {content}
      </div>
      <EditNode node={editingNodeId} close={() => { setEditingNodeId(null) }}/>
    </Panel>
  );
}


function useGraphDrag() {
  const dispatch = useGraphDispatch();
  let [, setSelect] = useSelectable("graph", null);
  let [selectRect, setSelectRect] = useState(null);

  function handleDrag(button, region, ctrl, tap, last) {
    if (button !== 0)
      return;

    if (tap) {
      setSelect();
      setSelectRect(null);
    }
    else if (selectRect !== null || (region.width > 3 || region.height > 3)) {
      dispatch({type: "SELECT_RECT", region, ctrl}); // TODO Only update at the end?
      setSelectRect(region);
    }

    if (last) 
      setSelectRect(null);
  }

  return [handleDrag, selectRect];
}


export default EditGraphs;
