function buildAction(state, copy) {
  const current = state || {};
  if (!current.loggedIn) {
    return { label: copy.signInToRecord, disabled: false };
  }
  if (current.status === "error") {
    return { label: copy.recordUnavailable, disabled: true };
  }
  if (current.status !== "ready") {
    return { label: copy.loadingRecord, disabled: true };
  }
  return {
    label: current.hasRecord ? copy.viewToday : copy.recordToday,
    disabled: false
  };
}

module.exports = { buildAction };
