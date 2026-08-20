"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Eye,
  EyeOff,
  Gauge,
  GripVertical,
  ImagePlus,
  Layers3,
  Link2,
  Lock,
  Magnet,
  Minus,
  Monitor,
  MousePointer2,
  Network,
  Palette,
  Pencil,
  Play,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  Tablet,
  Trash2,
  Unlink,
  Unlock,
  Maximize2,
  X,
} from "lucide-react";

import ProjectToolbar from "@/design-lab/components/ProjectToolbar";
import SceneModeSwitch from "@/design-lab/components/SceneModeSwitch";
import ThreeWorkspace from "@/design-lab/components/ThreeWorkspace";

import {
  createDefaultDocument,
  createDefaultThreeDScene,
} from "@/design-lab/defaults/document";

import {
  downloadProjectFile,
  readProjectFile,
} from "@/design-lab/engine/document";

import {
  exportStaticProjectZip,
  exportStaticWebsite,
} from "@/design-lab/engine/export";

import {
  createAssetFromFile,
  normalizeAssetRegistry,
} from "@/design-lab/engine/assets";

import {
  createSceneSettings,
  DOCUMENT_FORMAT,
  DOCUMENT_MODES,
  DOCUMENT_VERSION,
} from "@/design-lab/engine/schema";

/* =========================================================
   DEFINITIONS
   ========================================================= */

const heroNodes = [
  {
    id: "performance",
    title: "Performance",
    description: "Faster. Longer. Better.",
    Icon: Gauge,
  },
  {
    id: "security",
    title: "Security",
    description: "Protected by design.",
    Icon: ShieldCheck,
  },
  {
    id: "connectivity",
    title: "Connectivity",
    description: "Everything working together.",
    Icon: Network,
  },
];

const behaviorOptions = [
  "none",
  "breathe",
  "float",
  "pulse",
  "spin",
  "fade",
];

const backgroundAnimationOptions = [
  "none",
  "slow-zoom",
  "pan-horizontal",
  "pan-vertical",
  "drift",
  "pulse",
  "hue-shift",
];

