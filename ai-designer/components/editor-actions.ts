import type { DesignDocument, ImageLayer } from "@/lib/types";
import { renderDocument } from "./editor-utils";

async function createNormalizedImageCanvas(file: File): Promise<HTMLCanvasElement> {
  if ("createImageBitmap" in window) {
    const bitmap = await createImageBitmap(file, {
      imageOrientation: "from-image",
    });

    const imageCanvas = document.createElement("canvas");
    imageCanvas.width = bitmap.width;
    imageCanvas.height = bitmap.height;

    const ctx = imageCanvas.getContext("2d");
    if (!ctx) {
      bitmap.close();
      throw new Error("Could not create image canvas context.");
    }

    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();

    return imageCanvas;
  }

  return new Promise((resolve, reject) => {
    const imageUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const imageCanvas = document.createElement("canvas");
      imageCanvas.width = img.naturalWidth || img.width;
      imageCanvas.height = img.naturalHeight || img.height;

      const ctx = imageCanvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(imageUrl);
        reject(new Error("Could not create image canvas context."));
        return;
      }

      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(imageUrl);
      resolve(imageCanvas);
    };

    img.onerror = () => {
      URL.revokeObjectURL(imageUrl);
      reject(new Error("Image failed to load."));
    };

    img.src = imageUrl;
  });
}

export async function handleImageUpload(
  event: React.ChangeEvent<HTMLInputElement>,
  designDocument: DesignDocument | null,
  setDesignDocument: React.Dispatch<React.SetStateAction<DesignDocument | null>>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  setSelectedLayerId: React.Dispatch<React.SetStateAction<string | null>>
) {
  const input = event.currentTarget;
  const file = input.files?.[0];
  if (!file) return;

  const imageCanvas = await createNormalizedImageCanvas(file);
  const layerId = crypto.randomUUID();

  // First image creates the document.
  if (!designDocument) {
    const newLayer: ImageLayer = {
      id: layerId,
      type: "image",
      name: file.name,
      image: imageCanvas,
      sourceWidth: imageCanvas.width,
      sourceHeight: imageCanvas.height,
      cropX: 0,
      cropY: 0,
      cropWidth: imageCanvas.width,
      cropHeight: imageCanvas.height,
      x: 0,
      y: 0,
      width: imageCanvas.width,
      height: imageCanvas.height,
      opacity: 1,
      visible: true,
    };

    const newDocument: DesignDocument = {
      width: imageCanvas.width,
      height: imageCanvas.height,
      layers: [newLayer],
    };

    setDesignDocument(newDocument);
    setSelectedLayerId(layerId);
    renderDocument(newDocument, canvasRef);

    input.value = "";
    return;
  }

  // Later images become layers inside the existing document.
  // Do NOT change document width/height.
  const maxLayerWidth = designDocument.width * 0.35;
  const maxLayerHeight = designDocument.height * 0.35;

  const scale = Math.min(
    maxLayerWidth / imageCanvas.width,
    maxLayerHeight / imageCanvas.height,
    1
  );

  const layerWidth = Math.round(imageCanvas.width * scale);
  const layerHeight = Math.round(imageCanvas.height * scale);

  const newLayer: ImageLayer = {
    id: layerId,
    type: "image",
    name: file.name,
    image: imageCanvas,
    sourceWidth: imageCanvas.width,
    sourceHeight: imageCanvas.height,
    x: Math.round((designDocument.width - layerWidth) / 2),
    y: Math.round((designDocument.height - layerHeight) / 2),
    width: layerWidth,
    height: layerHeight,
    opacity: 1,
    visible: true,
    cropX: 0,
    cropY: 0,
    cropWidth: imageCanvas.width,
    cropHeight: imageCanvas.height,
  };

  const updatedDocument: DesignDocument = {
    ...designDocument,
    layers: [...designDocument.layers, newLayer],
  };

  setDesignDocument(updatedDocument);
  setSelectedLayerId(layerId);
  renderDocument(updatedDocument, canvasRef);

  input.value = "";
}

export function exportPng(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const imageData = canvas.toDataURL("image/png");

  const link = document.createElement("a");
  link.href = imageData;
  link.download = "edited-image.png";
  link.click();
}