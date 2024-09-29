import type { Direction, MatrixClient, Room } from "matrix-js-sdk";
import {
  filter,
  map,
  type Observable,
  of,
  distinctUntilChanged,
  merge,
} from "rxjs";
import { fromMatrixClientEvent } from "./events";

function roomListDistinct(prev: Room[], curr: Room[]) {
  if (prev.length !== curr.length) return false;
  for (let i = 0; i < prev.length; i++) {
    if (prev[i]!.roomId !== curr[i]!.roomId) return false;
  }
  return true;
}

export class MatrixRx {
  topLevelRooms$: Observable<Room[]>;

  topLevelSpaces$: Observable<Room[]>;

  topLevelChats$: Observable<Room[]>;

  constructor(private client: MatrixClient) {
    this.topLevelRooms$ = merge(
      of([]),
      fromMatrixClientEvent(client, "Room"),
      fromMatrixClientEvent(client, "deleteRoom"),
      fromMatrixClientEvent(client, "Room.myMembership"),
      fromMatrixClientEvent(client, "Room.CurrentStateUpdated").pipe(
        filter(
          ([_room, prev, curr]) =>
            prev.getStateEvents("m.space.parent").length !==
            curr.getStateEvents("m.space.parent").length,
        ),
      ),
    ).pipe(
      map(() =>
        this.client.getVisibleRooms().filter(
          (room) =>
            room.getMyMembership() !== "leave" &&
            room
              .getLiveTimeline()
              .getState("f" as Direction.Forward)
              ?.getStateEvents("m.space.parent").length === 0,
        ),
      ),
      distinctUntilChanged(roomListDistinct),
    );

    this.topLevelSpaces$ = this.topLevelRooms$.pipe(
      map((rooms) => rooms.filter((room) => room.isSpaceRoom())),
      distinctUntilChanged(roomListDistinct),
    );

    this.topLevelChats$ = this.topLevelRooms$.pipe(
      map((rooms) => rooms.filter((room) => !room.isSpaceRoom())),
      distinctUntilChanged(roomListDistinct),
    );
  }
}

export class SpaceRx {
  constructor(
    private client: MatrixClient,
    private space: Room,
  ) {}
}
