import { derived, writable, type Writable } from "svelte/store";
import type {
  ClientEvent,
  LoginResponse,
  MatrixClient,
  RoomMember,
} from "matrix-js-sdk";
import { persistentWritable } from "$lib/storage";
import {
  themeFromSourceColor,
  argbFromHex,
  type CustomColorGroup,
} from "@material/material-color-utilities";
import type { UserTheme } from "$lib/preferences";
import { MatrixRx } from "./matrix-rx/client";

export const matrixClient: Writable<MatrixClient> = writable();

export const isLoggedIn: Writable<boolean> = writable(false);

export const matrix = derived(
  [matrixClient, isLoggedIn],
  ([matrixClient, isLoggedIn]) =>
    isLoggedIn ? new MatrixRx(matrixClient) : undefined,
);

export const currentRoomId = persistentWritable<string | null>(
  "currentRoomId",
  null,
);

function getStoredLogin(): LoginResponse | undefined {
  try {
    return JSON.parse(localStorage.getItem("matrix-login")!);
  } catch {
    return undefined;
  }
}

export function storeLogin(response: LoginResponse) {
  localStorage.setItem("matrix-login", JSON.stringify(response));
}

export async function initMatrixClient() {
  const { createClient, IndexedDBStore, IndexedDBCryptoStore } = await import(
    "matrix-js-sdk"
  );

  const storedLogin = getStoredLogin();

  const store = new IndexedDBStore({
    dbName: "matrix",
    indexedDB: window.indexedDB,
  });
  const cryptoStore = new IndexedDBCryptoStore(
    window.indexedDB,
    "matrix-crypto",
  );

  const client = createClient({
    baseUrl: import.meta.env.VITE_MATRIX_URL,
    userId: storedLogin?.user_id,
    accessToken: storedLogin?.access_token,
    timelineSupport: true,
    store,
    cryptoStore,
  });

  console.log("store");
  await store.startup();
  console.log("cryptoStore");
  await cryptoStore.startup();
  console.log("client");
  await client.startClient();
  client.once("sync" as ClientEvent.Sync, () => {
    isLoggedIn.set(client.isLoggedIn());
  });

  const loginToken = new URLSearchParams(window.location.search).get(
    "loginToken",
  );
  if (loginToken) {
    storeLogin(await client.loginWithToken(loginToken));
    window.history.replaceState({}, document.title, window.location.pathname);
    isLoggedIn.set(client.isLoggedIn());
  }

  matrixClient.set(client);
  console.log("done");
}

export function memberColor(
  member: RoomMember,
  theme: UserTheme,
): CustomColorGroup {
  let hash = 0;
  member.userId.split("").forEach((char) => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash);
  });
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += value.toString(16).padStart(2, "0");
  }

  return themeFromSourceColor(argbFromHex(theme.color), [
    { value: argbFromHex(color), name: "member", blend: true },
  ]).customColors.find((c) => c.color.name === "member")!;
}
