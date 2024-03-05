export class SemVer {
  major = 0
  minor = 0
  patch = 0
  preRelease?: string
  meta?: string

  constructor(versionString: string) {
    const result =
      /^([0-9]+)\.([0-9]+)\.([0-9]+)(?:-([0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*))?(?:\+([0-9A-Za-z-]+))?$/.exec(
        versionString,
      )
    if (!result) {
      console.error("Invalid version string:", versionString)
    } else {
      const [, major, minor, patch, preRelease, meta] = result
      this.major = Number.parseInt(major)
      this.minor = Number.parseInt(minor)
      this.patch = Number.parseInt(patch)
      if (preRelease) this.preRelease = preRelease
      if (meta) this.meta = meta
    }
  }

  toString() {
    return (
      `${this.major}.${this.minor}.${this.patch}` +
      (this.preRelease ? `-${this.preRelease}` : "") +
      (this.meta ? `+${this.meta}` : "")
    )
  }
}
