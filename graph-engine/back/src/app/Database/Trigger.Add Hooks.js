function main({table, create, update, destroy}) {
  table = table();
  
  if (create)
	  table.addHook('afterCreate', create);
  
  if (update)
    table.addHook('afterUpdate', update);

  if (destroy)
    table.addHook('afterDestroy', destroy);

  return table;
}

export default { main };
