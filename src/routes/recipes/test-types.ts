export interface E2eAddChord {
  input: string[][];
  output: string[];
}

export interface E2eTestItem {
  keys?: string[];
  modifiers?: Record<string, boolean>;
  press?: string[];
  release?: string[];
  step?: number;
  idle?: boolean;
  clearChords?: boolean;
  addChords?: E2eAddChord[];
  settings: Record<string, Record<string, string | number>>;
}

export interface E2eTest {
  test: E2eTestItem[];
}
