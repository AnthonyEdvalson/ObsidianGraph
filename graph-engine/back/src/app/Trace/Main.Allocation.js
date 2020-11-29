async function main({today}) {
  let counts = {};
  today = await today();

  for (let {action} of today) {
    if (!(action in counts))
      counts[action] = 0;

    counts[action] += 1;
  }

  return counts;
}

export default { main };
