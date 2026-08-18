import {
  createDefaultDocument,
} from "../defaults/document";

import {
  normalizeAssetRegistry,
  pruneUnusedAssets,
} from "./assets";

import {
  DOCUMENT_FORMAT,
  DOCUMENT_MODES,
  DOCUMENT_VERSION,
  ELEMENT_KINDS,
  createDocumentMetadata,
  createSceneSettings,
  createTransform2D,
  createTransform3D,
} from "./schema";

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
    DOCUMENT_FORMAT
  ) {
    throw new Error(
      "This is not a Lazarus Design Lab project.",
    );
  }

  if (
    typeof document.version !==
      "number" ||
    !Number.isInteger(
      document.version,
    ) ||
    document.version < 1
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

  migrated.format =
    DOCUMENT_FORMAT;

  migrated.version =
    DOCUMENT_VERSION;

  migrated.metadata =
    migrateMetadata(
      migrated.metadata,
    );

  migrated.scene =
    createSceneSettings({
      mode:
        DOCUMENT_MODES.TWO_D,
      ...migrated.scene,
    });

  migrated.assets =
    normalizeAssetRegistry(
      migrated.assets,
    );

  migrated.objects =
    migrateElements(
      migrated.objects,
      ELEMENT_KINDS.OBJECT,
    );

  migrated.lines =
    migrateElements(
      migrated.lines,
      ELEMENT_KINDS.LINE,
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
    migrateProjectDocument(
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

function migrateMetadata(metadata) {
  const defaults =
    createDocumentMetadata({
      name:
        metadata?.name,
      now:
        metadata?.createdAt ??
        metadata?.updatedAt,
    });

  return {
    ...defaults,
    ...metadata,
  };
}

function migrateElements(elements, kind) {
  return Object.fromEntries(
    Object.entries(
      elements ?? {},
    ).map(
      ([id, element]) => [
        id,
        migrateElement(
          element,
          kind,
        ),
      ],
    ),
  );
}

function migrateElement(element, kind) {
  const legacyTransform =
    kind === ELEMENT_KINDS.LINE
      ? {
          x:
            averageCoordinates(
              element.x1,
              element.x2,
            ),
          y:
            averageCoordinates(
              element.y1,
              element.y2,
            ),
        }
      : {
          x: element.x ?? 0,
          y: element.y ?? 0,
          scaleX:
            element.scale ?? 1,
          scaleY:
            element.scale ?? 1,
          rotation:
            element.rotation ?? 0,
        };

  return {
    ...element,
    kind:
      element.kind ?? kind,
    transform2D:
      createTransform2D({
        ...legacyTransform,
        ...element.transform2D,
      }),
    transform3D:
      createTransform3D(
        element.transform3D,
      ),
  };
}

function averageCoordinates(first, second) {
  if (
    typeof first !== "number" ||
    typeof second !== "number"
  ) {
    return 0;
  }

  return (first + second) / 2;
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
