import { DesignDocument, ImageLayer } from "@/lib/types";

function drawClippedImageLayer(
  ctx: CanvasRenderingContext2D,
  layer: ImageLayer
) {
  const canvas = ctx.canvas;

  const dx = layer.x;
  const dy = layer.y;
  const dw = layer.width;
  const dh = layer.height;

  const visibleLeft = Math.max(0, dx);
  const visibleTop = Math.max(0, dy);
  const visibleRight = Math.min(canvas.width, dx + dw);
  const visibleBottom = Math.min(canvas.height, dy + dh);

  const visibleWidth = visibleRight - visibleLeft;
  const visibleHeight = visibleBottom - visibleTop;

  if (visibleWidth <= 0 || visibleHeight <= 0) return;

  const sourceScaleX = layer.cropWidth / dw;
  const sourceScaleY = layer.cropHeight / dh;

  const sx = layer.cropX + (visibleLeft - dx) * sourceScaleX;
  const sy = layer.cropY + (visibleTop - dy) * sourceScaleY;
  const sw = visibleWidth * sourceScaleX;
  const sh = visibleHeight * sourceScaleY;

  ctx.drawImage(
    layer.image,
    sx,
    sy,
    sw,
    sh,
    visibleLeft,
    visibleTop,
    visibleWidth,
    visibleHeight
  );
}

export function renderDocument(
  doc: DesignDocument,
  canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  if (canvas.width !== doc.width) {
    canvas.width = doc.width;
  }

  if (canvas.height !== doc.height) {
    canvas.height = doc.height;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  for (const layer of doc.layers) {
    if (!layer.visible) continue;

    ctx.save();
    ctx.globalAlpha = layer.opacity;

    if (layer.type === "image") {
      drawClippedImageLayer(ctx, layer);
    }

    ctx.restore();
  }
}


export function toggleLayerVisibility(
    layerId: string, 
    designDocument: DesignDocument | null, 
    setDesignDocument: (doc: DesignDocument) => void, 
    canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
    if (!designDocument) return;

    const updatedDocument = {
        ...designDocument,
        layers: designDocument.layers.map((layer) =>
        layer.id === layerId
            ? {
                ...layer,
                visible: !layer.visible,
            }
            : layer
        ),
    };

    setDesignDocument(updatedDocument);
    renderDocument(updatedDocument, canvasRef);
}