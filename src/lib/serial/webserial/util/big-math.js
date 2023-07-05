/**
 * JavaScript handles up to 53-bit bs it uses float64 to operate with integers
 */
function bitwiseAndLarge(val1, val2) {
  let shift = 0,
    result = 0
  const mask = ~(~0 << 30) // Gives us a bit mask like 01111..1 (30 ones)
  const divisor = 1 << 30 // To work with the bit mask, we need to clear bits at a time
  while (val1 !== 0 && val2 !== 0) {
    let rs = mask & val1 & (mask & val2)
    val1 = Math.floor(val1 / divisor) // val1 >>> 30
    val2 = Math.floor(val2 / divisor) // val2 >>> 30
    for (let i = shift++; i--; ) {
      rs *= divisor // rs << 30
    }
    result += rs
  }
  return result
}
