/** 편집기 전역 상수. 기상(WeatherFrontLine) 관련 상수는 모두 제거됨. */

export const DEFAULT_CANVAS = {
  width: 1280,
  height: 720,
} as const;

/** 자유 그리기(펜) 기본 설정. */
export const defaultBrushSettings = {
  color: "#111827",
  size: 8,
};

/** 화살표 머리 스타일. */
export enum ArrowHeadStyle {
  NoHead,
  Head,
  FilledHead,
}

/** 화살표 타입. */
export enum ArrowType {
  SharpArrow,
  CurvedArrow,
  ElbowArrow,
}

/** 도형 그리기 기본 설정. */
export const defaultShapeSettings = {
  evented: false,
  selectable: false,
  stroke: "#111827",
  strokeWidth: 2,
  opacity: 1,
  cornerStyle: "circle" as const,
  strokeLineCap: "round" as const,
  padding: 4,
};

/** 테두리(선) 설정 패널을 노출할 객체 타입 목록. */
export const borderSectionTypeList: string[] = [
  "ctextbox",
  "path",
  "image",
  "polygon",
  "circle",
  "ellipse",
  "triangle",
  "rect",
  "curvedline",
  "arrow",
  "polypath",
];

/** 선 스타일 프리셋(실선/파선/점선 등). */
export const BorderStyleList = [
  { value: { strokeDashArray: [] as number[], strokeLineCap: "butt" }, label: "────────" },
  { value: { strokeDashArray: [10, 10], strokeLineCap: "square" }, label: "━ ━ ━ ━ ━" },
  { value: { strokeDashArray: [1, 10], strokeLineCap: "round" }, label: "• • • • • •" },
  { value: { strokeDashArray: [15, 10, 5, 10], strokeLineCap: "square" }, label: "━ ━━ ━ ━━" },
] as const;

export const FONT_FAMILIES = [
  "Pretendard",
  "맑은 고딕",
  "바탕체",
  "궁서체",
  "돋움체",
  "Arial",
  "Georgia",
  "Times New Roman",
  "Courier New",
];

export const STORAGE_KEY = "canvasStudioEditor";
