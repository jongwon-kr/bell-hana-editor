/** 편집기에서 사용하는 도구 식별자. 기상(weatherFrontLine) 도구는 제거됨. */
export type ToolId =
  | "select"
  | "hand"
  | "ellipse"
  | "triangle"
  | "rect"
  | "shapes"
  | "draw"
  | "curvedLine"
  | "arrow"
  | "polypath"
  | "ctextbox"
  | "images"
  | "templates"
  | "background";

/** 툴바 액션(도구 전환이 아닌 즉시 실행형 명령). */
export type ActionId =
  | "undo"
  | "redo"
  | "download"
  | "clear"
  | "fullscreen"
  | "help";

export interface CanvasSize {
  width: number;
  height: number;
}

export interface LayerItem {
  id: string;
  label: string;
  type: string;
  visible: boolean;
  locked: boolean;
}

export type AlignPosition =
  | "left"
  | "center-h"
  | "right"
  | "top"
  | "center-v"
  | "bottom";
