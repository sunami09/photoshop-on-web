"use client";

import { useRef, useState } from "react";
import type { DesignDocument } from "@/lib/types";

export default function Editor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [designDocument, setDesignDocument] = useState<DesignDocument | null>(null);

  function renderDocument(doc: DesignDocument) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = doc.width;
    canvas.height = doc.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const layer of doc.layers) {
      if (!layer.visible) continue;

      ctx.save();
      ctx.globalAlpha = layer.opacity;

      if (layer.type === "image") {
        ctx.drawImage(
          layer.image,
          layer.x,
          layer.y,
          layer.width,
          layer.height
        );
      }

      ctx.restore();
    }
  }

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const newDocument: DesignDocument = {
        width: img.width,
        height: img.height,
        layers: [
          {
            id: crypto.randomUUID(),
            type: "image",
            name: file.name,
            image: img,
            x: 0,
            y: 0,
            width: img.width,
            height: img.height,
            opacity: 1,
            visible: true,
          },
        ],
      };

      setDesignDocument(newDocument);
      renderDocument(newDocument);

      URL.revokeObjectURL(imageUrl);
    };

    img.src = imageUrl;
  }

  function toggleLayerVisibility(layerId: string) {
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
    renderDocument(updatedDocument);
    }

  function exportPng() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = imageData;
    link.download = "edited-image.png";
    link.click();
  }

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-white">
        <div className="mb-4 flex gap-3">
            <label className="cursor-pointer rounded bg-white px-4 py-2 text-black">
                Upload Image
                <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                />
            </label>

            <button
                onClick={exportPng}
                disabled={!designDocument}
                className="rounded bg-blue-500 px-4 py-2 disabled:opacity-40"
            >
                Export PNG
            </button>
        </div>

        <div className="grid grid-cols-[1fr_280px] gap-4">
            <div className="flex h-[85vh] items-center justify-center overflow-auto rounded border border-neutral-700 bg-neutral-900 p-4">
                <canvas
                    ref={canvasRef}
                    className="max-h-full max-w-full object-contain"
                />
            </div>

            <aside className="rounded border border-neutral-700 bg-neutral-900 p-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">
                Layers
                </h2>

                {!designDocument ? (
                <p className="text-sm text-neutral-500">No layers yet.</p>
                ) : (
                <div className="space-y-2">
                    {designDocument.layers.map((layer) => (
                    <div
                        key={layer.id}
                        className="rounded border border-neutral-700 bg-neutral-800 p-3"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <div>
                                <div className="text-sm font-medium">{layer.name}</div>
                                <div className="text-xs text-neutral-400">
                                    {layer.type} · {Math.round(layer.opacity * 100)}%
                                </div>
                            </div>

                            <button
                                onClick={() => toggleLayerVisibility(layer.id)}
                                className="rounded bg-neutral-700 px-2 py-1 text-xs hover:bg-neutral-600"
                            >
                                {layer.visible ? "Hide" : "Show"}
                            </button>
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </aside>
        </div>
    </main>
  );
}