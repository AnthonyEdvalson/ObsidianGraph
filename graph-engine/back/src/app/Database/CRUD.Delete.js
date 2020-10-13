async function main({table}, id) {
  let row = await table().findByPk(id);
	return await row.destroy();
}

export default { main };
