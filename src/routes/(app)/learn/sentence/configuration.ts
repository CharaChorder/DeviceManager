export interface PageParam<T> {
  key: string;
  default: T;
  parse?: (value: string) => T;
}

export const SENTENCE_TRAINER_PAGE_PARAMS: {
  sentence: PageParam<string>;
  wpm: PageParam<number>;
  showDevTools: PageParam<boolean>;
  textAreaDebounceInMillis: PageParam<number>;
} = {
  sentence: {
    key: "sentence",
    default: "This text has been typed at the speed of thought",
  },
  wpm: {
    key: "wpm",
    default: 250,
    parse: (value) => Number(value),
  },
  showDevTools: {
    key: "dev",
    default: false,
    parse: (value) => value === "true",
  },
  textAreaDebounceInMillis: {
    key: "debounceMillis",
    default: 5000,
    parse: (value) => Number(value),
  },
};
