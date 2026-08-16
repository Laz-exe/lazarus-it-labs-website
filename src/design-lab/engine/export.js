import JSZip from "jszip";

import {
  downloadBlob,
  downloadTextFile,
} from "./document";

import {
  dataUrlToBase64,
  getAssetFilename,
  normalizeAssetRegistry,
} from "./assets";

/* =========================================================
   SINGLE HTML EXPORT
   ========================================================= */

export function exportStaticWebsite(
  document,
) {
  const html =
    generateHtml(
      document,
      {
        assetMode:
          "embedded",
      },
    );

  const filename =
    `${slugify(
      document.metadata?.name ||
        "lazarus-site",
    )}.html`;

  downloadTextFile({
    filename,

    contents:
      html,

    mimeType:
      "text/html;charset=utf-8",
  });
}

/* =========================================================
   MULTI-FILE ZIP EXPORT
   ========================================================= */

export async function exportStaticProjectZip(
  document,
) {
  const zip =
    new JSZip();

  const projectName =
    slugify(
      document.metadata?.name ||
        "lazarus-site",
    );

  const assets =
    normalizeAssetRegistry(
      document.assets,
    );

  const assetPaths =
    buildAssetPathMap(
      assets,
    );

  const html =
    generateHtml(
      document,
      {
        assetMode:
          "files",

        assetPaths,
      },
    );

  const css =
    generateBaseCss(
      document,

      {
        assetMode:
          "files",

        assetPaths,
      },
    );

  zip.file(
    "index.html",
    generateMultiFileHtml(
      document,
    ),
  );

  zip
    .folder("css")
    .file(
      "styles.css",
      css,
    );

  zip
    .folder("js")
    .file(
      "animations.js",
      generateJavascript(),
    );

  const assetsFolder =
    zip.folder(
      "assets",
    );

  Object.values(
    assets,
  ).forEach(
    (asset) => {
      if (
        !asset?.dataUrl
      ) {
        return;
      }

      const filename =
        assetPaths[
          asset.id
        ];

      const base64 =
        dataUrlToBase64(
          asset.dataUrl,
        );

      assetsFolder.file(
        filename.replace(
          /^assets\//,
          "",
        ),

        base64,

        {
          base64:
            true,
        },
      );
    },
  );

  zip.file(
    "lazarus-project.json",
    JSON.stringify(
      {
        name:
          document.metadata?.name,

        exportedAt:
          new Date().toISOString(),

        sourceFormat:
          document.format,

        sourceVersion:
          document.version,
      },
      null,
      2,
    ),
  );

  const blob =
    await zip.generateAsync({
      type:
        "blob",

      compression:
        "DEFLATE",

      compressionOptions: {
        level:
          6,
      },
    });

  downloadBlob({
    filename:
      `${projectName}.zip`,

    blob,
  });
}

/* =========================================================
   HTML GENERATION
   ========================================================= */

export function generateHtml(
  document,
  options = {},
) {
  const {
    canvas,
    objects,
    lines,
    layerOrder,
  } = document;

  const orderedItems =
    layerOrder
      .map(
        (id) =>
          objects[id] ??
          lines[id],
      )
      .filter(Boolean)
      .reverse();

  const sceneHtml =
    orderedItems
      .map(
        (item) => {
          if (
            item.visible ===
            false
          ) {
            return "";
          }

          if (
            item.type ===
            "line"
          ) {
            return generateLineHtml(
              item,
            );
          }

          return generateObjectHtml(
            document,
            item,
            options,
          );
        },
      )
      .join("\n");

  const title =
    escapeHtml(
      document.metadata?.name ||
        "Lazarus Project",
    );

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${title}</title>

  <style>
${generateBaseCss(
  document,
  options,
)}
  </style>
</head>

<body>
  <main class="lazarus-page">
    <section class="lazarus-canvas">

${generateBackgroundHtml(
  document,
  options,
)}

      <div class="lazarus-scene">
${sceneHtml}
      </div>

    </section>
  </main>
</body>
</html>`;
}

function generateMultiFileHtml(
  document,
) {
  const {
    objects,
    lines,
    layerOrder,
  } = document;

  const assetPaths =
    buildAssetPathMap(
      normalizeAssetRegistry(
        document.assets,
      ),
    );

  const sceneHtml =
    layerOrder
      .map(
        (id) =>
          objects[id] ??
          lines[id],
      )
      .filter(Boolean)
      .reverse()
      .map(
        (item) => {
          if (
            item.visible ===
            false
          ) {
            return "";
          }

          if (
            item.type ===
            "line"
          ) {
            return generateLineHtml(
              item,
            );
          }

          return generateObjectHtml(
            document,
            item,

            {
              assetMode:
                "files",

              assetPaths,
            },
          );
        },
      )
      .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />

  <title>${escapeHtml(
    document.metadata?.name ||
      "Lazarus Project",
  )}</title>

  <link
    rel="stylesheet"
    href="css/styles.css"
  />
</head>

<body>
  <main class="lazarus-page">
    <section class="lazarus-canvas">

${generateBackgroundHtml(
  document,

  {
    assetMode:
      "files",

    assetPaths,
  },
)}

      <div class="lazarus-scene">
${sceneHtml}
      </div>

    </section>
  </main>

  <script src="js/animations.js"></script>
</body>
</html>`;
}

