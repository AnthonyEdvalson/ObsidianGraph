import { useState, useEffect, useCallback, useMemo } from "react";

const Draggable = (cx, cy, handleStart=null, handleMove=null, handleEnd=null) => {
  const [state, setState] = useState({
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
  });

  // mouse move
  let handleMouseMove = useCallback(
    e => {
      if (state.isDragging && handleMove) {
        handleMove({
          x: e.clientX - state.offsetX,
          y: e.clientY - state.offsetY,
          dx: e.movementX,
          dy: e.movementY,
          e
        });
      }
    },
    [state.isDragging, handleMove, state.offsetX, state.offsetY]
  );

  // mouse left click release
  const handleMouseUp = useCallback((e) => {
    e.stopPropagation();
    e.preventDefault();
    let x = e.clientX;
    let y = e.clientY;
    let offX = x - cx;
    let offY = y - cy;

    x -= offX;
    y -= offY;

    if (state.isDragging) {
      setState(prevState => ({
        ...prevState,
        isDragging: false
      }));
      if (handleMove)
        handleMove({x: x, y: y, dx: 0, dy: 0, e});
      if (handleEnd)
        handleEnd({x: x, y: y, dx: 0, dy: 0, e});
    }
  }, [state.isDragging, cx, cy, handleEnd, handleMove]);

  // mouse left click hold
  const handleMouseDown = useCallback((e)=> {
    e.stopPropagation();
    e.preventDefault();
    let x = e.clientX;
    let y = e.clientY;
    let offX = x - cx;
    let offY = y - cy;
    
    setState(prevState => ({
      ...prevState,
      isDragging: true,
      offsetX: offX,
      offsetY: offY
    }));

    if (handleStart)
      handleStart({x: x - offX, y: y - offY, dx: 0, dy: 0, e});
    if (handleMove)
      handleMove({x: x - offX, y: y - offY, dx: 0, dy: 0, e});
  }, [cx, cy, handleMove, handleStart]);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);
  return useMemo(() => ({x: state.translateX, y: state.translateY, handleMouseDown}), [state, handleMouseDown]);
};

export default Draggable;