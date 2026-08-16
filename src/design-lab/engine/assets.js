export function createAssetId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return `asset-${crypto.randomUUID()}`;
  }

  return `asset-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export async function createAssetFromFile(file) {
  if (!file) {
    throw new Error(
      "No file was provided.",
    );
  }

  if (
    !file.type?.startsWith(
      "image/",
    )
  ) {
    throw new Error(
      "Only image files are currently supported.",
    );
  }

  const dataUrl =
    await fileToDataUrl(
      file,
    );

  return {
    id: createAssetId(),

    name:
      file.name ||
      "image",

    mimeType:
      file.type ||
      "application/octet-stream",

    size:
      file.size ||
      0,

    dataUrl,

    createdAt:
      new Date().toISOString(),
  };
}

export function addAsset(
  assets,
  asset,
) {
  return {
    ...assets,

    [asset.id]: asset,
  };
}

export function removeAsset(
  assets,
  assetId,
) {
  if (
    !assetId ||
    !assets[assetId]
  ) {
    return assets;
  }

  const next = {
    ...assets,
  };

  delete next[assetId];

  return next;
}

export function getAsset(
  assets,
  assetId,
) {
  if (!assetId) {
    return null;
  }

  return (
    assets?.[assetId] ??
    null
  );
}

export function getAssetUrl(
  assets,
  assetId,
) {
  return (
    getAsset(
      assets,
      assetId,
    )?.dataUrl ??
    null
  );
}

export function getAssetFilename(
  asset,
) {
  if (!asset) {
    return "asset.bin";
  }

  const extension =
    extensionFromMimeType(
      asset.mimeType,
    );

  const baseName =
    slugifyFilename(
      removeExtension(
        asset.name ||
        "asset",
      ),
    );

  return `${baseName}.${extension}`;
}

export function dataUrlToBase64(
  dataUrl,
) {
  if (
    typeof dataUrl !==
    "string"
  ) {
    throw new Error(
      "Invalid asset data.",
    );
  }

  const commaIndex =
    dataUrl.indexOf(",");

  if (
    commaIndex === -1
  ) {
    throw new Error(
      "Invalid asset data URL.",
    );
  }

  return dataUrl.slice(
    commaIndex + 1,
  );
}

export function dataUrlToMimeType(
  dataUrl,
) {
  if (
    typeof dataUrl !==
    "string"
  ) {
    return (
      "application/octet-stream"
    );
  }

  const match =
    dataUrl.match(
      /^data:([^;,]+)[;,]/,
    );

  return (
    match?.[1] ??
    "application/octet-stream"
  );
}

export function normalizeAssetRegistry(
  assets,
) {
  if (
    !assets ||
    typeof assets !==
      "object" ||
    Array.isArray(
      assets,
    )
  ) {
    return {};
  }

  return assets;
}

export function collectUsedAssetIds(
  document,
) {
  const used =
    new Set();

  const objects =
    document.objects ??
    {};

  Object.values(
    objects,
  ).forEach(
    (object) => {
      if (
        object.assetId
      ) {
        used.add(
          object.assetId,
        );
      }

      if (
        object.attachedImage
          ?.assetId
      ) {
        used.add(
          object.attachedImage
            .assetId,
        );
      }
    },
  );

  const backgroundAssetId =
    document.canvas
      ?.background
      ?.assetId;

  if (
    backgroundAssetId
  ) {
    used.add(
      backgroundAssetId,
    );
  }

  return [
    ...used,
  ];
}

export function pruneUnusedAssets(
  document,
) {
  const usedIds =
    collectUsedAssetIds(
      document,
    );

  const assets =
    normalizeAssetRegistry(
      document.assets,
    );

  const nextAssets = {};

  usedIds.forEach(
    (assetId) => {
      if (
        assets[assetId]
      ) {
        nextAssets[assetId] =
          assets[assetId];
      }
    },
  );

  return {
    ...document,

    assets:
      nextAssets,
  };
}

export function resolveDocumentAssetUrl(
  document,
  assetId,
) {
  return getAssetUrl(
    document.assets,
    assetId,
  );
}

function fileToDataUrl(
  file,
) {
  return new Promise(
    (
      resolve,
      reject,
    ) => {
      const reader =
        new FileReader();

      reader.onload =
        () => {
          if (
            typeof reader.result ===
            "string"
          ) {
            resolve(
              reader.result,
            );

            return;
          }

          reject(
            new Error(
              "Unable to read image file.",
            ),
          );
        };

      reader.onerror =
        () => {
          reject(
            reader.error ??
              new Error(
                "Unable to read image file.",
              ),
          );
        };

      reader.readAsDataURL(
        file,
      );
    },
  );
}

function extensionFromMimeType(
  mimeType,
) {
  switch (
    mimeType
  ) {
    case "image/png":
      return "png";

    case "image/jpeg":
      return "jpg";

    case "image/webp":
      return "webp";

    case "image/gif":
      return "gif";

    case "image/svg+xml":
      return "svg";

    case "image/avif":
      return "avif";

    default:
      return "bin";
  }
}

function removeExtension(
  filename,
) {
  return String(
    filename,
  ).replace(
    /\.[^.]+$/,
    "",
  );
}

function slugifyFilename(
  value,
) {
  return (
    String(value)
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9_-]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      ) ||
    "asset"
  );
}