/**
 * Encodes a gzipped binary blob to a base64 string.
 *
 * Note that the string is url-compatible base64,
 * meaning some chars are swapped for compatibility
 *
 * @param blob {Blob}
 * @returns {Promise<string>}
 */
export async function toBase64(blob) {
  return new Promise(async (resolve) => {
    const reader = new FileReader();
    reader.onloadend = function () {
      resolve(
        `${
          /** @type {string} */ (reader.result)
            .replace(/^data:application\/octet-stream;base64,/, "")
            .replaceAll("+", ".")
            .replaceAll("/", "_")
            .replaceAll("=", "-")
        }`,
      );
    };
    reader.readAsDataURL(blob);
  });
}

/**
 * @param base64 {string}
 * @param [fetch] {typeof window.fetch}
 * @returns {Promise<Blob>}
 */
export async function fromBase64(base64, fetch = window.fetch) {
  return fetch(
    `data:application/octet-stream;base64,${base64
      .replaceAll(".", "+")
      .replaceAll("_", "/")
      .replaceAll("-", "=")}`,
  ).then((it) => it.blob());
}
