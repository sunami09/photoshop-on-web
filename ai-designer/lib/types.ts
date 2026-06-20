import { Dispatch, RefObject, SetStateAction } from "react";

export type ImageLayer = {
  id: string;
  name: string;
  type: "image";
  image: HTMLImageElement;
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
}