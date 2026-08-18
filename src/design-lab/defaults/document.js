import {
  DOCUMENT_FORMAT,
  DOCUMENT_MODES,
  DOCUMENT_VERSION,
  ELEMENT_KINDS,
  createDocumentMetadata,
  createSceneSettings,
  createTransform2D,
  createTransform3D,
} from "../engine/schema";

export { DOCUMENT_VERSION };

export const viewportPresets = {
  desktop: {
    label: "Desktop",
    width: 1440,
    height: 900,
  },

  laptop: {
    label: "Laptop",
    width: 1280,
    height: 800,
  },

  tablet: {
    label: "Tablet",
    width: 768,
    height: 1024,
  },

  mobile: {
    label: "Mobile",
    width: 390,
    height: 844,
  },

  square: {
    label: "Square",
    width: 1000,
    height: 1000,
  },
};

export const behaviorOptions = [
  "none",
  "breathe",
  "float",
  "pulse",
  "spin",
  "fade",
];

export const backgroundAnimationOptions = [
  "none",
  "slow-zoom",
  "pan-horizontal",
  "pan-vertical",
  "drift",
  "pulse",
  "hue-shift",
];

export const defaultObjects = {
  core: {
    id: "core",
    type: "core",
    name: "Lazarus Core",

    x: 50,
    y: 50,

    scale: 1,
    rotation: 0,

    visible: true,
    locked: false,

    opacity: 1,
    behavior: "breathe",

    pairId: null,
    parentId: null,

    attachedImage: null,
  },

  performance: {
    id: "performance",
    type: "node",
    name: "Performance",

    icon: "gauge",

    heading: "Performance",
    body: "Faster. Longer. Better.",

    x: 7,
    y: 51,

    scale: 1,
    rotation: 0,

    visible: true,
    locked: false,

    opacity: 1,
    behavior: "none",

    pairId: null,
    parentId: null,

    attachedImage: null,
  },

  security: {
    id: "security",
    type: "node",
    name: "Security",

    icon: "shield",

    heading: "Security",
    body: "Protected by design.",

    x: 50,
    y: 8,

    scale: 1,
    rotation: 0,

    visible: true,
    locked: false,

    opacity: 1,
    behavior: "none",

    pairId: null,
    parentId: null,

    attachedImage: null,
  },

  connectivity: {
    id: "connectivity",
    type: "node",
    name: "Connectivity",

    icon: "network",

    heading: "Connectivity",
    body: "Everything working together.",

    x: 93,
    y: 51,

    scale: 1,
    rotation: 0,

    visible: true,
    locked: false,

    opacity: 1,
    behavior: "none",

    pairId: null,
    parentId: null,

    attachedImage: null,
  },
};

export const defaultLines = {
  "line-performance": {
    id: "line-performance",
    type: "line",
    name: "Performance Line",

    x1: 25.8,
    y1: 50.4,

    x2: 9.8,
    y2: 50.9,

    width: 3,
    opacity: 1,

    visible: true,
    locked: false,

    behavior: "none",

    startColor: "#8B5CF6",
    endColor: "#D4AF37",

    glow: true,

    pairId: null,
    parentId: null,
  },

  "line-security": {
    id: "line-security",
    type: "line",
    name: "Security Line",

    x1: 50,
    y1: 28,

    x2: 50,
    y2: 12,

    width: 3,
    opacity: 1,

    visible: true,
    locked: false,

    behavior: "none",

    startColor: "#8B5CF6",
    endColor: "#D4AF37",

    glow: true,

    pairId: null,
    parentId: null,
  },

  "line-connectivity": {
    id: "line-connectivity",
    type: "line",
    name: "Connectivity Line",

    x1: 74.2,
    y1: 50.4,

    x2: 90.2,
    y2: 50.9,

    width: 3,
    opacity: 1,

    visible: true,
    locked: false,

    behavior: "none",

    startColor: "#8B5CF6",
    endColor: "#D4AF37",

    glow: true,

    pairId: null,
    parentId: null,
  },
};

