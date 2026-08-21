const clone = (value) => structuredClone(value);

export function createHistoryController(limit = 80) {
  let past = [];
  let future = [];
  let transactionStart = null;

  const trim = () => {
    if (past.length > limit) past = past.slice(past.length - limit);
  };

  return {
    clear() {
      past = [];
      future = [];
      transactionStart = null;
    },

    canUndo() {
      return past.length > 0;
    },

    canRedo() {
      return future.length > 0;
    },

    inTransaction() {
      return transactionStart !== null;
    },

    checkpoint(snapshot) {
      if (transactionStart !== null) return false;
      past.push(clone(snapshot));
      trim();
      future = [];
      return true;
    },

    begin(snapshot) {
      if (transactionStart !== null) return false;
      transactionStart = clone(snapshot);
      return true;
    },

    commit() {
      if (transactionStart === null) return false;
      past.push(transactionStart);
      transactionStart = null;
      trim();
      future = [];
      return true;
    },

    cancel() {
      transactionStart = null;
    },

    undo(currentSnapshot) {
      if (!past.length) return null;
      transactionStart = null;
      const previous = past.pop();
      future.push(clone(currentSnapshot));
      return clone(previous);
    },

    redo(currentSnapshot) {
      if (!future.length) return null;
      transactionStart = null;
      const next = future.pop();
      past.push(clone(currentSnapshot));
      trim();
      return clone(next);
    },
  };
}
