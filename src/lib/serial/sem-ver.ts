export class SemVer {
  major: number
  minor: number
  patch: number
  preRelease?: string
  meta?: string

  constructor(versionString: string) {
    const [, major, minor, patch, preRelease, meta] =
      /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+))?$/.exec(
        versionString,
      )!
    this.major = Number.parseInt(major)
    this.minor = Number.parseInt(minor)
    this.patch = Number.parseInt(patch)
    if (preRelease) this.preRelease = preRelease
    if (meta) this.meta = meta
  }

  toString() {
    return (
      `${this.major}.${this.minor}.${this.patch}` +
      (this.preRelease ? `-${this.preRelease}` : "") +
      (this.meta ? `+${this.meta}` : "")
    )
  }
}
