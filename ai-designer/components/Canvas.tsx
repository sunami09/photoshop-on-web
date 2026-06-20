import React from "react";
import type { DesignDocument, Layer } from "@/lib/types";
import { renderDocument } from "./editor-utils";

type ResizeHandle = "nw" | "n" | "ne" | "e" | "se" | "s" | "sw" | "w";

type CanvasProps = {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  designDocument: DesignDocument | null;
  setDesignDocument: React.Dispatch<React.SetStateAction<DesignDocument | null>>;
  selectedLayerId: string | null;
  setSelectedLayerId: React.Dispatch<React.SetStateAction<string | null>>;
};

export function Canvas({
  canvasRef,
  designDocument,
  setDesignDocument,
  selectedLayerId,
  setSelectedLayerId,
}: CanvasProps) {
  const dragStateRef = React.useRef<{
    isDragging: boolean;
    activeLayerId: string | null;
    startMouseX: number;
    startMouseY: number;
    startLayerX: number;
    startLayerY: number;
  }>({
    isDragging: false,
    activeLayerId: null,
    startMouseX: 0,
    startMouseY: 0,
    startLayerX: 0,
    startLayerY: 0,
  });

  const resizeStateRef = React.useRef<{
    isResizing: boolean;
    activeLayerId: string | null;
    handle: ResizeHandle | null;
    startMouseX: number;
    startMouseY: number;
    startLayerX: number;
    startLayerY: number;
    startLayerWidth: number;
    startLayerHeight: number;
    startCropX: number;
    startCropY: number;
    startCropWidth: number;
    startCropHeight: number;
    startSourceWidth: number;
    startSourceHeight: number;
  }>({
    isResizing: false,
    activeLayerId: null,
    handle: null,
    startMouseX: 0,
    startMouseY: 0,
    startLayerX: 0,
    startLayerY: 0,
    startLayerWidth: 0,
    startLayerHeight: 0,
    startCropX: 0,
    startCropY: 0,
    startCropWidth: 0,
    startCropHeight: 0,
    startSourceWidth: 0,
    startSourceHeight: 0,
  });

  const selectedLayer =
    designDocument && selectedLayerId
      ? designDocument.layers.find((layer) => layer.id === selectedLayerId) ??
        null
      : null;

  function getCanvasPointFromClient(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  function getCanvasPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    return getCanvasPointFromClient(event.clientX, event.clientY);
  }

  function isPointInsideLayer(point: { x: number; y: number }, layer: Layer) {
    return (
      point.x >= layer.x &&
      point.x <= layer.x + layer.width &&
      point.y >= layer.y &&
      point.y <= layer.y + layer.height
    );
  }

  function findTopLayerAtPoint(point: { x: number; y: number }) {
    if (!designDocument) return null;

    for (let i = designDocument.layers.length - 1; i >= 0; i--) {
      const layer = designDocument.layers[i];

      if (!layer.visible) continue;

      if (isPointInsideLayer(point, layer)) {
        return layer;
      }
    }

    return null;
  }

  function resetDragState() {
    dragStateRef.current = {
      isDragging: false,
      activeLayerId: null,
      startMouseX: 0,
      startMouseY: 0,
      startLayerX: 0,
      startLayerY: 0,
    };
  }

  function resetResizeState() {
    resizeStateRef.current = {
      isResizing: false,
      activeLayerId: null,
      handle: null,
      startMouseX: 0,
      startMouseY: 0,
      startLayerX: 0,
      startLayerY: 0,
      startLayerWidth: 0,
      startLayerHeight: 0,
      startCropX: 0,
      startCropY: 0,
      startCropWidth: 0,
      startCropHeight: 0,
      startSourceWidth: 0,
      startSourceHeight: 0,
    };
  }

  function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!designDocument) return;

    const point = getCanvasPoint(event);
    if (!point) return;

    const clickedLayer = findTopLayerAtPoint(point);

    if (!clickedLayer) {
      setSelectedLayerId(null);
      resetDragState();
      resetResizeState();
      return;
    }

    setSelectedLayerId(clickedLayer.id);

    dragStateRef.current = {
      isDragging: true,
      activeLayerId: clickedLayer.id,
      startMouseX: point.x,
      startMouseY: point.y,
      startLayerX: clickedLayer.x,
      startLayerY: clickedLayer.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
    if (!dragStateRef.current.isDragging) return;

    const activeLayerId = dragStateRef.current.activeLayerId;
    if (!activeLayerId) return;

    const point = getCanvasPoint(event);
    if (!point) return;

    const deltaX = point.x - dragStateRef.current.startMouseX;
    const deltaY = point.y - dragStateRef.current.startMouseY;

    setDesignDocument((currentDocument) => {
      if (!currentDocument) return currentDocument;

      const updatedDocument: DesignDocument = {
        ...currentDocument,
        layers: currentDocument.layers.map((layer) =>
          layer.id === activeLayerId
            ? {
                ...layer,
                x: Math.round(dragStateRef.current.startLayerX + deltaX),
                y: Math.round(dragStateRef.current.startLayerY + deltaY),
              }
            : layer
        ),
      };

      renderDocument(updatedDocument, canvasRef);
      return updatedDocument;
    });
  }

  function handlePointerUp(event: React.PointerEvent<HTMLCanvasElement>) {
    resetDragState();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function handleResizePointerDown(
    event: React.PointerEvent<HTMLDivElement>,
    handle: ResizeHandle
  ) {
    event.stopPropagation();
    event.preventDefault();

    if (!selectedLayer) return;

    const point = getCanvasPointFromClient(event.clientX, event.clientY);
    if (!point) return;

    resetDragState();

    resizeStateRef.current = {
      isResizing: true,
      activeLayerId: selectedLayer.id,
      handle,
      startMouseX: point.x,
      startMouseY: point.y,
      startLayerX: selectedLayer.x,
      startLayerY: selectedLayer.y,
      startLayerWidth: selectedLayer.width,
      startLayerHeight: selectedLayer.height,
      startCropX: selectedLayer.cropX,
      startCropY: selectedLayer.cropY,
      startCropWidth: selectedLayer.cropWidth,
      startCropHeight: selectedLayer.cropHeight,
      startSourceWidth: selectedLayer.sourceWidth,
      startSourceHeight: selectedLayer.sourceHeight,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handleResizePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!resizeStateRef.current.isResizing) return;

    const state = resizeStateRef.current;
    const activeLayerId = state.activeLayerId;
    const handle = state.handle;

    if (!activeLayerId || !handle) return;

    const point = getCanvasPointFromClient(event.clientX, event.clientY);
    if (!point) return;

    const deltaX = point.x - state.startMouseX;
    const deltaY = point.y - state.startMouseY;

    const minLayerSize = 30;

    const clamp = (value: number, min: number, max: number) => {
      return Math.min(Math.max(value, min), max);
    };

    let newX = state.startLayerX;
    let newY = state.startLayerY;
    let newWidth = state.startLayerWidth;
    let newHeight = state.startLayerHeight;

    let newCropX = state.startCropX;
    let newCropY = state.startCropY;
    let newCropWidth = state.startCropWidth;
    let newCropHeight = state.startCropHeight;

    const isCornerHandle =
      handle === "nw" || handle === "ne" || handle === "se" || handle === "sw";

    if (isCornerHandle) {
      const aspectRatio = state.startLayerWidth / state.startLayerHeight;

      let widthCandidate = state.startLayerWidth;
      let heightCandidate = state.startLayerHeight;

      if (handle === "se") {
        widthCandidate = state.startLayerWidth + deltaX;
        heightCandidate = state.startLayerHeight + deltaY;
      }

      if (handle === "ne") {
        widthCandidate = state.startLayerWidth + deltaX;
        heightCandidate = state.startLayerHeight - deltaY;
      }

      if (handle === "sw") {
        widthCandidate = state.startLayerWidth - deltaX;
        heightCandidate = state.startLayerHeight + deltaY;
      }

      if (handle === "nw") {
        widthCandidate = state.startLayerWidth - deltaX;
        heightCandidate = state.startLayerHeight - deltaY;
      }

      if (Math.abs(widthCandidate) > Math.abs(heightCandidate * aspectRatio)) {
        newWidth = Math.max(minLayerSize, widthCandidate);
        newHeight = newWidth / aspectRatio;
      } else {
        newHeight = Math.max(minLayerSize, heightCandidate);
        newWidth = newHeight * aspectRatio;
      }

      if (handle === "nw") {
        newX = state.startLayerX + state.startLayerWidth - newWidth;
        newY = state.startLayerY + state.startLayerHeight - newHeight;
      }

      if (handle === "ne") {
        newX = state.startLayerX;
        newY = state.startLayerY + state.startLayerHeight - newHeight;
      }

      if (handle === "sw") {
        newX = state.startLayerX + state.startLayerWidth - newWidth;
        newY = state.startLayerY;
      }

      if (handle === "se") {
        newX = state.startLayerX;
        newY = state.startLayerY;
      }
    } else {
      const displayScaleX = state.startLayerWidth / state.startCropWidth;
      const displayScaleY = state.startLayerHeight / state.startCropHeight;

      const minCropWidth = minLayerSize / displayScaleX;
      const minCropHeight = minLayerSize / displayScaleY;

      if (handle === "e") {
        const desiredCropWidth =
          (state.startLayerWidth + deltaX) / displayScaleX;

        newCropWidth = clamp(
          desiredCropWidth,
          minCropWidth,
          state.startSourceWidth - state.startCropX
        );

        newWidth = newCropWidth * displayScaleX;
      }

      if (handle === "w") {
        const fixedRightCrop = state.startCropX + state.startCropWidth;
        const desiredCropX = state.startCropX + deltaX / displayScaleX;

        newCropX = clamp(desiredCropX, 0, fixedRightCrop - minCropWidth);
        newCropWidth = fixedRightCrop - newCropX;

        const actualCropDelta = newCropX - state.startCropX;

        newX = state.startLayerX + actualCropDelta * displayScaleX;
        newWidth = newCropWidth * displayScaleX;
      }

      if (handle === "s") {
        const desiredCropHeight =
          (state.startLayerHeight + deltaY) / displayScaleY;

        newCropHeight = clamp(
          desiredCropHeight,
          minCropHeight,
          state.startSourceHeight - state.startCropY
        );

        newHeight = newCropHeight * displayScaleY;
      }

      if (handle === "n") {
        const fixedBottomCrop = state.startCropY + state.startCropHeight;
        const desiredCropY = state.startCropY + deltaY / displayScaleY;

        newCropY = clamp(desiredCropY, 0, fixedBottomCrop - minCropHeight);
        newCropHeight = fixedBottomCrop - newCropY;

        const actualCropDelta = newCropY - state.startCropY;

        newY = state.startLayerY + actualCropDelta * displayScaleY;
        newHeight = newCropHeight * displayScaleY;
      }
    }

    setDesignDocument((currentDocument) => {
      if (!currentDocument) return currentDocument;

      const updatedDocument: DesignDocument = {
        ...currentDocument,
        layers: currentDocument.layers.map((layer) =>
          layer.id === activeLayerId
            ? {
                ...layer,
                x: Math.round(newX),
                y: Math.round(newY),
                width: Math.round(newWidth),
                height: Math.round(newHeight),
                cropX: Math.round(newCropX),
                cropY: Math.round(newCropY),
                cropWidth: Math.round(newCropWidth),
                cropHeight: Math.round(newCropHeight),
              }
            : layer
        ),
      };

      renderDocument(updatedDocument, canvasRef);
      return updatedDocument;
    });
  }

  function handleResizePointerUp(event: React.PointerEvent<HTMLDivElement>) {
    resetResizeState();

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  function getSelectionBoxStyle(layer: Layer, doc: DesignDocument) {
    return {
      left: `${(layer.x / doc.width) * 100}%`,
      top: `${(layer.y / doc.height) * 100}%`,
      width: `${(layer.width / doc.width) * 100}%`,
      height: `${(layer.height / doc.height) * 100}%`,
    };
  }

  function renderResizeHandle(handle: ResizeHandle, className: string) {
    return (
      <div
        onPointerDown={(event) => handleResizePointerDown(event, handle)}
        onPointerMove={handleResizePointerMove}
        onPointerUp={handleResizePointerUp}
        onPointerCancel={handleResizePointerUp}
        className={`pointer-events-auto absolute h-3 w-3 rounded-sm border border-white bg-blue-500 ${className}`}
      />
    );
  }

  return (
    <div
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          setSelectedLayerId(null);
          resetDragState();
          resetResizeState();
        }
      }}
      className="flex h-[85vh] items-center justify-center overflow-auto rounded border border-neutral-700 bg-neutral-900 p-4"
    >
      <div className="relative h-fit w-fit max-h-full max-w-full">
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          className={`block max-h-[80vh] max-w-full ${
            selectedLayerId ? "cursor-move" : "cursor-default"
          }`}
        />

        {designDocument && selectedLayer && selectedLayer.visible && (
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute border-2 border-blue-400"
              style={getSelectionBoxStyle(selectedLayer, designDocument)}
            >
              {renderResizeHandle(
                "nw",
                "-left-1.5 -top-1.5 cursor-nwse-resize"
              )}

              {renderResizeHandle(
                "n",
                "left-1/2 -top-1.5 -translate-x-1/2 cursor-ns-resize"
              )}

              {renderResizeHandle(
                "ne",
                "-right-1.5 -top-1.5 cursor-nesw-resize"
              )}

              {renderResizeHandle(
                "e",
                "-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize"
              )}

              {renderResizeHandle(
                "se",
                "-bottom-1.5 -right-1.5 cursor-nwse-resize"
              )}

              {renderResizeHandle(
                "s",
                "-bottom-1.5 left-1/2 -translate-x-1/2 cursor-ns-resize"
              )}

              {renderResizeHandle(
                "sw",
                "-bottom-1.5 -left-1.5 cursor-nesw-resize"
              )}

              {renderResizeHandle(
                "w",
                "-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize"
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}