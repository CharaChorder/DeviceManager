export interface Chord {
  input: number[];
  output: number[];
}

export type TypedEventListener<
  T extends Record<string, Event>,
  K extends keyof T,
> = (event: T[K]) => void | Promise<void>;

export interface TypedEventListenerObject<
  T extends Record<string, Event>,
  K extends keyof T,
> {
  handleEvent: TypedEventListener<T, K>;
}

export interface TypedEventTargetInterface<T extends Record<string, Event>> {
  addEventListener<K extends keyof T>(
    type: K,
    listener: TypedEventListener<T, K> | TypedEventListenerObject<T, K> | null,
    options?: boolean | AddEventListenerOptions,
  );

  removeEventListener<K extends keyof T>(
    type: K,
    callback: TypedEventListener<T, K> | TypedEventListenerObject<T, K> | null,
  );

  dispatchEvent(event: T[keyof T]);
}

export type TypedEventTarget<T extends Record<string, CustomEvent<unknown>>> = {
  new (): TypedEventTargetInterface<T>;
  prototype: TypedEventTargetInterface<T>;
};
