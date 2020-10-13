async function main({tasks, add}) {
  let all = await tasks().findAll();
  return {all, add};
}

export default { main };
