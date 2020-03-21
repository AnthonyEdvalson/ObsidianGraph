import React, {useEffect, useState, useCallback} from 'react';
import ReactDOM from 'react-dom';
import StackTrace from 'stacktrace-js';
import ErrorPage from './ErrorPage';


var $ = require("jquery");


function getStacktrace(error) {
  return StackTrace.fromError(error).then(trace => {
    let st =trace.map(frame => {
      return {
        file: frame.fileName || "...",
        frame: frame.functionName || "...",
        line: "...",
        lineno: frame.lineNumber || 1,
        important: !frame.fileName.includes("node_modules")
      };
    });
    st.reverse();
    st.pop(); // TODO instead of pop, it should label the obsidian frames as not important, and highlight the first frame made by the user
    return st;
  });
}


function except(softFail, errorData, error, requestJson) {
  if (!softFail) {
    let fsp = getStacktrace(error);

    fsp.then(fst => {
        var elem = React.createElement(ErrorPage, {error: errorData, frontStack: fst, requestJson});
        ReactDOM.render(elem, document.getElementById('root'));
    });
  }
  
  //error.data = errorData;
  //error.requestJson = requestJson;
  //throw error;
}


function call(node, args, pinnedError, softFail=false) {
  if (typeof(args) === "undefined")
    throw Error ("The arguments being passed to call " + node + " is undefined");
  if (args === null || (typeof args) !== "object")
    throw Error("Args should be an object containing argument names and values, not '" + (typeof args) + "'");
  if (typeof(node) !== "string")
    throw Error("node should be a string, but was " + typeof node);

  let requestJson = JSON.stringify({
    v: 1,
    node,
    args
  }, null, 2);

  return $.post(`${window.location.protocol}//${window.location.hostname}:5000/call`, requestJson, null, "text").then((data) => {
    let res = JSON.parse(data);
    if (res.status === "success") {
      return [true, res.data];
    }

    except(softFail, res.data, pinnedError, requestJson);
    return [false, res.data];
  }).fail((xhr, ajaxOptions, thrownError) => {
    return [false, JSON.parse(xhr.responseText).data];
  });
}


function useRemote(name, args) {
  const [state, setState] = useState({loaded: false, failed: false, data: null, error: null});
  let pinnedError = Error();
  useEffect(() => {
    call(name, args, pinnedError).then(([pass, data]) => {
      if (pass)
        setState({loaded: true, failed: false, data, error: null});
      else
        setState({loaded: false, failed: true, data: null, error: data});
    });
  }, [name]);
  
  return [state.loaded, state.data, state.failed, state.error];
}

function useCall() {
  const [state, setState] = useState({loading: false, loaded: false, failed: false, data: null, error: null});
  const callback = useCallback((name, args) => {
    let pinnedError = Error();
    setState({...state, loading: true});
    call(name, args, pinnedError).then(([pass, data]) => {
      if (pass)
        setState({loading: false, loaded: true, failed: false, data, error: null});
      else
        setState({loading: false, loaded: false, failed: true, data: null, error: data});
    });
  }, [setState]);

  return [callback, state];
}

export { useRemote, useCall, call }