/* =========================================================
   OBJECTS
   ========================================================= */

function generateObjectHtml(
  document,
  object,
  options,
) {
  const classes = [
    "lazarus-object",

    `object-${safeClass(
      object.id,
    )}`,
  ];

  if (
    object.behavior &&
    object.behavior !==
      "none"
  ) {
    classes.push(
      `behavior-${safeClass(
        object.behavior,
      )}`,
    );
  }

  return `        <div
          class="${classes.join(" ")}"
          style="
            left: ${number(object.x)}%;
            top: ${number(object.y)}%;
            opacity: ${number(object.opacity, 1)};
            transform:
              translate(-50%, -50%)
              scale(${number(object.scale, 1)})
              rotate(${number(object.rotation)}deg);
          "
        >
${generateObjectContent(
  document,
  object,
  options,
)}
        </div>`;
}

function generateObjectContent(
  document,
  object,
  options,
) {
  if (
    object.type ===
    "core"
  ) {
    return `          <div class="core-shell">
            <div class="core-emblem">
              LAZARUS
            </div>
          </div>${generateAttachmentHtml(
            document,
            object,
            options,
          )}`;
  }

  if (
    object.type ===
    "node"
  ) {
    return `          <div class="node-shell">
            <div class="node-icon">
              ${escapeHtml(
                iconSymbol(
                  object.icon,
                ),
              )}
            </div>
          </div>

          <div class="node-copy">
            <h3>
              ${escapeHtml(
                object.heading ||
                  object.name,
              )}
            </h3>

            <p>
              ${escapeHtml(
                object.body ||
                  "",
              )}
            </p>
          </div>${generateAttachmentHtml(
            document,
            object,
            options,
          )}`;
  }

  if (
    object.type ===
    "image"
  ) {
    const src =
      resolveAssetSource({
        document,

        assetId:
          object.assetId,

        legacySrc:
          object.src,

        options,
      });

    if (src) {
      return `          <img
            class="scene-image"
            src="${escapeAttribute(
              src,
            )}"
            alt="${escapeAttribute(
              object.name ||
                "",
            )}"
          />${generateAttachmentHtml(
            document,
            object,
            options,
          )}`;
    }
  }

  return `          <div class="generic-object">
            ${escapeHtml(
              object.name ||
                object.type ||
                "Object",
            )}
          </div>${generateAttachmentHtml(
            document,
            object,
            options,
          )}`;
}

function generateAttachmentHtml(
  document,
  object,
  options,
) {
  const attachment =
    object.attachedImage;

  if (
    !attachment
  ) {
    return "";
  }

  const src =
    resolveAssetSource({
      document,

      assetId:
        attachment.assetId,

      legacySrc:
        attachment.src,

      options,
    });

  if (!src) {
    return "";
  }

  return `

          <img
            class="attached-image"
            src="${escapeAttribute(
              src,
            )}"
            alt="${escapeAttribute(
              attachment.name ||
                "",
            )}"
          />`;
}

/* =========================================================
   LINES
   ========================================================= */

