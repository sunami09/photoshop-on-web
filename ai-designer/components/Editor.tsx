"use client";

import { useRef, useState } from "react";
import type { DesignDocument } from "@/lib/types";
import { Navbar } from "./Navbar";
import { Workspace } from "./Workspace";


export default function Editor() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [designDocument, setDesignDocument] = useState<DesignDocument | null>(null);

  return (
    <main className="min-h-screen bg-neutral-950 p-6 text-white">
        <Navbar setDesignDocument={setDesignDocument} canvasRef={canvasRef} designDocument={designDocument} />
        <Workspace setDesignDocument={setDesignDocument} canvasRef={canvasRef} designDocument={designDocument} />     
    </main>
  );
}