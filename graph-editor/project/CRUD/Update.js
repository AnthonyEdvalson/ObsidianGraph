async function main({table}, newColumns) {
  return await table().update(newColumns);
}

export default { main };