function generateLineHtml(
  line,
) {
  const dx =
    line.x2 -
    line.x1;

  const dy =
    line.y2 -
    line.y1;

  const length =
    Math.sqrt(
      dx * dx +
        dy * dy,
    );

  const angle =
    Math.atan2(
      dy,
      dx,
    ) *
    (180 / Math.PI);

  return `        <div
          class="lazarus-line"
          style="
            left: ${number(line.x1)}%;
            top: ${number(line.y1)}%;
            width: ${number(length)}%;
            height: ${number(line.width, 2)}px;
            opacity: ${number(line.opacity, 1)};

            background:
              linear-gradient(
                90deg,
                ${safeCssColor(
                  line.startColor,
                )},
                ${safeCssColor(
                  line.endColor,
                )}
              );

            transform:
              rotate(${number(angle)}deg);

            transform-origin:
              left center;

            ${
              line.glow
                ? `box-shadow: 0 0 8px ${safeCssColor(
                    line.endColor,
                  )};`
                : ""
            }
          "
        ></div>`;
}

/* =========================================================
   BACKGROUND
   ========================================================= */

function generateBackgroundHtml(
  document,
  options,
) {
  const background =
    document.canvas
      .background;

  return `      <div class="page-background"></div>

      ${
        background.overlayEnabled
          ? `<div class="color-overlay"></div>`
          : ""
      }

      ${
        background.gradientOverlayEnabled
          ? `<div class="gradient-overlay"></div>`
          : ""
      }`;
}

export function generateBaseCss(
  document,
  options = {},
) {
  const {
    canvas,
  } = document;

  const background =
    canvas.background;

  const pageBackground =
    generateBackgroundCss(
      document,
      background,
      options,
    );

  return `* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  min-height: 100%;
}

body {
  background: #05070d;

  font-family:
    Inter,
    ui-sans-serif,
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    sans-serif;
}

.lazarus-page {
  min-height: 100vh;

  display: flex;
  justify-content: center;
  align-items: flex-start;

  background: #05070d;
}

.lazarus-canvas {
  position: relative;

  width: min(
    100%,
    ${number(
      canvas.width,
      1440,
    )}px
  );

  aspect-ratio:
    ${number(
      canvas.width,
      1440,
    )}
    /
    ${number(
      canvas.height,
      900,
    )};

  overflow:
    ${
      canvas.clipContent
        ? "hidden"
        : "visible"
    };

  isolation: isolate;
}

.page-background {
  position: absolute;
  inset: 0;

  z-index: 0;

${indent(
  pageBackground,
  2,
)}
}

.color-overlay {
  position: absolute;
  inset: 0;

  z-index: 1;

  background:
    ${safeCssColor(
      background.overlayColor,
      "#000000",
    )};

  opacity:
    ${number(
      background.overlayOpacity,
      0.25,
    )};

  pointer-events: none;
}

.gradient-overlay {
  position: absolute;
  inset: 0;

  z-index: 2;

  background:
    linear-gradient(
      ${number(
        background.gradientOverlayAngle,
        135,
      )}deg,

      ${safeCssColor(
        background.gradientOverlayStart,
        "#000000",
      )},

      ${safeCssColor(
        background.gradientOverlayEnd,
        "#8B5CF6",
      )}
    );

  opacity:
    ${number(
      background.gradientOverlayOpacity,
      0.25,
    )};

  pointer-events: none;
}

.lazarus-scene {
  position: absolute;
  inset: 0;

  z-index: 10;
}

.lazarus-object {
  position: absolute;
  transform-origin: center;
}

.core-shell {
  width: clamp(
    180px,
    28vw,
    420px
  );

  aspect-ratio: 1;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 50%;

  border:
    1px solid
    rgba(
      139,
      92,
      246,
      0.45
    );

  background:
    radial-gradient(
      circle,
      rgba(
        139,
        92,
        246,
        0.22
      ),
      rgba(
        5,
        7,
        13,
        0
      )
      70%
    );
}

.core-emblem {
  width: 70%;

  aspect-ratio: 1;

  border:
    1px solid
    rgba(
      212,
      175,
      55,
      0.35
    );

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #d4af37;

  letter-spacing:
    0.25em;

  font-weight: 700;
}

.node-shell {
  width: 64px;
  height: 64px;

  border-radius: 50%;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #d4af37;

  border:
    1px solid
    rgba(
      212,
      175,
      55,
      0.3
    );

  background:
    rgba(
      0,
      0,
      0,
      0.35
    );

  backdrop-filter:
    blur(14px);
}

.node-icon {
  font-size: 26px;
}

.node-copy {
  position: absolute;

  width: 190px;

  left: 50%;
  top: calc(100% + 12px);

  transform:
    translateX(-50%);

  text-align: center;
}

.node-copy h3 {
  margin: 0;

  color: white;

  font-size: 18px;
  font-weight: 600;
}

.node-copy p {
  margin:
    8px 0 0;

  color: #94a3b8;

  font-size: 14px;
}

.scene-image,
.attached-image {
  display: block;

  max-width: 220px;
  max-height: 220px;

  object-fit: contain;
}

.attached-image {
  position: absolute;

  inset: 0;

  width: 100%;
  height: 100%;
}

.generic-object {
  padding:
    12px 16px;

  color: white;

  border:
    1px solid
    rgba(
      255,
      255,
      255,
      0.12
    );

  background:
    rgba(
      0,
      0,
      0,
      0.4
    );
}

.lazarus-line {
  position: absolute;

  border-radius:
    999px;

  pointer-events:
    none;
}

/* =========================================================
   OBJECT ANIMATIONS
   ========================================================= */

@keyframes lazarus-float {
  0%,
  100% {
    translate: 0 0;
  }

  50% {
    translate: 0 -10px;
  }
}

@keyframes lazarus-pulse {
  0%,
  100% {
    filter:
      brightness(1);
  }

  50% {
    filter:
      brightness(1.35);
  }
}

@keyframes lazarus-breathe {
  0%,
  100% {
    filter:
      brightness(1);
  }

  50% {
    filter:
      brightness(1.18);
  }
}

@keyframes lazarus-spin {
  from {
    rotate: 0deg;
  }

  to {
    rotate: 360deg;
  }
}

@keyframes lazarus-fade {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

@media (
  prefers-reduced-motion:
  no-preference
) {
  .behavior-float {
    animation:
      lazarus-float
      4s
      ease-in-out
      infinite;
  }

  .behavior-pulse {
    animation:
      lazarus-pulse
      2s
      ease-in-out
      infinite;
  }

  .behavior-breathe {
    animation:
      lazarus-breathe
      4s
      ease-in-out
      infinite;
  }

  .behavior-spin {
    animation:
      lazarus-spin
      6s
      linear
      infinite;
  }

  .behavior-fade {
    animation:
      lazarus-fade
      3s
      ease-in-out
      infinite;
  }
}`;
}

