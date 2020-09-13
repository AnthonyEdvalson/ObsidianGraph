let __data = {};
function __trace(id, v) {
    return __data[id] = v;
}
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
__trace(6, ReactDOM.render((<App />), document.getElementById('root')));
__trace(11, serviceWorker.unregister());
export default {
    test: 123,
    x: 4,
    __data
};