import type { SemVer } from "semver";
import { gt as semverGt, parse as semverParse } from "semver";

/**
 * Firmware updates may advance at most one major version at a time,
 * e.g. 1.x -> 2.x or 2.x -> 3.x. Jumping from pre-2.0 straight to 3.0
 * is rejected. Unparseable versions are treated as too old.
 */
export function isUpgradeAllowed(current: string, target: string): boolean {
  const from = semverParse(current);
  const to = semverParse(target);
  if (!from || !to) return false;
  return to.major - from.major <= 1;
}

/**
 * Finds the newest available version one major version below the target,
 * so devices more than one major behind can step up safely one major at a
 * time before OTA-ing to the target. Stable releases are preferred over
 * prereleases.
 */
export function previousMajorVersion(
  versions: string[],
  target: string,
): string | undefined {
  const to = semverParse(target);
  if (!to) return undefined;
  const candidates: SemVer[] = [];
  for (const version of versions) {
    const parsed = semverParse(version);
    if (parsed && parsed.major === to.major - 1) candidates.push(parsed);
  }
  const stable = candidates.filter((it) => it.prerelease.length === 0);
  const pool = stable.length > 0 ? stable : candidates;
  return pool.reduce<SemVer | undefined>(
    (best, it) => (best === undefined || semverGt(it, best) ? it : best),
    undefined,
  )?.version;
}
