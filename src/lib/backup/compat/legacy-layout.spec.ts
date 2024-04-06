import { describe, expect, it } from "vitest";
import legacyLayout from "./legacy-layout.sample.csv?raw";
import legacyLayoutConverted from "./legacy-layout-converted.sample.json";
import { csvLayoutToJson, isCsvLayout } from "./legacy-layout";

describe("legacy layout", () => {
  it("should detect a legacy layout", () => {
    expect(isCsvLayout(legacyLayout)).to.be.true;
  });

  it("should not detect chord maps as layouts", () => {
    expect(isCsvLayout("e + h + t,the")).to.be.false;
  });

  it("should convert legacy layouts", () => {
    expect(csvLayoutToJson(legacyLayout)).to.deep.equal(legacyLayoutConverted);
  });
});
