import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Graphs.css';
import Links from './Node/Ports/Links';
import Node from './Node';
import Toolbar from './Toolbar';
import useSelectable from './useSelectable';
import RectSelect from './RectSelect';
import Panner from './Panner';
import { useGraphDispatch, useGraphSelector } from '../../logic/scope';
import Panel from '../Panel';
import EditNode from '../../Modals/EditNode/EditNode';
import { ActionCreators } from 'redux-undo';
import NewGraph from '../../Modals/NewGraph/NewGraph';
import { clientToGraph } from './Panner/Panner';
import QuickMenu from './QuickMenu';


function EditGraphs({ setMenu }) {
  let [transform, setTransform] = useState({x: 0, y: 0, s: 1});
  let [editingNodeId, setEditingNodeId] = useState(null);
  let [moving, setMoving] = useState(false);
  let [handleDrag, selectRect] = useGraphDrag();
  let [showNewGraph, setShowNewGraph] = useState(false);
  let nodes = useGraphSelector(graph => graph.nodes);
  let dispatch = useGraphDispatch();
  let graph = useRef(null);
  let [rect, setRect] = useState(new DOMRect());
  let [quickMenu, setQuickMenu] = useState(null);

  useEffect(() => {
    const menu = [
      { name: "New Graph...", shortcut: "Mod+Shift+G", action: () => setShowNewGraph(true) },
      null,
      { name: "Undo", shortcut: "Mod+Z", action: () => dispatch(ActionCreators.undo()) },
      { name: "Redo", shortcut: "Mod+Shift+Z", action: () => dispatch(ActionCreators.redo()) },
      null,
      {name: "Select All", shortcut: "Mod+A", action: () => dispatch({type: "SELECT_ALL"})},
      {name: "Copy", shortcut: "Mod+C", action: () => dispatch({type: "COPY"})},
      {name: "Paste", shortcut: "Mod+V", action: () => dispatch({type: "PASTE"})},
      {name: "Duplicate", shortcut: "Mod+D", action: () => dispatch({type: "DUPLICATE"})}
    ];

    setMenu("Graph", menu);
  }, [setMenu, dispatch, setShowNewGraph]);

  useEffect(() => {
    if (!graph.current)
      return;

    setRect(graph.current.getBoundingClientRect());
  }, [graph]);

  let content = null;
  let center = clientToGraph(rect.x + rect.width / 2, rect.y + rect.height / 2, transform);

  let handleClick = useCallback(event => {
    if (event.button === 2) {
      setQuickMenu({
        x: event.nativeEvent.offsetX,
        y: event.nativeEvent.offsetY
      });
    }
  }, []);

  useEffect(() => {
    let listener = window.addEventListener("mouseup", () => {
      setQuickMenu(null);
    });

    return () => window.removeEventListener(listener);
  }, []);

  if (nodes) {
    content = (
      <>
        <Toolbar center={center} />
        <Panner transform={transform} setTransform={setTransform} setMoving={setMoving} handleDrag={handleDrag} zoomSensitivity={1} >
          <div className="graph-bg" onMouseDown={handleClick}>
            <div className="graph-body">
              <RectSelect region={selectRect} />
              {
                Object.keys(nodes).map(key => 
                  <Node moving={moving} key={key} k={key} transform={transform} setEditingNodeId={setEditingNodeId}/>
                )
              } 
              <Links />
            </div>
            <QuickMenu position={quickMenu} transform={transform}/>
          </div>
        </Panner>
      </>
    );
  }

  return (
    <Panel>
      <div className="Graph" ref={graph}>
        { editingNodeId ?  "" : content }
      </div>
      <EditNode node={editingNodeId} close={() => { setEditingNodeId(null) }}/>
      <NewGraph open={showNewGraph} handleClose={() => setShowNewGraph(false)} />
    </Panel>
  );
}


function useGraphDrag() {
  const dispatch = useGraphDispatch();
  let {setSelect} = useSelectable("graph", null);
  let [selectRect, setSelectRect] = useState(null);

  function handleDrag(buttons, region, ctrl, tap, last) {
    if (buttons > 1)
      return;
      
    if (tap) {
      setSelect();
      setSelectRect(null);
    }
    else if (selectRect !== null || region.width > 3 || region.height > 3) {
      if (last && region)
        dispatch({type: "SELECT_RECT", region, ctrl}); // TODO Only update at the end?
      else
        setSelectRect(region);
    }

    if (last) 
      setSelectRect(null);
  }

  return [handleDrag, selectRect];
}


export default EditGraphs;
