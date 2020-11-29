async function main({actionController}) {
  return await actionController().readAll();
}

export default { main };
