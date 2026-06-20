import { EditorState } from "@/lib/types";
import { exportPng, handleImageUpload } from "./editor-actions";
import { toggleLayerVisibility } from "./editor-utils";

export function Tools({ setDesignDocument, canvasRef, designDocument }: EditorState) {
    return (
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
                                onClick={() => toggleLayerVisibility(layer.id, designDocument, setDesignDocument, canvasRef)}
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
    );
}