export interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Adjustments {
  brightness: number;
  contrast: number;
  saturation: number;
  filter: string;
}

function getRadianAngle(degree: number) {
  return (degree * Math.PI) / 180;
}

function getRotationSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  const absCos = Math.abs(Math.cos(rotRad));
  const absSin = Math.abs(Math.sin(rotRad));
  return {
    width: width * absCos + height * absSin,
    height: width * absSin + height * absCos,
  };
}

function buildFilterString(adj: Adjustments): string {
  const b = 1 + adj.brightness / 100;
  const c = 1 + adj.contrast / 100;
  const s = 1 + adj.saturation / 100;

  let cssFilter = `brightness(${b}) contrast(${c}) saturate(${s})`;

  if (adj.filter && adj.filter !== "original") {
    switch (adj.filter) {
      case "bw":
        cssFilter += " grayscale(1) contrast(1.1)";
        break;
      case "warm":
        cssFilter += " sepia(0.2) saturate(1.3) brightness(1.05)";
        break;
      case "cool":
        cssFilter += " hue-rotate(15deg) saturate(0.9) brightness(1.05)";
        break;
      case "faded":
        cssFilter += " brightness(1.1) contrast(0.85) saturate(0.7)";
        break;
      case "high-contrast":
        cssFilter += " contrast(1.4) brightness(0.95)";
        break;
    }
  }

  return cssFilter;
}

export function buildPreviewFilter(adj: Adjustments): string {
  return buildFilterString(adj);
}

export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  rotation = 0,
  adjustments: Adjustments,
  quality = 0.92
): Promise<Blob | null> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = getRotationSize(
    image.naturalWidth,
    image.naturalHeight,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  const filterStr = buildFilterString(adjustments);
  ctx.filter = filterStr;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);

  ctx.drawImage(image, 0, 0);

  const croppedCanvas = document.createElement("canvas");
  const croppedCtx = croppedCanvas.getContext("2d");
  if (!croppedCtx) return null;

  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  croppedCtx.drawImage(
    canvas,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise((resolve) => {
    croppedCanvas.toBlob(
      (blob) => resolve(blob),
      "image/jpeg",
      quality
    );
  });
}

export async function processImage(
  imageSrc: string,
  rotation: number,
  adjustments: Adjustments,
  quality = 0.92
): Promise<Blob | null> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = getRotationSize(
    image.naturalWidth,
    image.naturalHeight,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.filter = buildFilterString(adjustments);

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.naturalWidth / 2, -image.naturalHeight / 2);

  ctx.drawImage(image, 0, 0);

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob),
      "image/jpeg",
      quality
    );
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
