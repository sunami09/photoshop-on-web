import { EditorState } from "@/lib/types";
import { exportPng, handleImageUpload } from "./editor-actions";

export function Navbar({ setDesignDocument, canvasRef, designDocument, selectedLayerId, setSelectedLayerId }: EditorState) {
    return (
        <div className="mb-4 flex gap-3">
            <label className="cursor-pointer rounded bg-white px-4 py-2 text-black">
                Upload Image
                <input
                type="file"
                accept="image/*"
                onChange={(event) => handleImageUpload(event, designDocument, setDesignDocument, canvasRef, setSelectedLayerId)}
                className="hidden"
                />
            </label>

            <button
                onClick={() => exportPng(canvasRef)}
                disabled={!designDocument}
                className="rounded bg-blue-500 px-4 py-2 disabled:opacity-40"
            >
                Export PNG
            </button>
        </div>
    );
}