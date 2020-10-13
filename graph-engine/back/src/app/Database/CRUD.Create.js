async function main({table}, cols) {
	return await table().create(cols);
}

export default { main };
