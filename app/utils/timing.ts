export function delay(ms: number) {
  return new Promise(r => setTimeout(r, ms))
}

const GIVE_UP_AFTER = 3 * 60 * 1000

export function waitFor(check: () => boolean, ms: number) {
  let totalTime = 0;
  return new Promise<void>((resolve) => {
    if (check()) {
      return resolve();
    }
    const interval = setInterval(() => {
      if (check()) {
        clearInterval(interval);
        resolve();
      } else {
        totalTime += ms;
        if (totalTime > GIVE_UP_AFTER) {
          clearInterval(interval);
        }
      }
    }, ms);
  });
};