/* =========================================================
   BACKGROUND CSS
   ========================================================= */

function generateBackgroundCss(
  document,
  background,
  options,
) {
  const filters = [
    `blur(${number(
      background.blur,
    )}px)`,

    `brightness(${number(
      background.brightness,
      100,
    )}%)`,

    `contrast(${number(
      background.contrast,
      100,
    )}%)`,

    `saturate(${number(
      background.saturation,
      100,
    )}%)`,

    `grayscale(${number(
      background.grayscale,
    )}%)`,

    `sepia(${number(
      background.sepia,
    )}%)`,

    `hue-rotate(${number(
      background.hue,
    )}deg)`,
  ].join(" ");

  if (
    background.type ===
    "solid"
  ) {
    return `background:
  ${safeCssColor(
    background.solidColor,
    "#05070D",
  )};

filter:
  ${filters};`;
  }

  if (
    background.type ===
    "gradient"
  ) {
    return `background:
  linear-gradient(
    ${number(
      background.gradientAngle,
      135,
    )}deg,

    ${safeCssColor(
      background.gradientStart,
      "#05070D",
    )},

    ${safeCssColor(
      background.gradientEnd,
      "#261044",
    )}
  );

filter:
  ${filters};`;
  }

  if (
    background.type ===
    "image"
  ) {
    const src =
      resolveAssetSource({
        document,

        assetId:
          background.assetId,

        legacySrc:
          background.imageSrc,

        options,
      });

    if (src) {
      return `background-image:
  url("${escapeCssUrl(
    src,
  )}");

background-size:
  ${backgroundSize(
    background.imageFit,
  )};

background-position:
  ${number(
    background.imagePositionX,
    50,
  )}%
  ${number(
    background.imagePositionY,
    50,
  )}%;

background-repeat:
  ${safeBackgroundRepeat(
    background.repeat,
  )};

opacity:
  ${number(
    background.imageOpacity,
    1,
  )};

filter:
  ${filters};

transform:
  scale(${number(
    background.imageScale,
    1,
  )})
  rotate(${number(
    background.imageRotation,
  )}deg);`;
    }
  }

  if (
    background.type ===
    "transparent"
  ) {
    return `background:
  transparent;

filter:
  ${filters};`;
  }

  return `background:
  #05070d;

filter:
  ${filters};`;
}

