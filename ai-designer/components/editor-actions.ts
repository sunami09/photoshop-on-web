import { DesignDocument } from "@/lib/types";
import { renderDocument } from "./editor-utils";


export function handleImageUpload(
    event: React.ChangeEvent<HTMLInputElement>,
    setDesignDocument: (doc: DesignDocument) => void,
    canvasRef: React.RefObject<HTMLCanvasElement | null>
) {
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
        renderDocument(newDocument, canvasRef);

        URL.revokeObjectURL(imageUrl);
    };

    img.src = imageUrl;
}


export function exportPng(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = imageData;
    link.download = "edited-image.png";
    link.click();
}