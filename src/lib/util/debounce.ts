/**
 * Creates a debounced function that delays invoking the provided function
 * until after 'wait' milliseconds have elapsed since the last time it was
 * invoked.
 *
 * I could use _.debounce(), but bringing dependency on lodash didn't feel
 * justified yet.
 *
 * @param func The function to debounce
 * @param wait The number of milliseconds to delay execution
 * @returns A debounced version of the provided function
 */
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): T & { cancel: () => void } {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  const debounced = function (
    this: ThisParameterType<T>,
    ...args: Parameters<T>
  ): void {
    const context = this;

    const later = function () {
      timeout = null;
      func.apply(context, args);
    };

    if (timeout) {
      clearTimeout(timeout);
    }

    timeout = setTimeout(later, wait);
  };

  debounced.cancel = function () {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced as T & { cancel: () => void };
}

export default debounce;
