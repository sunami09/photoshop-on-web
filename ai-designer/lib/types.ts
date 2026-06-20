import { Dispatch, RefObject, SetStateAction } from "react";

export type ImageLayer = {
  id: string;
  name: string;
  type: "image";
  image: HTMLCanvasElement;
  sourceWidth: number;
  sourceHeight: number;

  cropX: number;
  cropY: number;
  cropWidth: number;
  cropHeight: number;

  x: number;
  y: number;
  width: number;
  height: number;
  opacity: number;
  visible: boolean;
};

export type Layer = ImageLayer;

export type DesignDocument = {
  width: number;
  height: number;
  layers: Layer[];
};

export interface EditorState {
  designDocument: DesignDocument | null;
  setDesignDocument: Dispatch<SetStateAction<DesignDocument | null>>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
  selectedLayerId: string | null;
  setSelectedLayerId: Dispatch<SetStateAction<string | null>>;
}