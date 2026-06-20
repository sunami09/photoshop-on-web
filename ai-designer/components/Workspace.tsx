import { Canvas } from "./Canvas";
import { toggleLayerVisibility } from "./editor-utils";
import { EditorState } from "@/lib/types";
import { Tools } from "./Tools";


export function Workspace({ setDesignDocument, canvasRef, designDocument }: EditorState) {
    return (
        <div className="grid grid-cols-[1fr_280px] gap-4">
            <Canvas canvasRef={canvasRef} />
            <Tools setDesignDocument={setDesignDocument} canvasRef={canvasRef} designDocument={designDocument} />
        </div>

    );
}