export const defaultLayerOrder = [
  "connectivity",
  "security",
  "performance",
  "line-connectivity",
  "line-security",
  "line-performance",
  "core",
];

export const defaultSidebarOrder = [
  "layers",
  "inspector",
  "background",
  "snap",
  "geometry",
  "guides",
];

export const defaultPanelState = {
  layers: true,
  inspector: true,
  background: false,
  snap: false,
  geometry: false,
  guides: false,
};

export const defaultGeometry = {
  ringRadius: 21.5,
  nodeRadiusPx: 32,
};

export const defaultSnapSettings = {
  enabled: true,

  threshold: 1.4,
  releaseThreshold: 2.4,

  gridSize: 5,

  snapToGrid: true,
  snapToCenter: true,
  snapToThirds: true,
  snapToObjects: true,
};

export const defaultCanvas = {
  width: 1440,
  height: 900,

  preset: "desktop",
  orientation: "landscape",

  clipContent: true,

  background: {
    type: "gradient",

    solidColor: "#05070D",

    gradientStart: "#05070D",
    gradientEnd: "#261044",
    gradientAngle: 135,

    imageSrc: null,
    imageName: "",

    imageFit: "cover",

    imagePositionX: 50,
    imagePositionY: 50,

    imageScale: 1,
    imageRotation: 0,
    imageOpacity: 1,

    repeat: "no-repeat",

    blur: 0,
    brightness: 100,
    contrast: 100,
    saturation: 100,
    grayscale: 0,
    sepia: 0,
    hue: 0,

    overlayEnabled: false,
    overlayColor: "#000000",
    overlayOpacity: 0.25,

    gradientOverlayEnabled: false,

    gradientOverlayStart: "#000000",
    gradientOverlayEnd: "#8B5CF6",
    gradientOverlayAngle: 135,
    gradientOverlayOpacity: 0.25,

    animation: "none",
    animationDuration: 12,
    animationDirection: "normal",
    animationIntensity: 1,
  },
};

function createVersion2Objects() {
  return Object.fromEntries(
    Object.entries(defaultObjects).map(([id, object]) => [
      id,
      {
        ...structuredClone(object),
        kind: ELEMENT_KINDS.OBJECT,
        transform2D: createTransform2D({
          x: object.x,
          y: object.y,
          scaleX: object.scale,
          scaleY: object.scale,
          rotation: object.rotation,
        }),
        transform3D: createTransform3D(),
      },
    ]),
  );
}

function createVersion2Lines() {
  return Object.fromEntries(
    Object.entries(defaultLines).map(([id, line]) => [
      id,
      {
        ...structuredClone(line),
        kind: ELEMENT_KINDS.LINE,
        transform2D: createTransform2D({
          x: (line.x1 + line.x2) / 2,
          y: (line.y1 + line.y2) / 2,
        }),
        transform3D: createTransform3D(),
      },
    ]),
  );
}

export function createDefaultDocument() {
  const metadata = createDocumentMetadata();

  return {
    format: DOCUMENT_FORMAT,
    version: DOCUMENT_VERSION,

    metadata,

    scene: createSceneSettings({
      mode: DOCUMENT_MODES.TWO_D,
    }),

    assets: {},

    canvas: structuredClone(defaultCanvas),

    objects: createVersion2Objects(),

    lines: createVersion2Lines(),

    layerOrder: [...defaultLayerOrder],

    geometry: structuredClone(defaultGeometry),

    editor: {
      sidebarOrder: [...defaultSidebarOrder],

      panelState: {
        ...defaultPanelState,
      },

      snapSettings: structuredClone(defaultSnapSettings),

      guides: {
        grid: true,
        thirds: false,
        crosshair: true,
        safeArea: true,
        ringGuide: true,
      },
    },
  };
}
