declare global {
  export interface EventTarget<T extends Record<string, Event>> {
    addEventListener<K extends keyof T>(
      type: K,
      listener: (event: T[K]) => void,
      options?: boolean | AddEventListenerOptions,
    );
    addEventListener(
      type: string,
      callback: EventListenerOrEventListenerObject | null,
      options?: EventListenerOptions | boolean,
    );
  }
}
