import { useState, useEffect } from 'react';
import Engine from './pack';
import SocketIO from 'socket.io-client';

const engine = new Engine("front");

function EngineUI() {
	let [socket, setSocket] = useState(null);

	engine.errorHandler = error => {
		socket.emit("report", error)
	}

	useEffect(() => {
		let handler = event => {
			//setError(event.reason);
		}

		window.addEventListener('unhandledrejection', handler);
		return () => window.removeEventListener('unhandledrejection', handler);
	}, []);

	useEffect(() => {
		let socket = SocketIO("http://localhost:5000");
		socket.on('connect', () => {setSocket(socket)});
		return socket.disconnect;
	}, []);

	if (socket)
		return engine.start(socket);
	else
		return null;
}

export default EngineUI;