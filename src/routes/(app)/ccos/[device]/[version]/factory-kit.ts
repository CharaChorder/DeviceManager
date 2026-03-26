import type { VersionMeta } from "$lib/meta/types/meta";

async function progressFetch(
  url: string,
  onProgress: (progress: number) => void,
) {
  const request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.responseType = "arraybuffer";
  request.onprogress = (event) => {
    if (event.total > 0) {
      onProgress(event.loaded / event.total);
    }
  };
  const result = new Promise<ArrayBuffer>((resolve, reject) => {
    request.onload = () => {
      onProgress(1);
      if (request.status >= 200 && request.status < 300) {
        resolve(request.response);
      } else {
        reject(new Error(`Failed to fetch ${url}: ${request.statusText}`));
      }
    };
  });
  request.send();
  return result;
}
export type VersionMetaWithEsptool = VersionMeta & {
  update: { esptool: Exclude<VersionMeta["update"]["esptool"], undefined> };
};

export async function assembleFactoryKit(
  meta: VersionMetaWithEsptool,
  os: "Windows" | "Linux" | "MacOS",
  onProgress: (progress: number) => void,
): Promise<Blob> {
  let otherProgress: number[] = new Array(
    Object.keys(meta.update.esptool.files).length,
  ).fill(0);
  let esptoolProgress = 0;
  let compressProgress = 0;
  function reportProgress() {
    const total =
      0.1 * (otherProgress.reduce((a, b) => a + b) / otherProgress.length) +
      0.5 * esptoolProgress +
      0.4 * compressProgress;
    onProgress(total);
  }
  const esptool =
    os === "Windows"
      ? progressFetch(`/esptool-v5.2.0-windows-amd64.zip`, (progress) => {
          esptoolProgress = progress;
          reportProgress();
        })
      : undefined;
  const files = Object.values(meta.update.esptool.files).map(
    (file, i) =>
      [
        file,
        progressFetch(`${meta.path}/${file}`, (progress) => {
          otherProgress[i] = progress;
          reportProgress();
        }),
      ] as const,
  );
  console.log(files);
  const JSZip = await import("jszip").then((m) => m.default);
  const zip = new JSZip();
  const esptoolZipPromise = esptool
    ? esptool.then((it) => JSZip.loadAsync(it))
    : undefined;
  for (const [file, dataPromise] of files) {
    zip.file(file, dataPromise);
  }

  const esptoolScript = ".\\esptool\\esptool.exe";
  const port = "%1";
  const ext = os === "Windows" ? "bat" : "sh";
  zip.file(
    `flash.${ext}`,
    [
      esptoolScript,
      "--chip",
      meta.update.esptool.chip,
      "--port",
      port,
      "--baud",
      meta.update.esptool.baud,
      "--before",
      meta.update.esptool.before,
      "--after",
      meta.update.esptool.after,
      "write_flash",
      "-z",
      "--flash_mode",
      meta.update.esptool.flash_mode,
      "--flash_freq",
      meta.update.esptool.flash_freq,
      "--flash_size",
      meta.update.esptool.flash_size,
      ...Object.entries(meta.update.esptool.files).flatMap(
        ([address, file]) => [address, file],
      ),
    ].join(" "),
    { unixPermissions: "755" },
  );
  zip.file(`${meta.device}-${meta.version}`, "");
  if (os === "Windows") {
    zip.file(
      "factory-flash.ps1",
      import("$lib/assets/factory-flash.ps1?raw").then((m) => m.default),
    );
  }
  zip.file(
    "README.txt",
    [
      `Factory Kit for ${meta.device} ${meta.version}`,
      "",
      os !== "Windows"
        ? "Requires esptool, please download from https://github.com/espressif/esptool/releases"
        : "",
      os === "Windows"
        ? 'Right click factory-flash.ps1 and select "Run with PowerShell'
        : `Run flash.sh with \`./flash.sh <port>\``,
    ].join("\n"),
  );
  if (esptoolZipPromise) {
    const esptoolZip = await esptoolZipPromise;
    for (const [path, file] of Object.entries(esptoolZip.files)) {
      if (!file.dir) {
        zip.file(
          path.replace(/^esptool[^\/]*\//, "esptool/"),
          file.async("arraybuffer"),
        );
      }
    }
  }
  return zip.generateAsync({ type: "blob" }, ({ percent }) => {
    compressProgress = percent / 100;
    reportProgress();
  });
}
