import React from 'react';
import './App.css';
import Graph from './Graph';
import Sidebar from './Sidebar';
import { Provider } from 'react-redux';
import store from './store';

function App () {
  return (
    <div className="App">
      <Provider store={store}>
        <Sidebar />
        <Graph />
      </Provider>
    </div>
  );
}

export default App;
