export function transitionHelper({ skipTransition = false, updateDOM }) {
  if (skipTransition || !document.startViewTransition) {
    const updateCallbackDone = Promise.resolve(updateDOM()).then(() => {});
    return {
      ready: Promise.resolve(),
      updateCallbackDone,
      finished: updateCallbackDone,
    };
  }

  let ready;
  const readyPromise = new Promise((resolve) => (ready = resolve));
  const transition = document.startViewTransition(async () => {
    ready();
    await updateDOM();
  });

  return {
    ready: readyPromise,
    updateCallbackDone: transition.finished,
    finished: transition.finished,
  };
}