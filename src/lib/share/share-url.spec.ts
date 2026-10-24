import { describe, expect, it } from "vitest";
import {
  charaFileFromUriComponent,
  charaFileToUriComponent,
} from "./share-url";
import type {
  CharaChordFile,
  CharaLayoutFile,
  CharaSettingsFile,
} from "./chara-file";

const layout = [[32, 33, 34, 255, 256, 1023], [64, 65, 66], []] as [
  number[],
  number[],
  number[],
];

describe("share url components", () => {
  it("should round-trip a layout file", async () => {
    const file: CharaLayoutFile = {
      charaVersion: 1,
      type: "layout",
      device: "ONE",
      layout,
    };
    const component = await charaFileToUriComponent(file);
    expect(component.split("\n")[0]).toBe("layout");
    expect(await charaFileFromUriComponent<CharaLayoutFile>(component)).toEqual(
      file,
    );
  });

  it("should round-trip a chords file", async () => {
    const file: CharaChordFile = {
      charaVersion: 1,
      type: "chords",
      chords: [
        [
          [32, 51],
          [0x20, 0x68],
        ],
        [[33], [0x65]],
      ],
    };
    expect(
      await charaFileFromUriComponent<CharaChordFile>(
        await charaFileToUriComponent(file),
      ),
    ).toEqual(file);
  });

  it("should round-trip a settings file", async () => {
    const file: CharaSettingsFile = {
      charaVersion: 1,
      type: "settings",
      settings: [64, 65, 66, 256, 8000],
    };
    expect(
      await charaFileFromUriComponent<CharaSettingsFile>(
        await charaFileToUriComponent(file),
      ),
    ).toEqual(file);
  });

  it("should produce url-embeddable components", async () => {
    const component = await charaFileToUriComponent<CharaLayoutFile>({
      charaVersion: 1,
      type: "layout",
      device: "LITE",
      layout,
    });
    const url = new URL("https://example.com/");
    url.searchParams.set("layout", component);
    expect(
      await charaFileFromUriComponent<CharaLayoutFile>(
        url.searchParams.get("layout")!,
      ),
    ).toEqual({
      charaVersion: 1,
      type: "layout",
      device: "LITE",
      layout,
    });
  });
});
