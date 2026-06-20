import { Canvas } from "./Canvas";
import { EditorState } from "@/lib/types";
import { Tools } from "./Tools";

export function Workspace({
  setDesignDocument,
  canvasRef,
  designDocument,
  selectedLayerId,
  setSelectedLayerId,
}: EditorState) {
  return (
    <div className="grid grid-cols-[1fr_280px] gap-4">
      <Canvas
        canvasRef={canvasRef}
        designDocument={designDocument}
        setDesignDocument={setDesignDocument}
        selectedLayerId={selectedLayerId}
        setSelectedLayerId={setSelectedLayerId}
      />

      <Tools
        setDesignDocument={setDesignDocument}
        canvasRef={canvasRef}
        designDocument={designDocument}
        selectedLayerId={selectedLayerId}
        setSelectedLayerId={setSelectedLayerId}
      />
    </div>
  );
}