const viewportPresets = {
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

const defaultObjects = {
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

const defaultLines = {
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

const defaultLayerOrder = [
  "connectivity",
  "security",
  "performance",
  "line-connectivity",
  "line-security",
  "line-performance",
  "core",
];

const defaultSidebarOrder = [
  "layers",
  "inspector",
  "background",
  "snap",
  "geometry",
  "guides",
];

const defaultPanelState = {
  layers: true,
  inspector: true,
  background: false,
  snap: false,
  geometry: false,
  guides: false,
};

const defaultGeometry = {
  ringRadius: 21.5,
  nodeRadiusPx: 32,
};

const defaultSnapSettings = {
  enabled: true,
  threshold: 1.4,
  releaseThreshold: 2.4,
  gridSize: 5,
  snapToGrid: true,
  snapToCenter: true,
  snapToThirds: true,
  snapToObjects: true,
};

const defaultCanvas = {
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

/* =========================================================
   MAIN
   ========================================================= */

export default function DesignLab() {
  const projectCreatedAtRef = useRef(
    new Date().toISOString(),
  );

  const [projectName, setProjectName] =
    useState("Untitled Lazarus Project");

  const stageRef = useRef(null);

  const fileInputRef = useRef(null);
  const backgroundInputRef = useRef(null);
  const attachmentInputRef = useRef(null);

  const animationFrameRef = useRef(null);
  const pendingPointerRef = useRef(null);
  const interactionRef = useRef(null);

  const snapLockRef = useRef({
    x: null,
    y: null,
  });

  const [objects, setObjects] = useState(defaultObjects);
  const [lines, setLines] = useState(defaultLines);
  const [assets, setAssets] = useState({});

  const [layerOrder, setLayerOrder] = useState(defaultLayerOrder);
  const [sidebarOrder, setSidebarOrder] = useState(defaultSidebarOrder);
  const [panelState, setPanelState] = useState(defaultPanelState);

  const [geometry, setGeometry] = useState(defaultGeometry);
  const [snapSettings, setSnapSettings] = useState(defaultSnapSettings);
  const [canvas, setCanvas] = useState(defaultCanvas);

  const [sceneMode, setSceneMode] = useState(
    DOCUMENT_MODES.TWO_D,
  );

  const [scene3D, setScene3D] = useState(
    createDefaultThreeDScene,
  );

  const [selectedId, setSelectedId] = useState("core");
  const [activeTool, setActiveTool] = useState("select");

  const [stageSize, setStageSize] = useState({
    width: 0,
    height: 0,
  });

  const [snapGuide, setSnapGuide] = useState({
    x: null,
    y: null,
  });

  const [linePreview, setLinePreview] = useState(null);

  const [showSidebar, setShowSidebar] = useState(true);

  const [showGrid, setShowGrid] = useState(true);
  const [showThirds, setShowThirds] = useState(false);
  const [showCrosshair, setShowCrosshair] = useState(true);
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [showRingGuide, setShowRingGuide] = useState(true);

  const [draggedLayerId, setDraggedLayerId] = useState(null);
  const [draggedSidebarId, setDraggedSidebarId] = useState(null);

  const [editorMode, setEditorMode] = useState("edit");

  useEffect(() => {
    if (!stageRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      setStageSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });

    observer.observe(stageRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  const selectedObject =
    objects[selectedId] ?? null;

  const selectedLine =
    lines[selectedId] ?? null;

  const calculatedLines = useMemo(() => {
    return buildRenderableLines(lines);
  }, [lines]);

  const sceneItems = useMemo(() => {
    return layerOrder
      .map((id, index) => {
        const item =
          objects[id] ??
          lines[id];

        if (!item) return null;

        return {
          ...item,

          sceneKind:
            objects[id]
              ? "object"
              : "line",

          layerIndex:
            index,

          zIndex:
            layerOrder.length -
            index +
            20,
        };
      })
      .filter(Boolean);
  }, [
    objects,
    lines,
    layerOrder,
  ]);

  const exportCode = useMemo(() => {
    return JSON.stringify(
      {
        canvas:
          serializeCanvas(
            canvas,
          ),

        assets,

        objects:
          serializeObjects(
            objects,
          ),

        lines,

        layerOrder,
        sidebarOrder,
        panelState,

        geometry,
      },
      null,
      2,
    );
  }, [
    canvas,
    assets,
    objects,
    lines,
    layerOrder,
    sidebarOrder,
    panelState,
    geometry,
  ]);

  function pointFromPointer(pointer) {
    if (!stageRef.current) {
      return {
        x: 0,
        y: 0,
      };
    }

    const rect =
      stageRef.current.getBoundingClientRect();

    return {
      x: clamp(
        ((pointer.clientX -
          rect.left) /
          rect.width) *
          100,

        0,
        100,
      ),

      y: clamp(
        ((pointer.clientY -
          rect.top) /
          rect.height) *
          100,

        0,
        100,
      ),
    };
  }

  function clearSnap() {
    snapLockRef.current = {
      x: null,
      y: null,
    };

    setSnapGuide({
      x: null,
      y: null,
    });
  }

  function togglePanel(id) {
    setPanelState((current) => ({
      ...current,
      [id]: !current[id],
    }));
  }

  function collapseAllPanels() {
    setPanelState(
      Object.fromEntries(
        sidebarOrder.map((id) => [
          id,
          false,
        ]),
      ),
    );
  }

  function expandAllPanels() {
    setPanelState(
      Object.fromEntries(
        sidebarOrder.map((id) => [
          id,
          true,
        ]),
      ),
    );
  }

  /* =======================================================
     OBJECT MOVEMENT
     ======================================================= */

  function startObjectMove(id, event) {
    const object =
      objects[id];

    if (
      editorMode !== "edit" ||
      !object ||
      object.locked ||
      activeTool !== "select"
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setSelectedId(id);

    interactionRef.current = {
      type: "object-move",
      id,
    };

    clearSnap();
  }

  function startObjectScale(id, event) {
    const object =
      objects[id];

    if (
      editorMode !== "edit" ||
      !object ||
      object.locked ||
      activeTool !== "select"
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const rect =
      stageRef.current.getBoundingClientRect();

    const center = {
      x:
        rect.left +
        (object.x / 100) *
          rect.width,

      y:
        rect.top +
        (object.y / 100) *
          rect.height,
    };

    interactionRef.current = {
      type: "object-scale",

      id,
      center,

      startDistance:
        distanceBetween(
          event.clientX,
          event.clientY,
          center.x,
          center.y,
        ),

      startScale:
        object.scale,
    };

    setSelectedId(id);
  }

  function startObjectRotate(id, event) {
    const object =
      objects[id];

    if (
      editorMode !== "edit" ||
      !object ||
      object.locked ||
      activeTool !== "select"
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    const rect =
      stageRef.current.getBoundingClientRect();

    const centerX =
      rect.left +
      (object.x / 100) *
        rect.width;

    const centerY =
      rect.top +
      (object.y / 100) *
        rect.height;

    interactionRef.current = {
      type: "object-rotate",

      id,

      centerX,
      centerY,

      startPointerAngle:
        angleFromCenter(
          event.clientX,
          event.clientY,
          centerX,
          centerY,
        ),

      startRotation:
        object.rotation,
    };

    setSelectedId(id);
  }

  /* =======================================================
     LINE MOVEMENT
     ======================================================= */

  function startLineMove(id, event) {
    const line =
      lines[id];

    if (
      editorMode !== "edit" ||
      !line ||
      line.locked ||
      activeTool !== "select"
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setSelectedId(id);

    const pointer =
      pointFromPointer(event);

    interactionRef.current = {
      type: "line-move",

      id,

      startPointer:
        pointer,

      originalLine: {
        ...line,
      },
    };
  }

  function startLineEndpointMove(
    id,
    endpoint,
    event,
  ) {
    const line =
      lines[id];

    if (
      editorMode !== "edit" ||
      !line ||
      line.locked
    ) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();

    setSelectedId(id);

    interactionRef.current = {
      type:
        "line-endpoint",

      id,
      endpoint,
    };
  }

  function handleStagePointerDown(event) {
    if (
      editorMode !== "edit"
    ) {
      return;
    }

    if (
      activeTool ===
      "line"
    ) {
      event.preventDefault();

      const point =
        pointFromPointer(
          event,
        );

      interactionRef.current = {
        type:
          "line-create",

        start:
          point,
      };

      setLinePreview({
        x1:
          point.x,

        y1:
          point.y,

        x2:
          point.x,

        y2:
          point.y,
      });

      return;
    }

    if (
      event.target ===
      event.currentTarget
    ) {
      setSelectedId(null);
    }
  }

  function queuePointerUpdate(event) {
    if (
      !interactionRef.current
    ) {
      return;
    }

    pendingPointerRef.current = {
      clientX:
        event.clientX,

      clientY:
        event.clientY,

      altKey:
        event.altKey,

      shiftKey:
        event.shiftKey,
    };

    if (
      animationFrameRef.current
    ) {
      return;
    }

    animationFrameRef.current =
      requestAnimationFrame(
        () => {
          animationFrameRef.current =
            null;

          processPointerUpdate();
        },
      );
  }

  function processPointerUpdate() {
    const interaction =
      interactionRef.current;

    const pointer =
      pendingPointerRef.current;

    if (
      !interaction ||
      !pointer
    ) {
      return;
    }

    switch (
      interaction.type
    ) {
      case "object-move":
        processObjectMove(
          interaction,
          pointer,
        );
        break;

      case "object-scale":
        processObjectScale(
          interaction,
          pointer,
        );
        break;

      case "object-rotate":
        processObjectRotate(
          interaction,
          pointer,
        );
        break;

      case "line-create":
        processLineCreate(
          interaction,
          pointer,
        );
        break;

      case "line-move":
        processLineMove(
          interaction,
          pointer,
        );
        break;

      case "line-endpoint":
        processLineEndpoint(
          interaction,
          pointer,
        );
        break;

      default:
        break;
    }
  }

  function processObjectMove(
    interaction,
    pointer,
  ) {
    const point =
      pointFromPointer(
        pointer,
      );

    let x =
      point.x;

    let y =
      point.y;

    if (
      snapSettings.enabled &&
      !pointer.altKey
    ) {
      const result =
        applyMagneticSnapping({
          x,
          y,

          dragging:
            interaction.id,

          objects,

          settings:
            snapSettings,

          currentLock:
            snapLockRef.current,
        });

      x =
        result.x;

      y =
        result.y;

      snapLockRef.current = {
        x:
          result.snapX,

        y:
          result.snapY,
      };

      setSnapGuide({
        x:
          result.snapX,

        y:
          result.snapY,
      });
    } else {
      clearSnap();
    }

    const current =
      objects[
        interaction.id
      ];

    if (!current) return;

    const dx =
      x -
      current.x;

    const dy =
      y -
      current.y;

    setObjects(
      (currentObjects) => {
        const next = {
          ...currentObjects,

          [interaction.id]: {
            ...currentObjects[
              interaction.id
            ],

            x,
            y,
          },
        };

        const pairId =
          currentObjects[
            interaction.id
          ]?.pairId;

        if (
          pairId &&
          next[pairId] &&
          !next[pairId].locked
        ) {
          next[pairId] = {
            ...next[pairId],

            x: clamp(
              next[pairId].x +
                dx,

              0,
              100,
            ),

            y: clamp(
              next[pairId].y +
                dy,

              0,
              100,
            ),
          };
        }

        Object.values(
          next,
        ).forEach(
          (candidate) => {
            if (
              candidate.parentId ===
                interaction.id &&
              !candidate.locked
            ) {
              next[
                candidate.id
              ] = {
                ...candidate,

                x: clamp(
                  candidate.x +
                    dx,

                  0,
                  100,
                ),

                y: clamp(
                  candidate.y +
                    dy,

                  0,
                  100,
                ),
              };
            }
          },
        );

        return next;
      },
    );
  }

  function processObjectScale(
    interaction,
    pointer,
  ) {
    const currentDistance =
      distanceBetween(
        pointer.clientX,
        pointer.clientY,

        interaction.center.x,
        interaction.center.y,
      );

    if (
      !interaction.startDistance
    ) {
      return;
    }

    const ratio =
      currentDistance /
      interaction.startDistance;

    setObjects(
      (current) => ({
        ...current,

        [interaction.id]: {
          ...current[
            interaction.id
          ],

          scale:
            clamp(
              interaction.startScale *
                ratio,

              0.1,
              5,
            ),
        },
      }),
    );
  }

  function processObjectRotate(
    interaction,
    pointer,
  ) {
    const pointerAngle =
      angleFromCenter(
        pointer.clientX,
        pointer.clientY,

        interaction.centerX,
        interaction.centerY,
      );

    let rotation =
      interaction.startRotation +
      pointerAngle -
      interaction.startPointerAngle;

    if (
      pointer.shiftKey
    ) {
      rotation =
        Math.round(
          rotation /
            15,
        ) *
        15;
    }

    setObjects(
      (current) => ({
        ...current,

        [interaction.id]: {
          ...current[
            interaction.id
          ],

          rotation:
            normalizeAngle(
              rotation,
            ),
        },
      }),
    );
  }

  function processLineCreate(
    interaction,
    pointer,
  ) {
    const point =
      pointFromPointer(
        pointer,
      );

    let x2 =
      point.x;

    let y2 =
      point.y;

    if (
      pointer.shiftKey
    ) {
      const snapped =
        snapLineAngle({
          x1:
            interaction.start.x,

          y1:
            interaction.start.y,

          x2,
          y2,
        });

      x2 =
        snapped.x2;

      y2 =
        snapped.y2;
    }

    setLinePreview({
      x1:
        interaction.start.x,

      y1:
        interaction.start.y,

      x2,
      y2,
    });
  }

  function processLineMove(
    interaction,
    pointer,
  ) {
    const point =
      pointFromPointer(
        pointer,
      );

    const dx =
      point.x -
      interaction.startPointer.x;

    const dy =
      point.y -
      interaction.startPointer.y;

    const line =
      interaction.originalLine;

    setLines(
      (current) => ({
        ...current,

        [interaction.id]: {
          ...current[
            interaction.id
          ],

          x1:
            clamp(
              line.x1 +
                dx,

              0,
              100,
            ),

          y1:
            clamp(
              line.y1 +
                dy,

              0,
              100,
            ),

          x2:
            clamp(
              line.x2 +
                dx,

              0,
              100,
            ),

          y2:
            clamp(
              line.y2 +
                dy,

              0,
              100,
            ),
        },
      }),
    );
  }

  function processLineEndpoint(
    interaction,
    pointer,
  ) {
    const point =
      pointFromPointer(
        pointer,
      );

    setLines(
      (current) => {
        const line =
          current[
            interaction.id
          ];

        if (!line) {
          return current;
        }

        return {
          ...current,

          [interaction.id]: {
            ...line,

            ...(interaction.endpoint ===
            "start"
              ? {
                  x1:
                    point.x,

                  y1:
                    point.y,
                }
              : {
                  x2:
                    point.x,

                  y2:
                    point.y,
                }),
          },
        };
      },
    );
  }

  function finishInteraction() {
    const interaction =
      interactionRef.current;

    if (
      interaction?.type ===
        "line-create" &&
      linePreview
    ) {
      const length =
        distanceBetween(
          linePreview.x1,
          linePreview.y1,

          linePreview.x2,
          linePreview.y2,
        );

      if (
        length >
        1
      ) {
        const id =
          `line-${Date.now()}`;

        setLines(
          (current) => ({
            ...current,

            [id]: {
              id,

              type:
                "line",

              name:
                `Line ${
                  countCustomLines(
                    current,
                  ) + 1
                }`,

              x1:
                linePreview.x1,

              y1:
                linePreview.y1,

              x2:
                linePreview.x2,

              y2:
                linePreview.y2,

              width: 3,
              opacity: 1,

              visible: true,
              locked: false,

              behavior:
                "none",

              startColor:
                "#D4AF37",

              endColor:
                "#8B5CF6",

              glow: true,

              pairId:
                null,

              parentId:
                null,
            },
          }),
        );

        setLayerOrder(
          (current) => [
            id,
            ...current,
          ],
        );

        setSelectedId(
          id,
        );

        setActiveTool(
          "select",
        );
      }
    }

    interactionRef.current =
      null;

    pendingPointerRef.current =
      null;

    setLinePreview(
      null,
    );

    clearSnap();
  }

  /* =======================================================
     IMAGE UPLOADS
     ======================================================= */

  async function handleImageUpload(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      event.target.value =
        "";

      return;
    }

    try {
      const asset =
        await createAssetFromFile(
          file,
        );

      const id =
        `image-${Date.now()}`;

      const image =
        new window.Image();

      image.onload = () => {
        const aspect =
          image.naturalWidth /
            image.naturalHeight ||
          1;

        setAssets(
          (current) => ({
            ...current,

            [asset.id]:
              asset,
          }),
        );

        setObjects(
          (current) => ({
            ...current,

            [id]: {
              id,

              type:
                "image",

              name:
                file.name,

              assetId:
                asset.id,

              src:
                null,

              x: 50,
              y: 50,

              scale: 1,
              rotation: 0,

              visible: true,
              locked: false,

              opacity: 1,

              behavior:
                "none",

              pairId:
                null,

              parentId:
                null,

              attachedImage:
                null,

              aspect,
            },
          }),
        );

        setLayerOrder(
          (current) => [
            id,
            ...current,
          ],
        );

        setSelectedId(id);
        setActiveTool(
          "select",
        );
      };

      image.src =
        asset.dataUrl;
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to import image.",
      );
    } finally {
      event.target.value =
        "";
    }
  }

  async function handleAttachImage(event) {
    const file =
      event.target.files?.[0];

    if (
      !file ||
      !selectedObject
    ) {
      event.target.value =
        "";

      return;
    }

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      event.target.value =
        "";

      return;
    }

    try {
      const asset =
        await createAssetFromFile(
          file,
        );

      setAssets(
        (current) => ({
          ...current,

          [asset.id]:
            asset,
        }),
      );

      setObjects(
        (current) => ({
          ...current,

          [selectedObject.id]: {
            ...current[
              selectedObject.id
            ],

            attachedImage: {
              assetId:
                asset.id,

              src:
                null,

              name:
                file.name,

              opacity: 1,

              scale: 1,

              fit:
                "contain",
            },
          },
        }),
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to attach image.",
      );
    } finally {
      event.target.value =
        "";
    }
  }

  function removeAttachedImage(
    objectId,
  ) {
    const attachment =
      objects[
        objectId
      ]?.attachedImage;

    if (
      attachment?.src?.startsWith(
        "blob:",
      )
    ) {
      URL.revokeObjectURL(
        attachment.src,
      );
    }

    setObjects(
      (current) => ({
        ...current,

        [objectId]: {
          ...current[
            objectId
          ],

          attachedImage:
            null,
        },
      }),
    );
  }

  async function handleBackgroundUpload(event) {
    const file =
      event.target.files?.[0];

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      event.target.value =
        "";

      return;
    }

    try {
      const asset =
        await createAssetFromFile(
          file,
        );

      setAssets(
        (current) => ({
          ...current,

          [asset.id]:
            asset,
        }),
      );

      setCanvas(
        (current) => ({
          ...current,

          background: {
            ...current.background,

            type:
              "image",

            assetId:
              asset.id,

            imageSrc:
              null,

            imageName:
              file.name,
          },
        }),
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to import background image.",
      );
    } finally {
      event.target.value =
        "";
    }
  }

  function updateBackground(
    key,
    value,
  ) {
    setCanvas(
      (current) => ({
        ...current,

        background: {
          ...current.background,

          [key]:
            value,
        },
      }),
    );
  }

  /* =======================================================
     VIEWPORT
     ======================================================= */

  function setViewportPreset(
    presetKey,
  ) {
    const preset =
      viewportPresets[
        presetKey
      ];

    if (!preset) return;

    setCanvas(
      (current) => ({
        ...current,

        preset:
          presetKey,

        width:
          preset.width,

        height:
          preset.height,

        orientation:
          preset.width >=
          preset.height
            ? "landscape"
            : "portrait",
      }),
    );
  }

  function swapOrientation() {
    setCanvas(
      (current) => ({
        ...current,

        width:
          current.height,

        height:
          current.width,

        orientation:
          current.orientation ===
          "landscape"
            ? "portrait"
            : "landscape",

        preset:
          "custom",
      }),
    );
  }

  /* =======================================================
     PAIRS
     ======================================================= */

  function pairObjects(
    firstId,
    secondId,
  ) {
    if (
      !firstId ||
      !secondId ||
      firstId ===
        secondId ||
      !objects[firstId] ||
      !objects[secondId]
    ) {
      return;
    }

    setObjects(
      (current) => {
        const next = {
          ...current,
        };

        const firstOldPair =
          next[firstId]
            ?.pairId;

        const secondOldPair =
          next[secondId]
            ?.pairId;

        if (
          firstOldPair &&
          next[
            firstOldPair
          ]
        ) {
          next[
            firstOldPair
          ] = {
            ...next[
              firstOldPair
            ],

            pairId:
              null,
          };
        }

        if (
          secondOldPair &&
          next[
            secondOldPair
          ]
        ) {
          next[
            secondOldPair
          ] = {
            ...next[
              secondOldPair
            ],

            pairId:
              null,
          };
        }

        next[firstId] = {
          ...next[firstId],

          pairId:
            secondId,
        };

        next[secondId] = {
          ...next[secondId],

          pairId:
            firstId,
        };

        return next;
      },
    );
  }

  function unpairObject(
    objectId,
  ) {
    const pairId =
      objects[
        objectId
      ]?.pairId;

    setObjects(
      (current) => {
        const next = {
          ...current,
        };

        if (
          next[objectId]
        ) {
          next[objectId] = {
            ...next[
              objectId
            ],

            pairId:
              null,
          };
        }

        if (
          pairId &&
          next[pairId]
        ) {
          next[pairId] = {
            ...next[pairId],

            pairId:
              null,
          };
        }

        return next;
      },
    );
  }

  /* =======================================================
     CHILDREN
     ======================================================= */

  function addChildObject(
    parentId,
    childId,
  ) {
    if (
      !parentId ||
      !childId ||
      parentId ===
        childId ||
      !objects[parentId] ||
      !objects[childId]
    ) {
      return;
    }

    if (
      objects[parentId]
        .parentId ===
      childId
    ) {
      return;
    }

    setObjects(
      (current) => ({
        ...current,

        [childId]: {
          ...current[
            childId
          ],

          parentId,
        },
      }),
    );
  }

  function removeChildObject(
    childId,
  ) {
    if (
      !objects[childId]
    ) {
      return;
    }

    setObjects(
      (current) => ({
        ...current,

        [childId]: {
          ...current[
            childId
          ],

          parentId:
            null,
        },
      }),
    );
  }

  /* =======================================================
     VISIBILITY / LOCK
     ======================================================= */

  function toggleVisibility(id) {
    if (objects[id]) {
      setObjects(
        (current) => ({
          ...current,

          [id]: {
            ...current[id],

            visible:
              !current[id]
                .visible,
          },
        }),
      );

      return;
    }

    if (lines[id]) {
      setLines(
        (current) => ({
          ...current,

          [id]: {
            ...current[id],

            visible:
              !current[id]
                .visible,
          },
        }),
      );
    }
  }

  function toggleLock(id) {
    if (objects[id]) {
      setObjects(
        (current) => ({
          ...current,

          [id]: {
            ...current[id],

            locked:
              !current[id]
                .locked,
          },
        }),
      );

      return;
    }

    if (lines[id]) {
      setLines(
        (current) => ({
          ...current,

          [id]: {
            ...current[id],

            locked:
              !current[id]
                .locked,
          },
        }),
      );
    }
  }

  /* =======================================================
     DELETE
     ======================================================= */

  function deleteSelected() {
    if (selectedLine) {
      setLines(
        (current) => {
          const next = {
            ...current,
          };

          delete next[
            selectedId
          ];

          return next;
        },
      );

      setLayerOrder(
        (current) =>
          current.filter(
            (id) =>
              id !==
              selectedId,
          ),
      );

      setSelectedId(
        null,
      );

      return;
    }

    if (
      selectedObject?.type ===
      "image"
    ) {
      if (
        selectedObject.src?.startsWith(
          "blob:",
        )
      ) {
        URL.revokeObjectURL(
          selectedObject.src,
        );
      }

      setObjects(
        (current) => {
          const next = {
            ...current,
          };

          delete next[
            selectedId
          ];

          Object.values(
            next,
          ).forEach(
            (candidate) => {
              if (
                candidate.pairId ===
                selectedId
              ) {
                next[
                  candidate.id
                ] = {
                  ...candidate,

                  pairId:
                    null,
                };
              }

              if (
                candidate.parentId ===
                selectedId
              ) {
                next[
                  candidate.id
                ] = {
                  ...next[
                    candidate.id
                  ],

                  parentId:
                    null,
                };
              }
            },
          );

          return next;
        },
      );

      setLayerOrder(
        (current) =>
          current.filter(
            (id) =>
              id !==
              selectedId,
          ),
      );

      setSelectedId(
        null,
      );
    }
  }

  /* =======================================================
     REORDERING
     ======================================================= */

  function reorderLayer(
    draggedId,
    targetId,
  ) {
    if (
      !draggedId ||
      !targetId ||
      draggedId ===
        targetId
    ) {
      return;
    }

    setLayerOrder(
      (current) => {
        const next =
          current.filter(
            (id) =>
              id !==
              draggedId,
          );

        const targetIndex =
          next.indexOf(
            targetId,
          );

        if (
          targetIndex ===
          -1
        ) {
          return current;
        }

        next.splice(
          targetIndex,
          0,
          draggedId,
        );

        return next;
      },
    );
  }

  function reorderSidebar(
    draggedId,
    targetId,
  ) {
    if (
      !draggedId ||
      !targetId ||
      draggedId ===
        targetId
    ) {
      return;
    }

    setSidebarOrder(
      (current) => {
        const next =
          current.filter(
            (id) =>
              id !==
              draggedId,
          );

        const targetIndex =
          next.indexOf(
            targetId,
          );

        if (
          targetIndex ===
          -1
        ) {
          return current;
        }

        next.splice(
          targetIndex,
          0,
          draggedId,
        );

        return next;
      },
    );
  }

  /* =======================================================
     DOCUMENT
     ======================================================= */

  function resetDocument() {
    setAssets({});

    setObjects(
      defaultObjects,
    );

    setLines(
      defaultLines,
    );

    setLayerOrder(
      defaultLayerOrder,
    );

    setSidebarOrder(
      defaultSidebarOrder,
    );

    setPanelState(
      defaultPanelState,
    );

    setGeometry(
      defaultGeometry,
    );

    setSnapSettings(
      defaultSnapSettings,
    );

    setCanvas(
      defaultCanvas,
    );

    setSceneMode(
      DOCUMENT_MODES.TWO_D,
    );

    setScene3D(
      createDefaultThreeDScene(),
    );

    setSelectedId(
      "core",
    );

    setActiveTool(
      "select",
    );

    setLinePreview(
      null,
    );

    clearSnap();
  }

  async function copyDocument() {
    await navigator.clipboard.writeText(
      exportCode,
    );
  }

  function buildCurrentDocument() {
    return {
      format:
        DOCUMENT_FORMAT,

      version:
        DOCUMENT_VERSION,

      metadata: {
        name:
          projectName ||
          "Untitled Lazarus Project",

        createdAt:
          projectCreatedAtRef.current,

        updatedAt:
          new Date().toISOString(),
      },

      scene:
        createSceneSettings({
          mode:
            sceneMode,

          unit:
            sceneMode ===
            DOCUMENT_MODES.THREE_D
              ? "meter"
              : "pixel",
        }),

      scene3D:
        structuredClone(
          scene3D,
        ),

      canvas:
        structuredClone(
          canvas,
        ),

      assets:
        structuredClone(
          assets,
        ),

      objects:
        structuredClone(
          objects,
        ),

      lines:
        structuredClone(
          lines,
        ),

      layerOrder: [
        ...layerOrder,
      ],

      geometry:
        structuredClone(
          geometry,
        ),

      editor: {
        sidebarOrder: [
          ...sidebarOrder,
        ],

        panelState: {
          ...panelState,
        },

        snapSettings:
          structuredClone(
            snapSettings,
          ),

        guides: {
          grid:
            showGrid,

          thirds:
            showThirds,

          crosshair:
            showCrosshair,

          safeArea:
            showSafeArea,

          ringGuide:
            showRingGuide,
        },
      },
    };
  }

  function loadProjectDocument(
    document,
  ) {
    projectCreatedAtRef.current =
      document.metadata?.createdAt ||
      new Date().toISOString();

    setProjectName(
      document.metadata?.name ||
      "Untitled Lazarus Project",
    );

    setSceneMode(
      document.scene?.mode ===
      DOCUMENT_MODES.THREE_D
        ? DOCUMENT_MODES.THREE_D
        : DOCUMENT_MODES.TWO_D,
    );

    setScene3D(
      structuredClone(
        document.scene3D ??
        createDefaultThreeDScene(),
      ),
    );

    setCanvas(
      structuredClone(
        document.canvas ??
        defaultCanvas,
      ),
    );

    setAssets(
      structuredClone(
        normalizeAssetRegistry(
          document.assets,
        ),
      ),
    );

    setObjects(
      structuredClone(
        document.objects ??
        defaultObjects,
      ),
    );

    setLines(
      structuredClone(
        document.lines ??
        defaultLines,
      ),
    );

    setLayerOrder([
      ...(
        document.layerOrder ??
        defaultLayerOrder
      ),
    ]);

    setGeometry(
      structuredClone(
        document.geometry ??
        defaultGeometry,
      ),
    );

    setSidebarOrder([
      ...(
        document.editor?.sidebarOrder ??
        defaultSidebarOrder
      ),
    ]);

    setPanelState({
      ...defaultPanelState,
      ...(
        document.editor?.panelState ??
        {}
      ),
    });

    setSnapSettings({
      ...defaultSnapSettings,
      ...(
        document.editor?.snapSettings ??
        {}
      ),
    });

    setShowGrid(
      document.editor?.guides?.grid ??
      true,
    );

    setShowThirds(
      document.editor?.guides?.thirds ??
      false,
    );

    setShowCrosshair(
      document.editor?.guides?.crosshair ??
      true,
    );

    setShowSafeArea(
      document.editor?.guides?.safeArea ??
      true,
    );

    setShowRingGuide(
      document.editor?.guides?.ringGuide ??
      true,
    );

    setSelectedId(
      null,
    );

    setActiveTool(
      "select",
    );

    setLinePreview(
      null,
    );

    clearSnap();
  }

  function handleNewProject() {
    const next =
      createDefaultDocument();

    loadProjectDocument(
      next,
    );
  }

  function handleSaveProject() {
    downloadProjectFile(
      buildCurrentDocument(),
    );
  }

  async function handleOpenProject(file) {
    try {
      const document =
        await readProjectFile(
          file,
        );

      loadProjectDocument(
        document,
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to open Lazarus project.",
      );
    }
  }

  function handleExportHtml() {
    exportStaticWebsite(
      buildCurrentDocument(),
    );
  }

  async function handleExportZip() {
    try {
      await exportStaticProjectZip(
        buildCurrentDocument(),
      );
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to export project ZIP.",
      );
    }
  }

  const backgroundStyle =
    buildBackgroundStyle(
      canvas.background,
      assets,
    );

  const backgroundAnimationClass =
    getBackgroundAnimationClass(
      canvas.background
        .animation,
    );

  /* =======================================================
     SIDEBAR CONTENT
     ======================================================= */

  function renderSidebarSection(
    sectionId,
  ) {
    switch (sectionId) {
      case "layers":
        return (
          <LayerStackContent
            sceneItems={
              sceneItems
            }
            objects={
              objects
            }
            lines={
              lines
            }
            selectedId={
              selectedId
            }
            setSelectedId={
              setSelectedId
            }
            toggleVisibility={
              toggleVisibility
            }
            toggleLock={
              toggleLock
            }
            draggedLayerId={
              draggedLayerId
            }
            setDraggedLayerId={
              setDraggedLayerId
            }
            reorderLayer={
              reorderLayer
            }
            pairObjects={
              pairObjects
            }
            unpairObject={
              unpairObject
            }
            addChildObject={
              addChildObject
            }
            removeChildObject={
              removeChildObject
            }
            onAttachImage={() =>
              attachmentInputRef.current?.click()
            }
            removeAttachedImage={
              removeAttachedImage
            }
            assets={
              assets
            }
          />
        );

      case "inspector":
        return (
          <>
            {selectedObject && (
              <ObjectInspector
                object={
                  selectedObject
                }
                setObjects={
                  setObjects
                }
                deletable={
                  selectedObject.type ===
                  "image"
                }
                deleteSelected={
                  deleteSelected
                }
              />
            )}

            {selectedLine && (
              <LineInspector
                line={
                  selectedLine
                }
                setLines={
                  setLines
                }
                deleteSelected={
                  deleteSelected
                }
              />
            )}

            {!selectedObject &&
              !selectedLine && (
                <p className="text-sm leading-6 text-slate-500">
                  Select an object
                  or line from the
                  canvas or layer
                  stack.
                </p>
              )}
          </>
        );

      case "background":
        return (
          <BackgroundPanelContent
            canvas={
              canvas
            }
            setCanvas={
              setCanvas
            }
            updateBackground={
              updateBackground
            }
            onUpload={() =>
              backgroundInputRef.current?.click()
            }
          />
        );

      case "snap":
        return (
          <AutoSnapContent
            snapSettings={
              snapSettings
            }
            setSnapSettings={
              setSnapSettings
            }
          />
        );

      case "geometry":
        return (
          <GeometryContent
            geometry={
              geometry
            }
            setGeometry={
              setGeometry
            }
          />
        );

      case "guides":
        return (
          <GuidesContent
            showGrid={
              showGrid
            }
            setShowGrid={
              setShowGrid
            }
            showThirds={
              showThirds
            }
            setShowThirds={
              setShowThirds
            }
            showCrosshair={
              showCrosshair
            }
            setShowCrosshair={
              setShowCrosshair
            }
            showSafeArea={
              showSafeArea
            }
            setShowSafeArea={
              setShowSafeArea
            }
            showRingGuide={
              showRingGuide
            }
            setShowRingGuide={
              setShowRingGuide
            }
            canvas={
              canvas
            }
            setCanvas={
              setCanvas
            }
          />
        );

      default:
        return null;
    }
  }

  const sidebarTitles = {
    layers:
      "Objects / Layers",

    inspector:
      "Inspector",

    background:
      "Background / Canvas",

    snap:
      "Auto Snap",

    geometry:
      "Geometry",

    guides:
      "Guides",
  };

  return (
    <main className="min-h-screen bg-[#05070D] px-5 py-8 text-white md:px-8">
      <section className="mx-auto max-w-[1750px]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-[#D4AF37]">
              Lazarus Design Lab
            </p>

            <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
              Visual Scene Editor
            </h1>

            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-400">
              Build the page visually
              with independent scene
              objects, relationships,
              layers, backgrounds,
              images and behaviors.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() =>
                setEditorMode(
                  editorMode ===
                    "edit"
                    ? "preview"
                    : "edit",
                )
              }
              className={`flex items-center gap-2 rounded-xl border px-5 py-3 font-semibold ${
                editorMode ===
                "preview"
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  : "border-white/10 bg-white/[0.04] text-slate-200"
              }`}
            >
              {editorMode ===
              "preview" ? (
                <Pencil className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}

              {editorMode ===
              "preview"
                ? "Edit Mode"
                : "Preview"}
            </button>

            <button
              onClick={() =>
                setShowSidebar(
                  (current) =>
                    !current,
                )
              }
              className={`flex items-center gap-2 rounded-xl border px-5 py-3 font-semibold ${
                showSidebar
                  ? "border-[#8B5CF6]/50 bg-[#8B5CF6]/15 text-[#C4B5FD]"
                  : "border-white/10 bg-white/[0.04] text-slate-200"
              }`}
            >
              <Layers3 className="h-4 w-4" />
              Panels
            </button>

            <button
              onClick={
                resetDocument
              }
              className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3 font-semibold text-slate-200"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>

            <button
              onClick={
                copyDocument
              }
              className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-5 py-3 font-semibold text-black"
            >
              <Copy className="h-4 w-4" />
              Copy Document
            </button>
          </div>
        </header>

        <ProjectToolbar
          projectName={
            projectName
          }
          onProjectNameChange={
            setProjectName
          }
          onNew={
            handleNewProject
          }
          onSave={
            handleSaveProject
          }
          onOpen={
            handleOpenProject
          }
          onExportHtml={
            handleExportHtml
          }
          onExportZip={
            handleExportZip
          }
        />

        <SceneModeSwitch
          mode={sceneMode}
          onModeChange={setSceneMode}
        />

        <ViewportToolbar
          canvas={
            canvas
          }
          setViewportPreset={
            setViewportPreset
          }
          swapOrientation={
            swapOrientation
          }
        />

        <div
          className={`grid gap-8 ${
            showSidebar &&
            editorMode ===
              "edit"
              ? "xl:grid-cols-[minmax(0,1fr)_470px]"
              : "grid-cols-1"
          }`}
        >
          <div className="min-w-0">
            {editorMode ===
              "edit" && (
              <Toolbar
                activeTool={
                  activeTool
                }
                setActiveTool={
                  setActiveTool
                }
                onUpload={() =>
                  fileInputRef.current?.click()
                }
              />
            )}

            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={
                handleImageUpload
              }
              className="hidden"
            />

            <input
              ref={
                backgroundInputRef
              }
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={
                handleBackgroundUpload
              }
              className="hidden"
            />

            <input
              ref={
                attachmentInputRef
              }
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
              onChange={
                handleAttachImage
              }
              className="hidden"
            />

            {/* STEP 8E: THREE WORKSPACE */}
            {sceneMode === "3d" && (
              <ThreeWorkspace
                scene3D={scene3D}
                onSceneChange={setScene3D}
              />
            )}

            <div className={`${sceneMode === "3d" ? "hidden" : "flex"} w-full justify-center overflow-auto rounded-[2rem] border border-white/5 bg-black/30 p-4 md:p-8`}>
              <div
                ref={
                  stageRef
                }
                onPointerDown={
                  handleStagePointerDown
                }
                onPointerMove={
                  queuePointerUpdate
                }
                onPointerUp={
                  finishInteraction
                }
                onPointerCancel={
                  finishInteraction
                }
                onPointerLeave={
                  finishInteraction
                }
                onDragStart={(
                  event,
                ) =>
                  event.preventDefault()
                }
                className={`relative w-full touch-none select-none border border-white/10 shadow-2xl shadow-black/60 ${
                  canvas.clipContent
                    ? "overflow-hidden"
                    : "overflow-visible"
                } ${
                  activeTool ===
                    "line" &&
                  editorMode ===
                    "edit"
                    ? "cursor-crosshair"
                    : "cursor-default"
                }`}
                style={{
                  maxWidth:
                    `${canvas.width}px`,

                  aspectRatio:
                    `${canvas.width} / ${canvas.height}`,

                  backgroundColor:
                    canvas.background
                      .solidColor,
                }}
              >
                <div
                  className={`pointer-events-none absolute inset-0 z-0 ${backgroundAnimationClass}`}
                  style={{
                    ...backgroundStyle,

                    "--background-animation-duration":
                      `${canvas.background.animationDuration}s`,

                    "--background-animation-intensity":
                      canvas.background
                        .animationIntensity,

                    animationDirection:
                      canvas.background
                        .animationDirection,
                  }}
                />

                {canvas.background
                  .overlayEnabled && (
                  <div
                    className="pointer-events-none absolute inset-0 z-[1]"
                    style={{
                      backgroundColor:
                        canvas.background
                          .overlayColor,

                      opacity:
                        canvas.background
                          .overlayOpacity,
                    }}
                  />
                )}

                {canvas.background
                  .gradientOverlayEnabled && (
                  <div
                    className="pointer-events-none absolute inset-0 z-[2]"
                    style={{
                      background:
                        `linear-gradient(${canvas.background.gradientOverlayAngle}deg, ${canvas.background.gradientOverlayStart}, ${canvas.background.gradientOverlayEnd})`,

                      opacity:
                        canvas.background
                          .gradientOverlayOpacity,
                    }}
                  />
                )}

                {editorMode ===
                  "edit" && (
                  <>
                    {showGrid && (
                      <Grid
                        gridSize={
                          snapSettings.gridSize
                        }
                      />
                    )}

                    {showThirds && (
                      <Thirds />
                    )}

                    {showCrosshair && (
                      <Crosshair />
                    )}

                    {showSafeArea && (
                      <SafeArea />
                    )}

                    <SnapGuides
                      snapGuide={
                        snapGuide
                      }
                    />

                    {showRingGuide &&
                      objects.core
                        ?.visible && (
                        <RingGuide
                          core={
                            objects.core
                          }
                          ringRadius={
                            geometry.ringRadius
                          }
                        />
                      )}
                  </>
                )}

                {[...sceneItems]
                  .reverse()
                  .map(
                    (item) => {
                      if (
                        !item.visible
                      ) {
                        return null;
                      }

                      if (
                        item.sceneKind ===
                        "line"
                      ) {
                        const rendered =
                          calculatedLines.find(
                            (
                              candidate,
                            ) =>
                              candidate.id ===
                              item.id,
                          );

                        if (
                          !rendered
                        ) {
                          return null;
                        }

                        return (
                          <EditableLine
                            key={
                              item.id
                            }
                            line={
                              item
                            }
                            rendered={
                              rendered
                            }
                            selected={
                              selectedId ===
                              item.id
                            }
                            zIndex={
                              item.zIndex
                            }
                            editorMode={
                              editorMode
                            }
                            onSelect={
                              setSelectedId
                            }
                            onMove={
                              startLineMove
                            }
                            onEndpointMove={
                              startLineEndpointMove
                            }
                          />
                        );
                      }

                      if (
                        item.type ===
                        "core"
                      ) {
                        return (
                          <TransformItem
                            key={
                              item.id
                            }
                            object={
                              item
                            }
                            selected={
                              selectedId ===
                              item.id
                            }
                            activeTool={
                              activeTool
                            }
                            editorMode={
                              editorMode
                            }
                            zIndex={
                              item.zIndex
                            }
                            baseWidthPercent={
                              52
                            }
                            baseHeightPercent={
                              52
                            }
                            transformPadding={
                              12
                            }
                            onMove={
                              startObjectMove
                            }
                            onScale={
                              startObjectScale
                            }
                            onRotate={
                              startObjectRotate
                            }
                            onSelect={
                              setSelectedId
                            }
                          >
                            <HeroCore />

                            <AttachedImage
                              object={
                                item
                              }
                              assets={
                                assets
                              }
                            />
                          </TransformItem>
                        );
                      }

                      if (
                        item.type ===
                        "node"
                      ) {
                        const node =
                          heroNodes.find(
                            (
                              candidate,
                            ) =>
                              candidate.id ===
                              item.id,
                          );

                        return (
                          <TransformItem
                            key={
                              item.id
                            }
                            object={
                              item
                            }
                            selected={
                              selectedId ===
                              item.id
                            }
                            activeTool={
                              activeTool
                            }
                            editorMode={
                              editorMode
                            }
                            zIndex={
                              item.zIndex
                            }
                            baseWidthPx={
                              64
                            }
                            baseHeightPx={
                              64
                            }
                            transformPadding={
                              14
                            }
                            onMove={
                              startObjectMove
                            }
                            onScale={
                              startObjectScale
                            }
                            onRotate={
                              startObjectRotate
                            }
                            onSelect={
                              setSelectedId
                            }
                          >
                            <HeroNode
                              node={
                                node
                              }
                            />

                            <AttachedImage
                              object={
                                item
                              }
                              assets={
                                assets
                              }
                            />
                          </TransformItem>
                        );
                      }

                      if (
                        item.type ===
                        "image"
                      ) {
                        return (
                          <TransformItem
                            key={
                              item.id
                            }
                            object={
                              item
                            }
                            selected={
                              selectedId ===
                              item.id
                            }
                            activeTool={
                              activeTool
                            }
                            editorMode={
                              editorMode
                            }
                            zIndex={
                              item.zIndex
                            }
                            baseWidthPx={
                              220
                            }
                            baseHeightPx={
                              220 /
                              item.aspect
                            }
                            transformPadding={
                              12
                            }
                            onMove={
                              startObjectMove
                            }
                            onScale={
                              startObjectScale
                            }
                            onRotate={
                              startObjectRotate
                            }
                            onSelect={
                              setSelectedId
                            }
                          >
                            <UploadedImage
                              object={
                                item
                              }
                              assets={
                                assets
                              }
                            />

                            <AttachedImage
                              object={
                                item
                              }
                              assets={
                                assets
                              }
                            />
                          </TransformItem>
                        );
                      }

                      return null;
                    },
                  )}

                {linePreview &&
                  editorMode ===
                    "edit" && (
                    <svg
                      className="pointer-events-none absolute inset-0 z-[500] h-full w-full"
                      viewBox="0 0 100 100"
                      preserveAspectRatio="none"
                    >
                      <line
                        x1={
                          linePreview.x1
                        }
                        y1={
                          linePreview.y1
                        }
                        x2={
                          linePreview.x2
                        }
                        y2={
                          linePreview.y2
                        }
                        stroke="#D4AF37"
                        strokeWidth="0.4"
                        strokeDasharray="1 0.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
              </div>
            </div>
          </div>

          {showSidebar &&
            editorMode ===
              "edit" && (
              <aside className="space-y-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={
                      collapseAllPanels
                    }
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Collapse All
                  </button>

                  <button
                    type="button"
                    onClick={
                      expandAllPanels
                    }
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                  >
                    Expand All
                  </button>
                </div>

                {sidebarOrder.map(
                  (
                    sectionId,
                  ) => (
                    <MovablePanel
                      key={
                        sectionId
                      }
                      id={
                        sectionId
                      }
                      title={
                        sidebarTitles[
                          sectionId
                        ]
                      }
                      expanded={
                        panelState[
                          sectionId
                        ]
                      }
                      onToggle={() =>
                        togglePanel(
                          sectionId,
                        )
                      }
                      draggedId={
                        draggedSidebarId
                      }
                      setDraggedId={
                        setDraggedSidebarId
                      }
                      reorder={
                        reorderSidebar
                      }
                    >
                      {renderSidebarSection(
                        sectionId,
                      )}
                    </MovablePanel>
                  ),
                )}
              </aside>
            )}
        </div>
      </section>
    </main>
  );
}

/* =========================================================
   MOVABLE / COLLAPSIBLE PANEL
   ========================================================= */

function MovablePanel({
  id,
  title,
  expanded,
  onToggle,
  draggedId,
  setDraggedId,
  reorder,
  children,
}) {
  return (
    <section
      onDragOver={(event) =>
        event.preventDefault()
      }
      onDrop={(event) => {
        event.preventDefault();

        reorder(
          draggedId,
          id,
        );

        setDraggedId(
          null,
        );
      }}
      className={`overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/[0.035] transition ${
        draggedId === id
          ? "opacity-40"
          : ""
      }`}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <button
          type="button"
          draggable
          onDragStart={(event) => {
            event.stopPropagation();

            setDraggedId(
              id,
            );
          }}
          onDragEnd={() =>
            setDraggedId(
              null,
            )
          }
          className="flex h-8 w-8 cursor-grab items-center justify-center rounded-lg text-slate-600 hover:bg-white/5 hover:text-slate-300 active:cursor-grabbing"
          title="Drag panel"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={
            onToggle
          }
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <h2 className="min-w-0 flex-1 truncate text-lg font-semibold">
            {title}
          </h2>

          {expanded ? (
            <ChevronDown className="h-4 w-4 text-slate-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-slate-500" />
          )}
        </button>
      </div>

      {expanded && (
        <div className="p-5">
          {children}
        </div>
      )}
    </section>
  );
}

/* =========================================================
   OBJECTS / LAYERS
   ========================================================= */

function LayerStackContent({
  sceneItems,
  objects,
  lines,
  selectedId,
  setSelectedId,
  toggleVisibility,
  toggleLock,
  draggedLayerId,
  setDraggedLayerId,
  reorderLayer,
  pairObjects,
  unpairObject,
  addChildObject,
  removeChildObject,
  onAttachImage,
  removeAttachedImage,
  assets,
}) {
  const selectedObject =
    objects[selectedId] ??
    null;

  const [pairTargetId, setPairTargetId] =
    useState("");

  const [childTargetId, setChildTargetId] =
    useState("");

  const children =
    selectedObject
      ? Object.values(
          objects,
        ).filter(
          (candidate) =>
            candidate.parentId ===
            selectedObject.id,
        )
      : [];

  const possibleRelations =
    selectedObject
      ? Object.values(
          objects,
        ).filter(
          (candidate) =>
            candidate.id !==
            selectedObject.id,
        )
      : [];

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-4 text-xs leading-5 text-slate-500">
          Top = foremost. Drag rows
          to change stacking order.
          Lines are standalone
          scene objects.
        </p>

        <div className="space-y-2">
          {sceneItems.map(
            (item) => (
              <div
                key={
                  item.id
                }
                draggable
                onDragStart={() =>
                  setDraggedLayerId(
                    item.id,
                  )
                }
                onDragEnd={() =>
                  setDraggedLayerId(
                    null,
                  )
                }
                onDragOver={(event) =>
                  event.preventDefault()
                }
                onDrop={(event) => {
                  event.preventDefault();

                  reorderLayer(
                    draggedLayerId,
                    item.id,
                  );

                  setDraggedLayerId(
                    null,
                  );
                }}
                className={`flex items-center gap-2 rounded-xl border p-2 transition ${
                  selectedId ===
                  item.id
                    ? "border-[#D4AF37]/60 bg-[#D4AF37]/10"
                    : "border-white/5 bg-black/20"
                } ${
                  draggedLayerId ===
                  item.id
                    ? "opacity-40"
                    : ""
                }`}
              >
                <GripVertical className="h-4 w-4 cursor-grab text-slate-600" />

                <button
                  type="button"
                  onClick={() =>
                    toggleVisibility(
                      item.id,
                    )
                  }
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-white/5"
                >
                  {item.visible ? (
                    <Eye className="h-4 w-4" />
                  ) : (
                    <EyeOff className="h-4 w-4" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedId(
                      item.id,
                    )
                  }
                  className="min-w-0 flex-1 text-left"
                >
                  <p className="truncate text-sm font-medium text-slate-200">
                    {
                      item.name
                    }
                  </p>

                  <div className="mt-1 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-slate-600">
                    <span>
                      Layer{" "}
                      {
                        item.zIndex
                      }
                    </span>

                    <span>
                      {
                        item.type
                      }
                    </span>

                    <span>
                      {Math.round(
                        item.opacity *
                          100,
                      )}
                      %
                    </span>

                    <span>
                      {
                        item.behavior
                      }
                    </span>

                    {item.parentId && (
                      <span className="text-[#A78BFA]">
                        child
                      </span>
                    )}

                    {item.pairId && (
                      <span className="text-[#D4AF37]">
                        paired
                      </span>
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    toggleLock(
                      item.id,
                    )
                  }
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    item.locked
                      ? "bg-[#8B5CF6]/15 text-[#A78BFA]"
                      : "text-slate-500 hover:bg-white/5"
                  }`}
                >
                  {item.locked ? (
                    <Lock className="h-4 w-4" />
                  ) : (
                    <Unlock className="h-4 w-4" />
                  )}
                </button>
              </div>
            ),
          )}
        </div>
      </div>

      {selectedObject && (
        <>
          <div className="border-t border-white/10 pt-5">
            <p className="mb-1 text-sm font-semibold text-white">
              {
                selectedObject.name
              }
            </p>

            <p className="text-xs text-slate-500">
              Object relationships and
              attached content.
            </p>
          </div>

          <InspectorSection title="Pair Object">
            <div className="space-y-3">
              {selectedObject.pairId ? (
                <div className="flex items-center gap-3 rounded-xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-3">
                  <Link2 className="h-4 w-4 text-[#D4AF37]" />

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedId(
                        selectedObject
                          .pairId,
                      )
                    }
                    className="min-w-0 flex-1 truncate text-left text-sm text-slate-200"
                  >
                    {
                      objects[
                        selectedObject
                          .pairId
                      ]?.name
                    }
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      unpairObject(
                        selectedObject.id,
                      )
                    }
                    className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-red-300"
                  >
                    <Unlink className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <select
                    value={
                      pairTargetId
                    }
                    onChange={(event) =>
                      setPairTargetId(
                        event.target
                          .value,
                      )
                    }
                    className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
                  >
                    <option value="">
                      Choose object...
                    </option>

                    {possibleRelations.map(
                      (
                        candidate,
                      ) => (
                        <option
                          key={
                            candidate.id
                          }
                          value={
                            candidate.id
                          }
                        >
                          {
                            candidate.name
                          }
                        </option>
                      ),
                    )}
                  </select>

                  <button
                    type="button"
                    disabled={
                      !pairTargetId
                    }
                    onClick={() => {
                      pairObjects(
                        selectedObject.id,
                        pairTargetId,
                      );

                      setPairTargetId(
                        "",
                      );
                    }}
                    className="rounded-xl bg-[#D4AF37] px-4 text-sm font-semibold text-black disabled:opacity-30"
                  >
                    Pair
                  </button>
                </div>
              )}
            </div>
          </InspectorSection>

          <InspectorSection title="Child Objects">
            <div className="space-y-3">
              <div className="flex gap-2">
                <select
                  value={
                    childTargetId
                  }
                  onChange={(event) =>
                    setChildTargetId(
                      event.target
                        .value,
                    )
                  }
                  className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
                >
                  <option value="">
                    Add child...
                  </option>

                  {possibleRelations
                    .filter(
                      (candidate) =>
                        candidate.parentId !==
                        selectedObject.id,
                    )
                    .map(
                      (
                        candidate,
                      ) => (
                        <option
                          key={
                            candidate.id
                          }
                          value={
                            candidate.id
                          }
                        >
                          {
                            candidate.name
                          }
                        </option>
                      ),
                    )}
                </select>

                <button
                  type="button"
                  disabled={
                    !childTargetId
                  }
                  onClick={() => {
                    addChildObject(
                      selectedObject.id,
                      childTargetId,
                    );

                    setChildTargetId(
                      "",
                    );
                  }}
                  className="rounded-xl bg-[#8B5CF6] px-4 text-sm font-semibold text-white disabled:opacity-30"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {children.map(
                  (child) => (
                    <div
                      key={
                        child.id
                      }
                      className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 p-2"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedId(
                            child.id,
                          )
                        }
                        className="min-w-0 flex-1 truncate px-2 text-left text-sm text-slate-200 hover:text-white"
                      >
                        {
                          child.name
                        }
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          toggleVisibility(
                            child.id,
                          )
                        }
                        className="rounded-lg p-2 text-slate-500 hover:bg-white/5"
                      >
                        {child.visible ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          removeChildObject(
                            child.id,
                          )
                        }
                        className="rounded-lg p-2 text-slate-500 hover:bg-white/5 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ),
                )}

                {!children.length && (
                  <p className="text-xs text-slate-600">
                    No child objects.
                  </p>
                )}
              </div>
            </div>
          </InspectorSection>

          <InspectorSection title="Attach Image">
            {selectedObject.attachedImage ? (
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl border border-white/10 bg-black/30 p-3">
                  <img
                    src={
                      resolveEditorAssetSource(
                        assets,
                        selectedObject
                          .attachedImage
                          .assetId,
                        selectedObject
                          .attachedImage
                          .src,
                      )
                    }
                    alt={
                      selectedObject
                        .attachedImage
                        .name
                    }
                    draggable={
                      false
                    }
                    className="mx-auto max-h-32 max-w-full object-contain"
                  />

                  <p className="mt-2 truncate text-center text-xs text-slate-500">
                    {
                      selectedObject
                        .attachedImage
                        .name
                    }
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    removeAttachedImage(
                      selectedObject.id,
                    )
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Attachment
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={
                  onAttachImage
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-3 text-sm font-semibold text-[#D4AF37]"
              >
                <ImagePlus className="h-4 w-4" />
                Attach Image
              </button>
            )}
          </InspectorSection>
        </>
      )}

      {!selectedObject &&
        selectedId &&
        lines[selectedId] && (
          <p className="rounded-xl border border-white/10 bg-black/20 p-3 text-xs leading-5 text-slate-500">
            This is an independent
            line object. Use the
            Inspector directly below
            to edit it.
          </p>
        )}
    </div>
  );
}

/* =========================================================
   INSPECTOR
   ========================================================= */

function ObjectInspector({
  object,
  setObjects,
  deletable,
  deleteSelected,
}) {
  function update(
    key,
    value,
  ) {
    setObjects(
      (current) => ({
        ...current,

        [object.id]: {
          ...current[
            object.id
          ],

          [key]:
            value,
        },
      }),
    );
  }

  return (
    <div className="space-y-5">
      <TextControl
        label="Name"
        value={
          object.name
        }
        onChange={(value) =>
          update(
            "name",
            value,
          )
        }
      />

      <div className="grid grid-cols-2 gap-3">
        <NumberControl
          label="X"
          value={
            object.x
          }
          suffix="%"
          step={0.1}
          onChange={(value) =>
            update(
              "x",
              clamp(
                value,
                0,
                100,
              ),
            )
          }
        />

        <NumberControl
          label="Y"
          value={
            object.y
          }
          suffix="%"
          step={0.1}
          onChange={(value) =>
            update(
              "y",
              clamp(
                value,
                0,
                100,
              ),
            )
          }
        />
      </div>

      <SliderAndNumberControl
        label="Scale"
        value={
          object.scale
        }
        min={0.1}
        max={5}
        step={0.01}
        suffix="×"
        onChange={(value) =>
          update(
            "scale",
            clamp(
              value,
              0.1,
              5,
            ),
          )
        }
      />

      <SliderAndNumberControl
        label="Rotation"
        value={
          object.rotation
        }
        min={-180}
        max={180}
        step={1}
        suffix="°"
        onChange={(value) =>
          update(
            "rotation",
            normalizeAngle(
              value,
            ),
          )
        }
      />

      <SliderAndNumberControl
        label="Opacity"
        value={
          object.opacity
        }
        min={0}
        max={1}
        step={0.01}
        suffix=""
        onChange={(value) =>
          update(
            "opacity",
            clamp(
              value,
              0,
              1,
            ),
          )
        }
      />

      <BehaviorControl
        value={
          object.behavior
        }
        onChange={(value) =>
          update(
            "behavior",
            value,
          )
        }
      />

      {deletable && (
        <button
          type="button"
          onClick={
            deleteSelected
          }
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
        >
          <Trash2 className="h-4 w-4" />
          Delete Image
        </button>
      )}
    </div>
  );
}

function LineInspector({
  line,
  setLines,
  deleteSelected,
}) {
  function update(
    key,
    value,
  ) {
    setLines(
      (current) => ({
        ...current,

        [line.id]: {
          ...current[
            line.id
          ],

          [key]:
            value,
        },
      }),
    );
  }

  return (
    <div className="space-y-5">
      <TextControl
        label="Name"
        value={
          line.name
        }
        onChange={(value) =>
          update(
            "name",
            value,
          )
        }
      />

      <LineLengthControl
        line={
          line
        }
        setLines={
          setLines
        }
      />

      <LineRotationControl
        line={
          line
        }
        setLines={
          setLines
        }
      />

      <SliderAndNumberControl
        label="Width"
        value={
          line.width
        }
        min={1}
        max={30}
        step={1}
        suffix="px"
        onChange={(value) =>
          update(
            "width",
            clamp(
              value,
              1,
              30,
            ),
          )
        }
      />

      <SliderAndNumberControl
        label="Opacity"
        value={
          line.opacity
        }
        min={0}
        max={1}
        step={0.01}
        suffix=""
        onChange={(value) =>
          update(
            "opacity",
            clamp(
              value,
              0,
              1,
            ),
          )
        }
      />

      <BehaviorControl
        value={
          line.behavior
        }
        onChange={(value) =>
          update(
            "behavior",
            value,
          )
        }
      />

      <ColorControl
        label="Start Color"
        value={
          line.startColor
        }
        onChange={(value) =>
          update(
            "startColor",
            value,
          )
        }
      />

      <ColorControl
        label="End Color"
        value={
          line.endColor
        }
        onChange={(value) =>
          update(
            "endColor",
            value,
          )
        }
      />

      <Toggle
        label="Glow"
        value={
          line.glow
        }
        setValue={(value) =>
          update(
            "glow",
            value,
          )
        }
      />

      <button
        type="button"
        onClick={
          deleteSelected
        }
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-300"
      >
        <Trash2 className="h-4 w-4" />
        Delete Line
      </button>
    </div>
  );
}

/* =========================================================
   BACKGROUND
   ========================================================= */

function BackgroundPanelContent({
  canvas,
  setCanvas,
  updateBackground,
  onUpload,
}) {
  const background =
    canvas.background;

  return (
    <div className="space-y-6">
      <SelectControl
        label="Background Type"
        value={
          background.type
        }
        options={[
          {
            value:
              "solid",

            label:
              "Solid",
          },

          {
            value:
              "gradient",

            label:
              "Gradient",
          },

          {
            value:
              "image",

            label:
              "Image",
          },

          {
            value:
              "transparent",

            label:
              "Transparent",
          },
        ]}
        onChange={(value) =>
          updateBackground(
            "type",
            value,
          )
        }
      />

      {background.type ===
        "solid" && (
        <ColorControl
          label="Background Color"
          value={
            background.solidColor
          }
          onChange={(value) =>
            updateBackground(
              "solidColor",
              value,
            )
          }
        />
      )}

      {background.type ===
        "gradient" && (
        <>
          <ColorControl
            label="Gradient Start"
            value={
              background.gradientStart
            }
            onChange={(value) =>
              updateBackground(
                "gradientStart",
                value,
              )
            }
          />

          <ColorControl
            label="Gradient End"
            value={
              background.gradientEnd
            }
            onChange={(value) =>
              updateBackground(
                "gradientEnd",
                value,
              )
            }
          />

          <SliderAndNumberControl
            label="Gradient Angle"
            value={
              background.gradientAngle
            }
            min={0}
            max={360}
            step={1}
            suffix="°"
            onChange={(value) =>
              updateBackground(
                "gradientAngle",
                value,
              )
            }
          />
        </>
      )}

      {background.type ===
        "image" && (
        <>
          <button
            type="button"
            onClick={
              onUpload
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-4 py-3 text-sm font-semibold text-[#D4AF37]"
          >
            <ImagePlus className="h-4 w-4" />

            {background.assetId ||
            background.imageSrc
              ? "Replace Background Image"
              : "Upload Background Image"}
          </button>

          <SelectControl
            label="Fit"
            value={
              background.imageFit
            }
            options={[
              {
                value:
                  "cover",

                label:
                  "Cover",
              },

              {
                value:
                  "contain",

                label:
                  "Contain",
              },

              {
                value:
                  "fill",

                label:
                  "Fill",
              },

              {
                value:
                  "auto",

                label:
                  "Actual Size",
              },
            ]}
            onChange={(value) =>
              updateBackground(
                "imageFit",
                value,
              )
            }
          />

          <PositionGrid
            x={
              background.imagePositionX
            }
            y={
              background.imagePositionY
            }
            onChange={(x, y) => {
              updateBackground(
                "imagePositionX",
                x,
              );

              updateBackground(
                "imagePositionY",
                y,
              );
            }}
          />

          <SliderAndNumberControl
            label="Scale"
            value={
              background.imageScale
            }
            min={0.25}
            max={3}
            step={0.01}
            suffix="×"
            onChange={(value) =>
              updateBackground(
                "imageScale",
                value,
              )
            }
          />

          <SliderAndNumberControl
            label="Rotation"
            value={
              background.imageRotation
            }
            min={-180}
            max={180}
            step={1}
            suffix="°"
            onChange={(value) =>
              updateBackground(
                "imageRotation",
                value,
              )
            }
          />

          <SliderAndNumberControl
            label="Image Opacity"
            value={
              background.imageOpacity
            }
            min={0}
            max={1}
            step={0.01}
            suffix=""
            onChange={(value) =>
              updateBackground(
                "imageOpacity",
                value,
              )
            }
          />
        </>
      )}

      <InspectorSection title="Tone">
        <div className="space-y-5">
          <SliderAndNumberControl
            label="Brightness"
            value={
              background.brightness
            }
            min={0}
            max={200}
            step={1}
            suffix="%"
            onChange={(value) =>
              updateBackground(
                "brightness",
                value,
              )
            }
          />

          <SliderAndNumberControl
            label="Contrast"
            value={
              background.contrast
            }
            min={0}
            max={200}
            step={1}
            suffix="%"
            onChange={(value) =>
              updateBackground(
                "contrast",
                value,
              )
            }
          />

          <SliderAndNumberControl
            label="Saturation"
            value={
              background.saturation
            }
            min={0}
            max={200}
            step={1}
            suffix="%"
            onChange={(value) =>
              updateBackground(
                "saturation",
                value,
              )
            }
          />

          <SliderAndNumberControl
            label="Hue"
            value={
              background.hue
            }
            min={-180}
            max={180}
            step={1}
            suffix="°"
            onChange={(value) =>
              updateBackground(
                "hue",
                value,
              )
            }
          />

          <SliderAndNumberControl
            label="Warmth"
            value={
              background.sepia
            }
            min={0}
            max={100}
            step={1}
            suffix="%"
            onChange={(value) =>
              updateBackground(
                "sepia",
                value,
              )
            }
          />

          <SliderAndNumberControl
            label="Blur"
            value={
              background.blur
            }
            min={0}
            max={40}
            step={1}
            suffix="px"
            onChange={(value) =>
              updateBackground(
                "blur",
                value,
              )
            }
          />
        </div>
      </InspectorSection>

      <InspectorSection title="Overlay">
        <div className="space-y-4">
          <Toggle
            label="Enable Overlay"
            value={
              background.overlayEnabled
            }
            setValue={(value) =>
              updateBackground(
                "overlayEnabled",
                value,
              )
            }
          />

          <ColorControl
            label="Color"
            value={
              background.overlayColor
            }
            onChange={(value) =>
              updateBackground(
                "overlayColor",
                value,
              )
            }
          />

          <SliderAndNumberControl
            label="Opacity"
            value={
              background.overlayOpacity
            }
            min={0}
            max={1}
            step={0.01}
            suffix=""
            onChange={(value) =>
              updateBackground(
                "overlayOpacity",
                value,
              )
            }
          />
        </div>
      </InspectorSection>

      <InspectorSection title="Animation">
        <div className="space-y-5">
          <SelectControl
            label="Animation"
            value={
              background.animation
            }
            options={backgroundAnimationOptions.map(
              (value) => ({
                value,

                label:
                  formatOption(
                    value,
                  ),
              }),
            )}
            onChange={(value) =>
              updateBackground(
                "animation",
                value,
              )
            }
          />

          <SliderAndNumberControl
            label="Duration"
            value={
              background.animationDuration
            }
            min={1}
            max={60}
            step={1}
            suffix="s"
            onChange={(value) =>
              updateBackground(
                "animationDuration",
                value,
              )
            }
          />

          <SliderAndNumberControl
            label="Intensity"
            value={
              background.animationIntensity
            }
            min={0.1}
            max={3}
            step={0.1}
            suffix="×"
            onChange={(value) =>
              updateBackground(
                "animationIntensity",
                value,
              )
            }
          />
        </div>
      </InspectorSection>

      <InspectorSection title="Canvas Size">
        <div className="grid grid-cols-2 gap-3">
          <NumberControl
            label="Width"
            value={
              canvas.width
            }
            suffix="px"
            step={1}
            onChange={(value) =>
              setCanvas(
                (current) => ({
                  ...current,

                  width:
                    Math.max(
                      100,
                      value,
                    ),

                  preset:
                    "custom",
                }),
              )
            }
          />

          <NumberControl
            label="Height"
            value={
              canvas.height
            }
            suffix="px"
            step={1}
            onChange={(value) =>
              setCanvas(
                (current) => ({
                  ...current,

                  height:
                    Math.max(
                      100,
                      value,
                    ),

                  preset:
                    "custom",
                }),
              )
            }
          />
        </div>
      </InspectorSection>
    </div>
  );
}

/* =========================================================
   SNAP / GEOMETRY / GUIDES
   ========================================================= */

function AutoSnapContent({
  snapSettings,
  setSnapSettings,
}) {
  return (
    <div className="space-y-5">
      <button
        onClick={() =>
          setSnapSettings(
            (current) => ({
              ...current,

              enabled:
                !current.enabled,
            }),
          )
        }
        className={`flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 font-semibold ${
          snapSettings.enabled
            ? "border-[#D4AF37] bg-[#D4AF37] text-black"
            : "border-white/10 bg-white/[0.04] text-slate-300"
        }`}
      >
        <Magnet className="h-4 w-4" />

        {snapSettings.enabled
          ? "Auto Snap On"
          : "Auto Snap Off"}
      </button>

      <SliderAndNumberControl
        label="Snap Threshold"
        value={
          snapSettings.threshold
        }
        min={0.2}
        max={5}
        step={0.1}
        suffix="%"
        onChange={(value) =>
          setSnapSettings(
            (current) => ({
              ...current,

              threshold:
                value,
            }),
          )
        }
      />

      <SliderAndNumberControl
        label="Snap Release"
        value={
          snapSettings.releaseThreshold
        }
        min={0.5}
        max={8}
        step={0.1}
        suffix="%"
        onChange={(value) =>
          setSnapSettings(
            (current) => ({
              ...current,

              releaseThreshold:
                value,
            }),
          )
        }
      />

      <SliderAndNumberControl
        label="Grid Spacing"
        value={
          snapSettings.gridSize
        }
        min={1}
        max={20}
        step={1}
        suffix="%"
        onChange={(value) =>
          setSnapSettings(
            (current) => ({
              ...current,

              gridSize:
                value,
            }),
          )
        }
      />
    </div>
  );
}

function GeometryContent({
  geometry,
  setGeometry,
}) {
  return (
    <div className="space-y-5">
      <SliderAndNumberControl
        label="Core Ring Radius"
        value={
          geometry.ringRadius
        }
        min={5}
        max={40}
        step={0.1}
        suffix="%"
        onChange={(value) =>
          setGeometry(
            (current) => ({
              ...current,

              ringRadius:
                value,
            }),
          )
        }
      />

      <SliderAndNumberControl
        label="Node Radius"
        value={
          geometry.nodeRadiusPx
        }
        min={5}
        max={80}
        step={1}
        suffix="px"
        onChange={(value) =>
          setGeometry(
            (current) => ({
              ...current,

              nodeRadiusPx:
                value,
            }),
          )
        }
      />
    </div>
  );
}

function GuidesContent({
  showGrid,
  setShowGrid,
  showThirds,
  setShowThirds,
  showCrosshair,
  setShowCrosshair,
  showSafeArea,
  setShowSafeArea,
  showRingGuide,
  setShowRingGuide,
  canvas,
  setCanvas,
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <Toggle
        label="Grid"
        value={
          showGrid
        }
        setValue={
          setShowGrid
        }
      />

      <Toggle
        label="Thirds"
        value={
          showThirds
        }
        setValue={
          setShowThirds
        }
      />

      <Toggle
        label="Crosshair"
        value={
          showCrosshair
        }
        setValue={
          setShowCrosshair
        }
      />

      <Toggle
        label="Safe Area"
        value={
          showSafeArea
        }
        setValue={
          setShowSafeArea
        }
      />

      <Toggle
        label="Ring Guide"
        value={
          showRingGuide
        }
        setValue={
          setShowRingGuide
        }
      />

      <Toggle
        label="Clip Content"
        value={
          canvas.clipContent
        }
        setValue={(value) =>
          setCanvas(
            (current) => ({
              ...current,

              clipContent:
                value,
            }),
          )
        }
      />
    </div>
  );
}

/* =========================================================
   VIEWPORT / TOOLBAR
   ========================================================= */

function ViewportToolbar({
  canvas,
  setViewportPreset,
  swapOrientation,
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-2">
      <ViewportButton
        active={
          canvas.preset ===
          "desktop"
        }
        icon={Monitor}
        label="Desktop"
        onClick={() =>
          setViewportPreset(
            "desktop",
          )
        }
      />

      <ViewportButton
        active={
          canvas.preset ===
          "laptop"
        }
        icon={Monitor}
        label="Laptop"
        onClick={() =>
          setViewportPreset(
            "laptop",
          )
        }
      />

      <ViewportButton
        active={
          canvas.preset ===
          "tablet"
        }
        icon={Tablet}
        label="Tablet"
        onClick={() =>
          setViewportPreset(
            "tablet",
          )
        }
      />

      <ViewportButton
        active={
          canvas.preset ===
          "mobile"
        }
        icon={Smartphone}
        label="Mobile"
        onClick={() =>
          setViewportPreset(
            "mobile",
          )
        }
      />

      <ViewportButton
        active={
          canvas.preset ===
          "square"
        }
        icon={Maximize2}
        label="Square"
        onClick={() =>
          setViewportPreset(
            "square",
          )
        }
      />

      <button
        type="button"
        onClick={
          swapOrientation
        }
        className="rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm font-semibold text-slate-300"
      >
        Rotate Canvas
      </button>
    </div>
  );
}

function ViewportButton({
  active,
  icon: Icon,
  label,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold ${
        active
          ? "border-[#D4AF37] bg-[#D4AF37] text-black"
          : "border-white/10 bg-black/20 text-slate-300"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function Toolbar({
  activeTool,
  setActiveTool,
  onUpload,
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.035] p-2">
      <ToolButton
        active={
          activeTool ===
          "select"
        }
        onClick={() =>
          setActiveTool(
            "select",
          )
        }
        icon={
          MousePointer2
        }
        label="Select"
      />

      <ToolButton
        active={
          activeTool ===
          "line"
        }
        onClick={() =>
          setActiveTool(
            "line",
          )
        }
        icon={Minus}
        label="Line"
      />

      <button
        type="button"
        onClick={
          onUpload
        }
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm font-semibold text-slate-300"
      >
        <ImagePlus className="h-4 w-4" />
        Upload Image
      </button>
    </div>
  );
}

function ToolButton({
  active,
  onClick,
  icon: Icon,
  label,
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold ${
        active
          ? "border-[#D4AF37] bg-[#D4AF37] text-black"
          : "border-white/10 bg-black/20 text-slate-300"
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

/* =========================================================
   TRANSFORM / LINE / RENDERING
   ========================================================= */

function TransformItem({
  object,
  selected,
  activeTool,
  editorMode,
  zIndex,
  baseWidthPx,
  baseHeightPx,
  baseWidthPercent,
  baseHeightPercent,
  transformPadding,
  onMove,
  onScale,
  onRotate,
  onSelect,
  children,
}) {
  const width =
    baseWidthPercent
      ? `calc(${baseWidthPercent}% * ${object.scale})`
      : `${baseWidthPx * object.scale}px`;

  const height =
    baseHeightPercent
      ? `calc(${baseHeightPercent}% * ${object.scale})`
      : `${baseHeightPx * object.scale}px`;

  return (
    <div
      className={
        behaviorClass(
          object.behavior,
        )
      }
      style={{
        position:
          "absolute",

        left:
          `${object.x}%`,

        top:
          `${object.y}%`,

        width,
        height,

        opacity:
          object.opacity,

        zIndex,

        transform:
          `translate(-50%, -50%) rotate(${object.rotation}deg)`,
      }}
    >
      <div className="pointer-events-none absolute inset-0">
        {children}
      </div>

      {editorMode ===
        "edit" &&
        activeTool ===
          "select" && (
          <div
            onPointerDown={(event) => {
              onSelect(
                object.id,
              );

              onMove(
                object.id,
                event,
              );
            }}
            className={`absolute ${
              object.locked
                ? "cursor-not-allowed"
                : "cursor-grab active:cursor-grabbing"
            }`}
            style={{
              inset:
                `-${transformPadding}px`,
            }}
          >
            <div
              className={`pointer-events-none absolute inset-0 rounded-lg border ${
                selected
                  ? "border-[#D4AF37]"
                  : "border-transparent"
              }`}
            />

            {selected &&
              !object.locked && (
                <>
                  <ScaleHandle
                    className="-left-2 -top-2 cursor-nwse-resize"
                    onPointerDown={(event) =>
                      onScale(
                        object.id,
                        event,
                      )
                    }
                  />

                  <ScaleHandle
                    className="-right-2 -top-2 cursor-nesw-resize"
                    onPointerDown={(event) =>
                      onScale(
                        object.id,
                        event,
                      )
                    }
                  />

                  <ScaleHandle
                    className="-bottom-2 -left-2 cursor-nesw-resize"
                    onPointerDown={(event) =>
                      onScale(
                        object.id,
                        event,
                      )
                    }
                  />

                  <ScaleHandle
                    className="-bottom-2 -right-2 cursor-nwse-resize"
                    onPointerDown={(event) =>
                      onScale(
                        object.id,
                        event,
                      )
                    }
                  />

                  <div className="pointer-events-none absolute -top-10 left-1/2 h-8 w-px -translate-x-1/2 bg-[#D4AF37]" />

                  <button
                    type="button"
                    onPointerDown={(event) =>
                      onRotate(
                        object.id,
                        event,
                      )
                    }
                    className="absolute -top-14 left-1/2 h-5 w-5 -translate-x-1/2 rounded-full border-2 border-[#05070D] bg-[#D4AF37]"
                  />
                </>
              )}
          </div>
        )}
    </div>
  );
}

function ScaleHandle({
  className,
  onPointerDown,
}) {
  return (
    <button
      type="button"
      onPointerDown={
        onPointerDown
      }
      className={`absolute h-4 w-4 rounded-[4px] border-2 border-[#05070D] bg-[#D4AF37] ${className}`}
    />
  );
}

function EditableLine({
  line,
  rendered,
  selected,
  zIndex,
  editorMode,
  onSelect,
  onMove,
  onEndpointMove,
}) {
  const gradientId =
    `gradient-${line.id}`;

  return (
    <svg
      style={{
        pointerEvents:
          "none",

        position:
          "absolute",

        inset: 0,

        width:
          "100%",

        height:
          "100%",

        zIndex,

        opacity:
          line.opacity,
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient
          id={
            gradientId
          }
          gradientUnits="userSpaceOnUse"
          x1={
            rendered.x1
          }
          y1={
            rendered.y1
          }
          x2={
            rendered.x2
          }
          y2={
            rendered.y2
          }
        >
          <stop
            offset="0%"
            stopColor={
              line.startColor
            }
          />

          <stop
            offset="100%"
            stopColor={
              line.endColor
            }
          />
        </linearGradient>
      </defs>

      <line
        x1={
          rendered.x1
        }
        y1={
          rendered.y1
        }
        x2={
          rendered.x2
        }
        y2={
          rendered.y2
        }
        stroke={`url(#${gradientId})`}
        strokeWidth={
          Math.max(
            0.18,
            line.width /
              8,
          )
        }
      />

      {editorMode ===
        "edit" && (
        <line
          x1={
            rendered.x1
          }
          y1={
            rendered.y1
          }
          x2={
            rendered.x2
          }
          y2={
            rendered.y2
          }
          stroke={
            selected
              ? "#D4AF37"
              : "transparent"
          }
          strokeWidth="3"
          className="pointer-events-auto cursor-move"
          onPointerDown={(event) => {
            onSelect(
              line.id,
            );

            onMove(
              line.id,
              event,
            );
          }}
        />
      )}

      {editorMode ===
        "edit" &&
        selected &&
        !line.locked && (
          <>
            <circle
              cx={
                rendered.x1
              }
              cy={
                rendered.y1
              }
              r="1.2"
              fill="#D4AF37"
              className="pointer-events-auto cursor-crosshair"
              onPointerDown={(event) =>
                onEndpointMove(
                  line.id,
                  "start",
                  event,
                )
              }
            />

            <circle
              cx={
                rendered.x2
              }
              cy={
                rendered.y2
              }
              r="1.2"
              fill="#D4AF37"
              className="pointer-events-auto cursor-crosshair"
              onPointerDown={(event) =>
                onEndpointMove(
                  line.id,
                  "end",
                  event,
                )
              }
            />
          </>
        )}
    </svg>
  );
}

function HeroCore() {
  return (
    <div className="relative flex h-full w-full items-center justify-center">
      <Image
        src="/logo-emblem.png"
        alt="Lazarus emblem"
        fill
        sizes="(max-width: 768px) 70vw, 520px"
        priority
        draggable={
          false
        }
        className="object-contain"
      />
    </div>
  );
}

function HeroNode({
  node,
}) {
  if (!node) {
    return null;
  }

  const Icon =
    node.Icon;

  return (
    <div className="relative h-full w-full">
      <div className="flex h-full w-full items-center justify-center rounded-full border border-[#D4AF37]/30 bg-black/35 text-[#D4AF37]">
        <Icon
          className="h-[44%] w-[44%]"
          strokeWidth={
            1.7
          }
        />
      </div>
    </div>
  );
}

function UploadedImage({
  object,
  assets,
}) {
  const src =
    resolveEditorAssetSource(
      assets,
      object.assetId,
      object.src,
    );

  if (!src) {
    return (
      <div className="flex h-full w-full items-center justify-center rounded-xl border border-dashed border-white/20 bg-black/20 px-4 text-center text-xs text-slate-500">
        Missing image asset
      </div>
    );
  }

  return (
    <img
      src={
        src
      }
      alt={
        object.name
      }
      draggable={
        false
      }
      className="h-full w-full object-contain"
    />
  );
}

function AttachedImage({
  object,
  assets,
}) {
  const attachment =
    object.attachedImage;

  if (!attachment) {
    return null;
  }

  const src =
    resolveEditorAssetSource(
      assets,
      attachment.assetId,
      attachment.src,
    );

  if (!src) {
    return null;
  }

  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <img
        src={
          src
        }
        alt={
          attachment.name
        }
        draggable={
          false
        }
        className="h-full w-full object-contain"
      />
    </div>
  );
}

/* =========================================================
   CONTROLS / HELPERS
   ========================================================= */

function LineLengthControl({
  line,
  setLines,
}) {
  const length =
    distanceBetween(
      line.x1,
      line.y1,
      line.x2,
      line.y2,
    );

  function setLength(
    nextLength,
  ) {
    const centerX =
      (line.x1 +
        line.x2) /
      2;

    const centerY =
      (line.y1 +
        line.y2) /
      2;

    const angle =
      Math.atan2(
        line.y2 -
          line.y1,

        line.x2 -
          line.x1,
      );

    const half =
      nextLength /
      2;

    setLines(
      (current) => ({
        ...current,

        [line.id]: {
          ...current[
            line.id
          ],

          x1:
            centerX -
            Math.cos(
              angle,
            ) *
              half,

          y1:
            centerY -
            Math.sin(
              angle,
            ) *
              half,

          x2:
            centerX +
            Math.cos(
              angle,
            ) *
              half,

          y2:
            centerY +
            Math.sin(
              angle,
            ) *
              half,
        },
      }),
    );
  }

  return (
    <SliderAndNumberControl
      label="Length"
      value={
        Number(
          length.toFixed(
            2,
          ),
        )
      }
      min={1}
      max={140}
      step={0.1}
      suffix="%"
      onChange={
        setLength
      }
    />
  );
}

function LineRotationControl({
  line,
  setLines,
}) {
  const rotation =
    lineAngle(
      line,
    );

  function setRotation(
    value,
  ) {
    const centerX =
      (line.x1 +
        line.x2) /
      2;

    const centerY =
      (line.y1 +
        line.y2) /
      2;

    const length =
      distanceBetween(
        line.x1,
        line.y1,
        line.x2,
        line.y2,
      );

    const radians =
      (value *
        Math.PI) /
      180;

    const dx =
      (Math.cos(
        radians,
      ) *
        length) /
      2;

    const dy =
      (Math.sin(
        radians,
      ) *
        length) /
      2;

    setLines(
      (current) => ({
        ...current,

        [line.id]: {
          ...current[
            line.id
          ],

          x1:
            centerX -
            dx,

          y1:
            centerY -
            dy,

          x2:
            centerX +
            dx,

          y2:
            centerY +
            dy,
        },
      }),
    );
  }

  return (
    <SliderAndNumberControl
      label="Rotation"
      value={
        rotation
      }
      min={-180}
      max={180}
      step={1}
      suffix="°"
      onChange={
        setRotation
      }
    />
  );
}

function InspectorSection({
  title,
  children,
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
        {title}
      </h3>

      {children}
    </div>
  );
}

function SelectControl({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </span>

      <select
        value={
          value
        }
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white"
      >
        {options.map(
          (option) => (
            <option
              key={
                option.value
              }
              value={
                option.value
              }
            >
              {
                option.label
              }
            </option>
          ),
        )}
      </select>
    </label>
  );
}

function PositionGrid({
  x,
  y,
  onChange,
}) {
  const positions = [
    [0, 0],
    [50, 0],
    [100, 0],

    [0, 50],
    [50, 50],
    [100, 50],

    [0, 100],
    [50, 100],
    [100, 100],
  ];

  return (
    <div className="grid w-36 grid-cols-3 gap-2">
      {positions.map(
        ([px, py]) => (
          <button
            key={`${px}-${py}`}
            type="button"
            onClick={() =>
              onChange(
                px,
                py,
              )
            }
            className={`aspect-square rounded-lg border ${
              x === px &&
              y === py
                ? "border-[#D4AF37] bg-[#D4AF37]"
                : "border-white/10 bg-black/30"
            }`}
          />
        ),
      )}
    </div>
  );
}

function BehaviorControl({
  value,
  onChange,
}) {
  return (
    <SelectControl
      label="Behavior"
      value={
        value
      }
      options={behaviorOptions.map(
        (behavior) => ({
          value:
            behavior,

          label:
            formatOption(
              behavior,
            ),
        }),
      )}
      onChange={
        onChange
      }
    />
  );
}

function SliderAndNumberControl({
  label,
  value,
  min,
  max,
  step,
  suffix,
  onChange,
}) {
  return (
    <div>
      <div className="mb-3 flex justify-between gap-4">
        <span className="text-sm text-slate-300">
          {label}
        </span>

        <input
          type="number"
          value={
            value
          }
          min={
            min
          }
          max={
            max
          }
          step={
            step
          }
          onChange={(event) =>
            onChange(
              Number(
                event.target.value,
              ),
            )
          }
          className="w-24 rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-right text-sm"
        />
      </div>

      <input
        type="range"
        value={
          value
        }
        min={
          min
        }
        max={
          max
        }
        step={
          step
        }
        onChange={(event) =>
          onChange(
            Number(
              event.target.value,
            ),
          )
        }
        className="w-full accent-[#D4AF37]"
      />
    </div>
  );
}

function NumberControl({
  label,
  value,
  suffix,
  step,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-slate-500">
        {label}
      </span>

      <input
        type="number"
        value={
          value
        }
        step={
          step
        }
        onChange={(event) =>
          onChange(
            Number(
              event.target.value,
            ),
          )
        }
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
      />
    </label>
  );
}

function TextControl({
  label,
  value,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs text-slate-500">
        {label}
      </span>

      <input
        type="text"
        value={
          value
        }
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm"
      />
    </label>
  );
}

function ColorControl({
  label,
  value,
  onChange,
}) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 p-3">
      <span className="text-sm text-slate-300">
        {label}
      </span>

      <input
        type="color"
        value={
          value
        }
        onChange={(event) =>
          onChange(
            event.target.value,
          )
        }
      />
    </label>
  );
}

function Toggle({
  label,
  value,
  setValue,
}) {
  return (
    <button
      type="button"
      onClick={() =>
        setValue(
          !value,
        )
      }
      className={`rounded-xl border px-3 py-2.5 text-sm ${
        value
          ? "bg-[#D4AF37] text-black"
          : "border-white/10 bg-white/[0.04] text-slate-300"
      }`}
    >
      {label}
    </button>
  );
}

/* =========================================================
   GUIDES
   ========================================================= */

function SnapGuides({
  snapGuide,
}) {
  return (
    <>
      {snapGuide.x !==
        null && (
        <div
          className="pointer-events-none absolute top-0 z-[1000] h-full w-px bg-[#D4AF37]"
          style={{
            left:
              `${snapGuide.x}%`,
          }}
        />
      )}

      {snapGuide.y !==
        null && (
        <div
          className="pointer-events-none absolute left-0 z-[1000] h-px w-full bg-[#D4AF37]"
          style={{
            top:
              `${snapGuide.y}%`,
          }}
        />
      )}
    </>
  );
}

function RingGuide({
  core,
  ringRadius,
}) {
  return (
    <svg className="pointer-events-none absolute inset-0 z-[3] h-full w-full">
      <circle
        cx={`${core.x}%`}
        cy={`${core.y}%`}
        r={`${ringRadius}%`}
        fill="none"
        stroke="#8B5CF6"
        strokeDasharray="5 5"
      />
    </svg>
  );
}

function Grid({
  gridSize,
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[3] opacity-10"
      style={{
        backgroundImage:
          "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",

        backgroundSize:
          `${gridSize}% ${gridSize}%`,
      }}
    />
  );
}

function Thirds() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[4]">
      <div className="absolute left-1/3 h-full w-px bg-[#D4AF37]/40" />
      <div className="absolute left-2/3 h-full w-px bg-[#D4AF37]/40" />
      <div className="absolute top-1/3 h-px w-full bg-[#D4AF37]/40" />
      <div className="absolute top-2/3 h-px w-full bg-[#D4AF37]/40" />
    </div>
  );
}

function Crosshair() {
  return (
    <div className="pointer-events-none absolute inset-0 z-[4]">
      <div className="absolute left-1/2 h-full w-px bg-purple-400/40" />
      <div className="absolute top-1/2 h-px w-full bg-purple-400/40" />
    </div>
  );
}

function SafeArea() {
  return (
    <div className="pointer-events-none absolute inset-[5%] z-[4] border border-dashed border-white/20" />
  );
}

/* =========================================================
   BACKGROUND STYLE
   ========================================================= */

function buildBackgroundStyle(
  background,
  assets,
) {
  if (
    background.type ===
    "solid"
  ) {
    return {
      backgroundColor:
        background.solidColor,
    };
  }

  if (
    background.type ===
    "gradient"
  ) {
    return {
      background:
        `linear-gradient(${background.gradientAngle}deg, ${background.gradientStart}, ${background.gradientEnd})`,
    };
  }

  if (
    background.type ===
    "image"
  ) {
    const src =
      resolveEditorAssetSource(
        assets,
        background.assetId,
        background.imageSrc,
      );

    if (src) {
      return {
        backgroundImage:
          `url("${src}")`,

        backgroundSize:
          background.imageFit ===
          "fill"
            ? "100% 100%"
            : background.imageFit,

        backgroundPosition:
          `${background.imagePositionX}% ${background.imagePositionY}%`,

        backgroundRepeat:
          background.repeat ||
          "no-repeat",

        opacity:
          background.imageOpacity,

        filter:
          `blur(${background.blur}px) brightness(${background.brightness}%) contrast(${background.contrast}%) saturate(${background.saturation}%) grayscale(${background.grayscale}%) sepia(${background.sepia}%) hue-rotate(${background.hue}deg)`,

        transform:
          `scale(${background.imageScale}) rotate(${background.imageRotation}deg)`,
      };
    }
  }

  return {};
}

function getBackgroundAnimationClass(
  animation,
) {
  switch (
    animation
  ) {
    case "slow-zoom":
      return "lazarus-bg-slow-zoom";

    case "pan-horizontal":
      return "lazarus-bg-pan-horizontal";

    case "pan-vertical":
      return "lazarus-bg-pan-vertical";

    case "drift":
      return "lazarus-bg-drift";

    case "pulse":
      return "lazarus-bg-pulse";

    case "hue-shift":
      return "lazarus-bg-hue-shift";

    default:
      return "";
  }
}

/* =========================================================
   MATH
   ========================================================= */

function applyMagneticSnapping({
  x,
  y,
  dragging,
  objects,
  settings,
}) {
  let snapX =
    null;

  let snapY =
    null;

  if (
    Math.abs(
      x -
        50,
    ) <
    settings.threshold
  ) {
    x = 50;
    snapX = 50;
  }

  if (
    Math.abs(
      y -
        50,
    ) <
    settings.threshold
  ) {
    y = 50;
    snapY = 50;
  }

  return {
    x,
    y,
    snapX,
    snapY,
  };
}

function snapLineAngle({
  x1,
  y1,
  x2,
  y2,
}) {
  const dx =
    x2 -
    x1;

  const dy =
    y2 -
    y1;

  const length =
    Math.sqrt(
      dx * dx +
        dy * dy,
    );

  const angle =
    Math.atan2(
      dy,
      dx,
    );

  const snapped =
    Math.round(
      angle /
        (Math.PI /
          4),
    ) *
    (Math.PI /
      4);

  return {
    x2:
      x1 +
      Math.cos(
        snapped,
      ) *
        length,

    y2:
      y1 +
      Math.sin(
        snapped,
      ) *
        length,
  };
}

function lineAngle(
  line,
) {
  return (
    Math.atan2(
      line.y2 -
        line.y1,

      line.x2 -
        line.x1,
    ) *
    (180 /
      Math.PI)
  );
}

function angleFromCenter(
  x,
  y,
  cx,
  cy,
) {
  return (
    Math.atan2(
      y -
        cy,

      x -
        cx,
    ) *
    (180 /
      Math.PI)
  );
}

function normalizeAngle(
  angle,
) {
  let value =
    angle;

  while (
    value >
    180
  ) {
    value -=
      360;
  }

  while (
    value <
    -180
  ) {
    value +=
      360;
  }

  return value;
}

function distanceBetween(
  x1,
  y1,
  x2,
  y2,
) {
  return Math.sqrt(
    (x2 -
      x1) **
      2 +
      (y2 -
        y1) **
        2,
  );
}

function resolveEditorAssetSource(
  assets,
  assetId,
  legacySrc,
) {
  if (
    assetId &&
    assets?.[assetId]
      ?.dataUrl
  ) {
    return assets[assetId]
      .dataUrl;
  }

  if (
    typeof legacySrc ===
      "string" &&
    legacySrc
  ) {
    return legacySrc;
  }

  return null;
}

function buildRenderableLines(
  lines,
) {
  return Object.values(
    lines,
  );
}

function countCustomLines(
  lines,
) {
  return Object.keys(
    lines,
  ).length;
}

function serializeObjects(
  objects,
) {
  return objects;
}

function serializeCanvas(
  canvas,
) {
  return canvas;
}

function behaviorClass(
  behavior,
) {
  return behavior ===
    "none"
    ? ""
    : `lazarus-editor-${behavior}`;
}

function formatOption(
  value,
) {
  return value
    .split("-")
    .map(
      (word) =>
        word
          .charAt(0)
          .toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function clamp(
  value,
  min,
  max,
) {
  return Math.min(
    Math.max(
      value,
      min,
    ),
    max,
  );
}
