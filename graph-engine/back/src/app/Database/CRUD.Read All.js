async function main({table}) {
	return await table().findAll();
}

export default { main };
