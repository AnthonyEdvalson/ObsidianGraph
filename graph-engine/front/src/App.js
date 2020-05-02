import React, { Component } from 'react';
import Graph from './shared/engine';

class App extends Component {
  state = {
		data: null
	};

	componentDidMount() {
		// Call our fetch function below once the component mounts
		this.callBackendAPI()
			.then(res => this.setState({ data: res }));
		
		//this.graph = new Graph();
	}
		// Fetches our GET route from the Express server. (Note the route we are fetching matches the GET route from server.js
	callBackendAPI = async () => {
		
		const response = await fetch('/api/call', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			}, 
			body: JSON.stringify({
				node: "Concat",
				args: {}
			}, null, 2)
		});
		
		const body = await response.json();
		console.log(body);
		if (response.status !== 200) {
			throw Error(body.message);
		}
		return body;
	};

	render() {


		return (
			<div className="Graph">

					test
				<p className="App-intro">{JSON.stringify(this.state.data)}</p>
			</div>
		);
	}
}

export default App;