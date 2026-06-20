import { EditorState } from "@/lib/types";

export function Canvas({ canvasRef }: Pick<EditorState, "canvasRef">) {
    return (
        <div className="flex h-[85vh] items-center justify-center overflow-auto rounded border border-neutral-700 bg-neutral-900 p-4">
            <canvas
                ref={canvasRef}
                className="max-h-full max-w-full object-contain"
            />
        </div>
    );
}