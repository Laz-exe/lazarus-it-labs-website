/*
 * Lazarus Design Document schema
 *
 * Version 2 broadens the project format beyond the original 2D hero editor.
 * The constants and small factory helpers in this file describe the shared
 * document vocabulary only; they do not change the current editor runtime.
 * Existing version 1 fields remain valid and are migrated separately.
 */

export const DOCUMENT_FORMAT = "lazarus-design-document";
export const DOCUMENT_VERSION = 2;

export const DOCUMENT_MODES = Object.freeze({
  TWO_D: "2d",
  THREE_D: "3d",
});

export const SCENE_DIMENSIONS = Object.freeze({
  TWO_D: 2,
  THREE_D: 3,
});

export const ELEMENT_KINDS = Object.freeze({
  OBJECT: "object",
  LINE: "line",
  GROUP: "group",
  CAMERA: "camera",
  LIGHT: "light",
});

export const ASSET_KINDS = Object.freeze({
  IMAGE: "image",
  SVG: "svg",
  FONT: "font",
  MODEL: "model",
  MATERIAL: "material",
  AUDIO: "audio",
});

export const DEFAULT_TRANSFORM_2D = Object.freeze({
  x: 0,
  y: 0,
  scaleX: 1,
  scaleY: 1,
  rotation: 0,
  originX: 0.5,
  originY: 0.5,
});

export const DEFAULT_TRANSFORM_3D = Object.freeze({
  position: Object.freeze({
    x: 0,
    y: 0,
    z: 0,
  }),
  rotation: Object.freeze({
    x: 0,
    y: 0,
    z: 0,
  }),
  scale: Object.freeze({
    x: 1,
    y: 1,
    z: 1,
  }),
});

export const DEFAULT_SCENE_SETTINGS = Object.freeze({
  mode: DOCUMENT_MODES.TWO_D,
  dimensions: SCENE_DIMENSIONS.TWO_D,
  activeCameraId: null,
  environmentAssetId: null,
  unit: "pixel",
});

export function createDocumentMetadata({
  name = "Untitled Lazarus Project",
  now = new Date().toISOString(),
} = {}) {
  return {
    name,
    createdAt: now,
    updatedAt: now,
  };
}

export function createSceneSettings(overrides = {}) {
  const mode =
    overrides.mode ??
    DEFAULT_SCENE_SETTINGS.mode;

  return {
    ...DEFAULT_SCENE_SETTINGS,
    dimensions:
      overrides.dimensions ??
      (mode === DOCUMENT_MODES.THREE_D
        ? SCENE_DIMENSIONS.THREE_D
        : SCENE_DIMENSIONS.TWO_D),
    ...overrides,
    mode,
  };
}

export function createTransform2D(overrides = {}) {
  return {
    ...DEFAULT_TRANSFORM_2D,
    ...overrides,
  };
}

export function createTransform3D(overrides = {}) {
  return {
    position: {
      ...DEFAULT_TRANSFORM_3D.position,
      ...overrides.position,
    },
    rotation: {
      ...DEFAULT_TRANSFORM_3D.rotation,
      ...overrides.rotation,
    },
    scale: {
      ...DEFAULT_TRANSFORM_3D.scale,
      ...overrides.scale,
    },
  };
}

export function createBaseElement({
  id,
  kind = ELEMENT_KINDS.OBJECT,
  type = "object",
  name = "Untitled Element",
  parentId = null,
  visible = true,
  locked = false,
  opacity = 1,
  behavior = "none",
  transform2D,
  transform3D,
} = {}) {
  if (!id) {
    throw new Error(
      "A Lazarus scene element requires an id.",
    );
  }

  return {
    id,
    kind,
    type,
    name,
    parentId,
    visible,
    locked,
    opacity,
    behavior,
    transform2D:
      createTransform2D(
        transform2D,
      ),
    transform3D:
      createTransform3D(
        transform3D,
      ),
  };
}

export function createDocumentShell({
  name,
  scene,
} = {}) {
  return {
    format: DOCUMENT_FORMAT,
    version: DOCUMENT_VERSION,
    metadata:
      createDocumentMetadata({
        name,
      }),
    scene:
      createSceneSettings(scene),
    assets: {},
    objects: {},
    lines: {},
    layerOrder: [],
    editor: {},
  };
}
