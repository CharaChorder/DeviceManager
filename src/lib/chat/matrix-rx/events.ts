import type { ClientEventHandlerMap, MatrixClient } from "matrix-js-sdk";
import { fromEvent, type Observable } from "rxjs";

export function fromMatrixClientEvent<T extends keyof ClientEventHandlerMap>(
  client: MatrixClient,
  eventName: `${T}`, // hack so we can use strings instead of enums
): Observable<Parameters<ClientEventHandlerMap[T]>> {
  return fromEvent(client, eventName) as Observable<
    Parameters<ClientEventHandlerMap[T]>
  >;
}
