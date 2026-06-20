import { DesignDocument } from "@/lib/types";

export function renderDocument(doc: DesignDocument, canvasRef: React.RefObject<HTMLCanvasElement | null>) {
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


export function toggleLayerVisibility(
    layerId: string, 
    designDocument: DesignDocument | null, 
    setDesignDocument: (doc: DesignDocument) => void, 
    canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
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
    renderDocument(updatedDocument, canvasRef);
}