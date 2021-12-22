export function updateAccount(state, account) {
  state.account = account;
}

export function updateUser(state, user) {
  Object.entries(user).forEach(([key, value]) => {
    if (key in state) { state[key] = value; }
  });
}
