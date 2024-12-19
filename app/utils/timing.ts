export function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

export function waitFor(check: () => boolean, ms: number) {
  let totalTime = 0;
  return new Promise<void>((resolve, reject) => {
    if (check()) {
      return resolve();
    }
    const interval = setInterval(() => {
      if (check()) {
        clearInterval(interval);
        resolve();
      } else {
        totalTime += ms;
        if (totalTime > 3 * 60 * 1000) {
          clearInterval(interval);
          // reject();
        }
      }
    }, ms);
  });
};
