import StackTrace from 'stacktrace-js';
import React from 'react';
import ErrorPage from './ErrorPage';
import ReactDOM from 'react-dom';

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

function except(errorData, error, requestJson) {
  let fsp = getStacktrace(error);

  fsp.then(fst => {
      var elem = React.createElement(ErrorPage, {error: errorData, frontStack: fst, requestJson});
      ReactDOM.render(elem, document.getElementById('root'));
  });
}


function call(node, args, softFail=false) {
  if (typeof(args) === "undefined")
    throw Error ("The arguments being passed to call " + node + " is undefined");
  if (args === null || (typeof args) !== "object")
    throw Error("Args should be an object containing argument names and values, not '" + (typeof args) + "'");
  if (typeof node !== "string")
    throw Error("node should be a string, but was " + typeof node);

  let requestJson = JSON.stringify({
    v: 1,
    node,
    args
  }, null, 2);

  let pinnedError = Error(); // Create an error now that is more useful than if one were made deep into the promises up ahead

  return $.post(`${window.location.protocol}//${window.location.hostname}:5000/call`, requestJson, null, "text").then((data) => {
    let res = JSON.parse(data);
    if (res.status === "success") {
      return res.data;
    }
    else {
      if (softFail) {
        let e = Error();
        e.data = res.data;
        e.requestJson = requestJson;
        throw e;
      }
      
      except(res.data, pinnedError, requestJson);
      return res.data;
    }
      
  }).fail((xhr, ajaxOptions, thrownError) => {
    let error = null;
    error = JSON.parse(xhr.responseText);

    if (softFail)
    {
      let e = Error();
      e.data = error.data;
      e.requestJson = requestJson;
      throw e;
    }

    except(error.data, pinnedError, requestJson);

    return [xhr, error];
  });
}

export {call};