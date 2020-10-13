function main({perms, create, read, update, del, readAll, upsert}) {
  let allowed = {};
  perms = perms();

  addIfAllowed(allowed, perms.create, "Creating new", {create});
  addIfAllowed(allowed, perms.read, "Reading", {read, readAll});
  addIfAllowed(allowed, perms.update, "Updating existing", {update});
  addIfAllowed(allowed, perms.del, "Deleting", {del});
  addIfAllowed(allowed, perms.create && perms.update, "Creating and updating", {upsert});
    
  return allowed;
}

function addIfAllowed(actions, allowed, verb, newActions) {
  for (let [k, v] of Object.entries(newActions)) {
    if (allowed)
      actions[k] = v;
    else
      actions[k] = () => { throw new Error(verb + " entries is not allowed")}
  }
}

export default { main };
