import {
  DOCUMENT_VERSION,
  createDefaultDocument,
} from "../defaults/document";

import {
  normalizeAssetRegistry,
  pruneUnusedAssets,
} from "./assets";

export function cloneDocument(document) {
  return structuredClone(document);
}

export function touchDocument(document) {
  return {
    ...document,

    metadata: {
      ...document.metadata,

      updatedAt: new Date().toISOString(),
    },
  };
}

export function serializeProjectDocument(document) {
  const prepared =
    prepareDocumentForSave(
      document,
    );

  return JSON.stringify(
    prepared,
    null,
    2,
  );
}

export function parseProjectDocument(text) {
  let parsed;

  try {
    parsed =
      JSON.parse(text);
  } catch {
    throw new Error(
      "This file is not a valid Lazarus project.",
    );
  }

  validateProjectDocument(
    parsed,
  );

  return migrateProjectDocument(
    parsed,
  );
}

export function validateProjectDocument(document) {
  if (
    !document ||
    typeof document !== "object"
  ) {
    throw new Error(
      "Project file does not contain a document.",
    );
  }

  if (
    document.format !==
    "lazarus-design-document"
  ) {
    throw new Error(
      "This is not a Lazarus Design Lab project.",
    );
  }

  if (
    typeof document.version !==
    "number"
  ) {
    throw new Error(
      "Project file does not contain a valid version.",
    );
  }

  if (
    document.version >
    DOCUMENT_VERSION
  ) {
    throw new Error(
      `This project was created by a newer Lazarus Design Lab version. Project version: ${document.version}. Supported version: ${DOCUMENT_VERSION}.`,
    );
  }

  if (
    !document.canvas ||
    !document.objects ||
    !document.lines ||
    !Array.isArray(
      document.layerOrder,
    )
  ) {
    throw new Error(
      "Project file is missing required scene data.",
    );
  }

  return true;
}

export function migrateProjectDocument(document) {
  const migrated =
    structuredClone(
      document,
    );

  /*
   * Version 1 projects created before the asset
   * registry existed will not contain "assets".
   *
   * Add it automatically so older .laz files
   * still open correctly.
   */

  migrated.assets =
    normalizeAssetRegistry(
      migrated.assets,
    );

  if (
    !migrated.editor
  ) {
    migrated.editor = {};
  }

  return migrated;
}

export function createNewProject() {
  const document =
    createDefaultDocument();

  return {
    ...document,

    assets: {},
  };
}

export function getProjectFilename(document) {
  const name =
    document?.metadata?.name ||
    "untitled-project";

  return `${slugify(name)}.laz`;
}

export function downloadProjectFile(document) {
  const contents =
    serializeProjectDocument(
      document,
    );

  downloadTextFile({
    filename:
      getProjectFilename(
        document,
      ),

    contents,

    mimeType:
      "application/json;charset=utf-8",
  });
}

export async function readProjectFile(file) {
  if (!file) {
    throw new Error(
      "No .laz project file was selected.",
    );
  }

  const filename =
    file.name?.toLowerCase() ||
    "";

  const supportedExtension =
    filename.endsWith(".laz") ||
    filename.endsWith(".json");

  if (
    !supportedExtension
  ) {
    throw new Error(
      "Unsupported project file. Open a .laz Lazarus project.",
    );
  }

  const text =
    await file.text();

  return parseProjectDocument(
    text,
  );
}

export function downloadTextFile({
  filename,
  contents,
  mimeType = "text/plain;charset=utf-8",
}) {
  const blob =
    new Blob(
      [contents],
      {
        type:
          mimeType,
      },
    );

  downloadBlob({
    filename,
    blob,
  });
}

export function downloadBlob({
  filename,
  blob,
}) {
  const url =
    URL.createObjectURL(
      blob,
    );

  const anchor =
    window.document.createElement(
      "a",
    );

  anchor.href =
    url;

  anchor.download =
    filename;

  window.document.body.appendChild(
    anchor,
  );

  anchor.click();

  anchor.remove();

  setTimeout(() => {
    URL.revokeObjectURL(
      url,
    );
  }, 1000);
}

function prepareDocumentForSave(document) {
  const copy =
    structuredClone(
      document,
    );

  copy.assets =
    normalizeAssetRegistry(
      copy.assets,
    );

  /*
   * From this point forward, assets referenced through
   * assetId live inside the .laz file itself.
   *
   * Legacy blob URLs are still sanitized so they don't
   * create broken project files.
   */

  Object.values(
    copy.objects ?? {},
  ).forEach(
    (object) => {
      if (
        object.src?.startsWith(
          "blob:",
        )
      ) {
        object.src =
          null;
      }

      if (
        object.attachedImage?.src?.startsWith(
          "blob:",
        )
      ) {
        object.attachedImage.src =
          null;
      }
    },
  );

  if (
    copy.canvas
      ?.background
      ?.imageSrc
      ?.startsWith(
        "blob:",
      )
  ) {
    copy.canvas.background.imageSrc =
      null;
  }

  /*
   * Remove assets no longer used by any object or
   * background before saving.
   */

  const pruned =
    pruneUnusedAssets(
      copy,
    );

  return {
    ...pruned,

    metadata: {
      ...pruned.metadata,

      updatedAt:
        new Date().toISOString(),
    },
  };
}

function slugify(value) {
  return (
    String(value)
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      ) ||
    "untitled-project"
  );
}