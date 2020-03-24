import React from 'react';
import './App.css';
import Graph from './Graph';
import Sidebar from './Sidebar';
import { Provider } from 'react-redux';
import store from './store';
import MenuBar from './MenuBar';
import NewGraph from './Modals/NewGraph';

function App () {
  return (
    <div className="App">
      <Provider store={store}>
        <MenuBar />
        <div className="app-body">
          <Sidebar />
          <Graph />
        </div>
        <NewGraph />
      </Provider>
    </div>
  );
}

export default App;
