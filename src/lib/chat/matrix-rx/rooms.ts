import type {
  MatrixClient,
  MatrixEvent,
  Room,
  Direction,
  RoomState,
  RoomStateEventHandlerMap,
  EventType,
} from "matrix-js-sdk";
import { fromMatrixClientEvent } from "./events";
import {
  map,
  filter,
  merge,
  startWith,
  Observable,
  of,
  fromEvent,
  concat,
  defer,
} from "rxjs";

export function matrixRoom$(
  client: MatrixClient,
  roomId: string | undefined,
): Observable<Room | undefined> {
  return merge([
    fromMatrixClientEvent(client, "Room").pipe(
      filter(([room]) => room.roomId === roomId),
    ),
    fromMatrixClientEvent(client, "deleteRoom").pipe(
      filter(([id]) => id === roomId),
    ),
  ]).pipe(
    startWith([]),
    map(() => client.getRoom(roomId) ?? undefined),
  );
}

export function roomTimeline$(
  client: MatrixClient,
  room: Room | undefined,
): Observable<MatrixEvent[] | undefined> {
  if (!room) return of(undefined);
  const eventTimeline = room.getLiveTimeline();

  return fromMatrixClientEvent(client, "Room.timeline").pipe(
    filter(
      ([, eventRoom]) =>
        eventRoom !== undefined && eventRoom.roomId === room.roomId,
    ),
    startWith([]),
    map(() => eventTimeline.getEvents()),
  );
}

export function roomCurrentStateEvents$(
  client: MatrixClient,
  room: Room,
  eventType: EventType | string,
): Observable<MatrixEvent[]> {
  return concat(
    defer(() =>
      of(
        room
          .getLiveTimeline()
          .getState("f" as Direction.Forward)
          ?.getStateEvents(eventType) ?? [],
      ),
    ),
    fromMatrixClientEvent(client, "Room.CurrentStateUpdated").pipe(
      filter(([room]) => room.roomId === room.roomId),
      map(([_room, _prev, curr]) => curr.getStateEvents(eventType)),
    ),
  );
}

export function fromRoomStateEvent<T extends keyof RoomStateEventHandlerMap>(
  state: RoomState,
  eventName: `${T}`,
): Observable<Parameters<RoomStateEventHandlerMap[T]>> {
  return fromEvent(state, eventName) as Observable<
    Parameters<RoomStateEventHandlerMap[T]>
  >;
}
