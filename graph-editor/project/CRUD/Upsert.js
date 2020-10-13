async function main({table}, newColumns) {
  return await table().upsert(newColumns);
}

export default { main };
