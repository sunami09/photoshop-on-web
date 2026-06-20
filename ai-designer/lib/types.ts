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