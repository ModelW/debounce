/**
 * Options to send to `debounce`.
 * - `delay`: a number of milliseconds to wait after every call before executing `func`
 * - `promise`: whether to return a promise, or nothing
 */
export interface Options {
  delay?: number;
  promise?: boolean;
}

interface OptionsWithoutPromise extends Options {
  promise?: false;
}

interface OptionsWithPromise extends Options {
  promise: true;
}

type AnyFunction = (this: any, ...args: any[]) => any;

/**
 * A function that gets executed only after a delay has passed.
 */
export interface DebouncedFunction<
  F extends AnyFunction,
  R = void | Promise<ReturnType<F>>
> {
  (this: ThisParameterType<F>, ...args: Parameters<F>): R;
  // Wait time before function execution (in milliseconds)
  delay: number;
  // Cancels the next execution of the function
  cancel(): void;
}

type TimeoutLike = NodeJS.Timeout | number;

export function debounce<F extends AnyFunction>(
  func: F,
  options?: OptionsWithoutPromise
): DebouncedFunction<F, void>;

export function debounce<F extends AnyFunction>(
  func: F,
  options?: OptionsWithPromise
): DebouncedFunction<F, Promise<ReturnType<F>>>;

/**
 * Waits for successive calls to a function to end before executing it.
 * @param func A function that should be executed only once
 * @param options The options bundle
 */
export function debounce<F extends AnyFunction>(func: F, options?: Options) {
  const delay = options?.delay ?? 1000;
  const promise = options?.promise ?? false;

  let lastTimeout: TimeoutLike | null = null;
  let lastReject: ((error: any) => void) | null = null;

  function cancelLastCall() {
    if (lastTimeout !== null) {
      clearTimeout(lastTimeout);
      lastReject?.(new Error("cancelled"));
      lastTimeout = null;
    }
  }

  const debounced = function (
    this: ThisParameterType<F>,
    ...args: Parameters<F>
  ): ReturnType<DebouncedFunction<F>> {
    // Always be careful with the contextual `this`
    const that = this;

    function handleTimeouts(
      resolve: (value: ReturnType<F>) => void,
      reject: (error: any) => void
    ) {
      // Clear any previous timeout before creating a new one
      cancelLastCall();
      lastReject = reject;
      lastTimeout = setTimeout(() => {
        try {
          resolve(func.call(that, args));
        } catch (err: any) {
          reject(err);
        } finally {
          lastTimeout = null;
        }
      }, delay);
    }

    return promise
      ? new Promise((resolve, reject) => handleTimeouts(resolve, reject))
      : handleTimeouts(noop, noop);
  };

  debounced.delay = delay;
  debounced.cancel = cancelLastCall;
  return debounced;
}

function noop(arg?: any) {
  return arg;
}
