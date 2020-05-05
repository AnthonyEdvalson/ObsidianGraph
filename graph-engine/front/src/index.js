  
import React from 'react';
import ReactDOM from 'react-dom';
import GraphApp from './GraphApp';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<GraphApp />, document.getElementById('root'));

registerServiceWorker();