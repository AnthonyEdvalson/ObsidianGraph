import React from 'react';
import {useCall} from '../../obsidian';
import './Traceback.css';

function Traceback(props) {
  const [call, callState] = useCall();
  var tb = props.tb;
  var title = props.title;
  var found_first = false;
  tb.reverse();

  return (
    <div className="Traceback">
      <h2>{title}</h2>
      <div className="framebox">
        {tb.map((frame, i) => {
          var path = `${frame.file}:${frame.lineno.toString()}`;
          var first = !found_first;
          found_first = true;
          return (
            <div key={i} className={first ? "frame first" : (frame.important ? "frame" : "frame subtle")} onClick={() => call("@open source", {file: frame.file, lineno: frame.lineno})}>
              <span className="name">{frame.frame}</span>
              <span className="path" title={path}>{path}</span>
              {frame.important && <span className="line">{frame.line}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Traceback;
