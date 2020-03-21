import React from 'react';
import './App.css';
import Graph from './Graph';
import Sidebar from './Sidebar';
import { Provider } from 'react-redux';
import store from './store';
import MenuBar from './MenuBar';

function App () {
  return (
    <div className="App">
      <Provider store={store}>
        <MenuBar />
        <div className="app-body">
          <Sidebar />
          <Graph />
        </div>
      </Provider>
    </div>
  );
}

export default App;
