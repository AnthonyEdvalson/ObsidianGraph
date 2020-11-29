async function main({table}, id) {
  //let row = await table().findByPk(id);
	//return await row.destroy();

  return await table().destroy({ where: {id} });
}

export default { main };
