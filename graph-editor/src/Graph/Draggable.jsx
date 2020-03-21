import { useState, useEffect, useCallback, useMemo } from "react";

const Draggable = (cx, cy, handleStart=null, handleMove=null, handleEnd=null) => {
  const [state, setState] = useState({
    isDragging: false,
    offsetX: 0,
    offsetY: 0,
  });

  // mouse move
  let handleMouseMove = useCallback(
    ({ clientX, clientY, movementX, movementY }) => {
      if (state.isDragging && handleMove) {
        handleMove({
          x: clientX - state.offsetX,
          y: clientY - state.offsetY,
          dx: movementX,
          dy: movementY
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
        handleMove({x: x, y: y, dx: 0, dy: 0});
      if (handleEnd)
        handleEnd({x: x, y: y, dx: 0, dy: 0});
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
      handleStart({x: x - offX, y: y - offY, dx: 0, dy: 0});
    if (handleMove)
      handleMove({x: x - offX, y: y - offY, dx: 0, dy: 0});
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