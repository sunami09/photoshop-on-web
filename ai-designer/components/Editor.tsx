"use client";

import { useRef, useState } from "react";

export default function Editor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hasImage, setHasImage] = useState(false);

  function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    console.log(event);
    const file = event.target.files?.[0];
    if (!file) return;
    console.log(file);
    const imageUrl = URL.createObjectURL(file);
    console.log(imageUrl);
    const img = new Image();

    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      setHasImage(true);
      URL.revokeObjectURL(imageUrl);
    };

    img.src = imageUrl;
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
          disabled={!hasImage}
          className="rounded bg-blue-500 px-4 py-2 disabled:opacity-40"
        >
          Export PNG
        </button>
      </div>

      <div className="overflow-auto rounded border border-neutral-700 bg-neutral-900 p-4">
        <canvas ref={canvasRef} className="max-w-full" />
      </div>
    </main>
  );
}