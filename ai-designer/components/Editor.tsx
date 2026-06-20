"use client";

import { useEffect, useRef, useState } from "react";
import type { DesignDocument } from "@/lib/types";
import { Navbar } from "./Navbar";
import { Workspace } from "./Workspace";
import { renderDocument } from "./editor-utils";

export default function Editor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [designDocument, setDesignDocument] =
    useState<DesignDocument | null>(null);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      const isDeleteKey = event.key === "Backspace" || event.key === "Delete";
      if (!isDeleteKey) return;

      const target = event.target as HTMLElement | null;

      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable;

      if (isTyping) return;

      if (!designDocument || !selectedLayerId) return;

      event.preventDefault();

      const updatedDocument: DesignDocument = {
        ...designDocument,
        layers: designDocument.layers.filter(
          (layer) => layer.id !== selectedLayerId
        ),
      };

      setDesignDocument(updatedDocument);
      setSelectedLayerId(null);
      renderDocument(updatedDocument, canvasRef);
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [designDocument, selectedLayerId, setDesignDocument, setSelectedLayerId]);

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-white">
      <Navbar
        setDesignDocument={setDesignDocument}
        canvasRef={canvasRef}
        designDocument={designDocument}
        selectedLayerId={selectedLayerId}
        setSelectedLayerId={setSelectedLayerId}
      />

      <Workspace
        setDesignDocument={setDesignDocument}
        canvasRef={canvasRef}
        designDocument={designDocument}
        selectedLayerId={selectedLayerId}
        setSelectedLayerId={setSelectedLayerId}
      />
    </main>
  );
}