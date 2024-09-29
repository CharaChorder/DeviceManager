import type { EventTimeline, MatrixClient, MatrixEvent } from "matrix-js-sdk";
import { filter, map, of, startWith, type Observable } from "rxjs";
import { fromMatrixClientEvent } from "./events";

export function roomTimeline(
  client: MatrixClient,
  roomId: string | undefined,
): Observable<MatrixEvent[]> {
  if (!roomId) return of([]);
  const room = client.getRoom(roomId);
  if (!room) return of([]);
  const eventTimeline = room.getLiveTimeline();

  return fromMatrixClientEvent(client, "Room.timeline").pipe(
    filter(([, room]) => room?.roomId === roomId),
    startWith([]),
    map(() => eventTimeline.getEvents()),
  );
}
