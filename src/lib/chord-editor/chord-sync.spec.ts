import type { KeyInfo } from "$lib/serial/keymap-codes";
import type { CharaChordFile } from "$lib/share/chara-file";
import { describe, it, expect } from "vitest";
import { parseCharaChords } from "./action-serializer";
import { parser } from "./chords.grammar";
import { syncCharaChords } from "./chord-sync";
import { Text } from "@codemirror/state";

const asciiInfo: KeyInfo[] = Array.from(
  { length: 0x7f - 0x20 },
  (_, i) =>
    ({
      code: i + 0x20,
      id: String.fromCharCode(i + 0x20),
    }) satisfies KeyInfo,
);
const asciiCodes = new Map<number, KeyInfo>(
  asciiInfo.map((info) => [info.code, info]),
);
const asciiIds = new Map<string, KeyInfo>(
  asciiInfo.map((info) => [info.id!, info]),
);

function chords(...strings: string[]): string {
  return strings.join("\n");
}

function backup(doc: string): CharaChordFile["chords"] {
  const tree = parser.parse(doc);
  const result = parseCharaChords(tree, asciiIds, asciiCodes, [], (from, to) =>
    doc.slice(from, to),
  );
  return result.chords
    .filter((chord) => !chord.disabled)
    .map((chord) => [chord.input?.value ?? [], chord.phrase?.value ?? []]);
}

function expectSync(options: {
  org: string[];
  mod: string[];
  cur: string[];
  exp: string[];
}) {
  expect(
    syncCharaChords(
      backup(chords(...options.org)),
      backup(chords(...options.mod)),
      asciiIds,
      asciiCodes,
      chords(...options.cur),
    )
      .apply(Text.of(options.cur))
      .toString()
      .replace(/\n$/, ""),
  ).toEqual(chords(...options.exp));
}

describe("chord sync", function () {
  it("should not do anything when no changes happened", function () {
    expectSync({
      org: ["abc=>def", "def=>ghi", "jkl=>mno"],
      mod: ["abc=>def", "def=>ghi", "jkl=>mno"],
      cur: ["abc=>def", "def=>ghi", "jkl=>mno"],
      exp: ["abc=>def", "def=>ghi", "jkl=>mno"],
    });
  });

  it("should not touch the doc if device chords are unchanged", function () {
    expectSync({
      org: ["abc=>def", "def=>ghi", "jkl=>mno"],
      mod: ["abc=>def", "def=>ghi", "jkl=>mno"],
      cur: ["ab=>def", "def=>gh"],
      exp: ["ab=>def", "def=>gh"],
    });
  });

  it("should apply removals to unchanged chords only", function () {
    expectSync({
      org: ["abc=>def", "def=>ghi", "jkl=>mno", "mno=>pqr"],
      mod: ["abc=>def"],
      cur: ["abc=>def", "def=>ghij", "jkl=>mno", "mno=>pqr"],
      exp: ["abc=>def", "def=>ghij"],
    });
  });

  it("should keep user modifications over device modifications", function () {
    expectSync({
      org: ["abc=>def", "def=>ghi", "jkl=>mno", "mno=>pqr"],
      mod: ["abc=>def", "def=>ghijk", "jkl=>mnop", "mno=>pqr"],
      cur: ["abc=>def", "def=>ghij", "jkl=>mno", "mno=>pqr"],
      exp: ["abc=>def", "def=>ghij", "jkl=>mnop", "mno=>pqr"],
    });
  });

  it("should handle complex changes", function () {
    expectSync({
      org: [
        "unchanged=>unchanged",
        "usermod=>usermod",
        "devmod=>devmod",
        "userremoval=>userremoval",
        "devremoval=>devremoval",
        "devremusermod=>devremusermod",
      ],
      mod: [
        "unchanged=>unchanged",
        "devadd=>devadd",
        "usermod=>usermod",
        "userremoval=>userremoval",
        "devmod=>devmod1",
        "sameadd=>sameadd",
      ],
      cur: [
        "useradd1=>useradd1",
        "unchanged=>unchanged",
        "usermod=>use",
        "devremusermod=>xyz",
        "devmod=>devmod",
        "sameadd=>sameadd",
        "devremoval=>devremoval",
        "useradd=>useradd",
      ],
      exp: [
        "devadd=>devadd",
        "useradd1=>useradd1",
        "unchanged=>unchanged",
        "usermod=>use",
        "devremusermod=>xyz",
        "devmod=>devmod1",
        "sameadd=>sameadd",
        "useradd=>useradd",
      ],
    });
  });
});
