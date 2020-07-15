  
import React from 'react';
import ReactDOM from 'react-dom';
import EngineUI from './EngineUI';
import registerServiceWorker from './registerServiceWorker';

ReactDOM.render(<EngineUI />, document.getElementById('root'));

registerServiceWorker();