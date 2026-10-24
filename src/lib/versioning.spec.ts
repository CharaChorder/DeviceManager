import { describe, expect, it } from "vitest";
import { previousMajorVersion, isUpgradeAllowed } from "./versioning";

describe("isUpgradeAllowed", () => {
  it("allows upgrades up to one major version", () => {
    expect(isUpgradeAllowed("1.1.4", "2.0.0")).toBe(true);
    expect(isUpgradeAllowed("2.8.0", "3.0.0")).toBe(true);
    expect(isUpgradeAllowed("2.8.0", "2.9.1")).toBe(true);
  });

  it("rejects upgrades more than one major version ahead", () => {
    expect(isUpgradeAllowed("1.1.4", "3.0.0")).toBe(false);
    expect(isUpgradeAllowed("0.9.0", "2.0.0")).toBe(false);
  });

  it("handles prerelease targets", () => {
    expect(isUpgradeAllowed("1.1.4", "3.0.0-beta.1")).toBe(false);
    expect(isUpgradeAllowed("2.8.0", "3.0.0-beta.1")).toBe(true);
  });

  it("treats unparseable versions as not allowed", () => {
    expect(isUpgradeAllowed("garbage", "3.0.0")).toBe(false);
    expect(isUpgradeAllowed("2.8.0", "garbage")).toBe(false);
  });
});

describe("previousMajorVersion", () => {
  it("picks the newest version one major below the target", () => {
    const versions = ["1.1.4", "2.7.1", "2.8.0", "1.2.0"];
    expect(previousMajorVersion(versions, "3.0.0")).toBe("2.8.0");
    expect(previousMajorVersion(versions, "2.0.0")).toBe("1.2.0");
  });

  it("prefers stable releases over prereleases", () => {
    const versions = ["2.8.0", "2.9.0-beta.4", "3.0.0"];
    expect(previousMajorVersion(versions, "3.0.0")).toBe("2.8.0");
    expect(previousMajorVersion(["2.9.0-beta.4"], "3.0.0")).toBe(
      "2.9.0-beta.4",
    );
  });

  it("returns undefined when there is nothing below", () => {
    expect(previousMajorVersion(["3.0.0"], "3.1.0")).toBeUndefined();
    expect(previousMajorVersion([], "3.0.0")).toBeUndefined();
    expect(previousMajorVersion(["garbage"], "3.0.0")).toBeUndefined();
  });
});
