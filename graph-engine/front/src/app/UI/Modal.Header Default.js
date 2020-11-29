import React from 'react';

function Main({config}) {
	return config().header;
}

export default { main: Main };
