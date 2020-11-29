function main({}, username, password) {
  if (username === password) {
    return {
      success: true,
      cookie: "YOU WIN!"
    }
  }
  else {
    return {
      success: false
    }
  }
}

export default { main };