/* =========================================================
   ASSET RESOLUTION
   ========================================================= */

function resolveAssetSource({
  document,
  assetId,
  legacySrc,
  options,
}) {
  if (
    assetId
  ) {
    const asset =
      document.assets?.[
        assetId
      ];

    if (
      asset?.dataUrl
    ) {
      if (
        options.assetMode ===
        "files"
      ) {
        return (
          options.assetPaths?.[
            assetId
          ] ??
          null
        );
      }

      return asset.dataUrl;
    }
  }

  if (
    legacySrc &&
    !legacySrc.startsWith(
      "blob:",
    ) &&
    !legacySrc.startsWith(
      "[local-",
    )
  ) {
    return legacySrc;
  }

  return null;
}

function buildAssetPathMap(
  assets,
) {
  const map = {};

  Object.values(
    assets,
  ).forEach(
    (asset) => {
      map[asset.id] =
        `assets/${getAssetFilename(
          asset,
        )}`;
    },
  );

  return map;
}

/* =========================================================
   EXPORTED JS
   ========================================================= */

function generateJavascript() {
  return `/*
 * Lazarus Design Lab Export
 *
 * Runtime hooks for future interactions and
 * animation behavior can live here.
 */

document.documentElement.classList.add(
  "lazarus-runtime"
);
`;
}

/* =========================================================
   HELPERS
   ========================================================= */

function iconSymbol(icon) {
  switch (icon) {
    case "gauge":
      return "◴";

    case "shield":
      return "◇";

    case "network":
      return "◎";

    default:
      return "•";
  }
}

function backgroundSize(value) {
  switch (value) {
    case "contain":
      return "contain";

    case "fill":
      return "100% 100%";

    case "auto":
      return "auto";

    default:
      return "cover";
  }
}

function safeBackgroundRepeat(
  value,
) {
  const allowed = [
    "repeat",
    "repeat-x",
    "repeat-y",
    "no-repeat",
  ];

  return allowed.includes(
    value,
  )
    ? value
    : "no-repeat";
}

function safeCssColor(
  value,
  fallback = "#ffffff",
) {
  if (
    typeof value !==
    "string"
  ) {
    return fallback;
  }

  if (
    /^#[0-9a-f]{3,8}$/i.test(
      value,
    )
  ) {
    return value;
  }

  return fallback;
}

function number(
  value,
  fallback = 0,
) {
  const parsed =
    Number(value);

  return Number.isFinite(
    parsed,
  )
    ? parsed
    : fallback;
}

function safeClass(value) {
  return String(value)
    .toLowerCase()
    .replace(
      /[^a-z0-9_-]/g,
      "-",
    );
}

function escapeHtml(value) {
  return String(
    value ?? "",
  )
    .replaceAll(
      "&",
      "&amp;",
    )
    .replaceAll(
      "<",
      "&lt;",
    )
    .replaceAll(
      ">",
      "&gt;",
    )
    .replaceAll(
      '"',
      "&quot;",
    )
    .replaceAll(
      "'",
      "&#039;",
    );
}

function escapeAttribute(
  value,
) {
  return escapeHtml(
    value,
  );
}

function escapeCssUrl(value) {
  return String(
    value ?? "",
  )
    .replaceAll(
      "\\",
      "\\\\",
    )
    .replaceAll(
      '"',
      '\\"',
    )
    .replaceAll(
      "\n",
      "",
    );
}

function indent(
  value,
  spaces,
) {
  const padding =
    " ".repeat(
      spaces,
    );

  return String(value)
    .split("\n")
    .map(
      (line) =>
        `${padding}${line}`,
    )
    .join("\n");
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
    "lazarus-site"
  );
}