import { Observable } from "rxjs";
import type { Readable } from "svelte/store";

export function fromReadable<T>(store: Readable<T>): Observable<T> {
  return new Observable((subscriber) =>
    store.subscribe((value) => {
      subscriber.next(value);
    }),
  );
}
