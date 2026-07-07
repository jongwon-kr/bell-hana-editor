import "fabric";

declare module "fabric" {
  interface FabricObject {
    id?: string;
    name?: string;
    label?: string;
    /** true면 사용자가 선택/이벤트 대상에서 제외되는 잠금 객체(배경 등). */
    noFocusing?: boolean;
    isSmoothing?: boolean;
    startArrowHeadStyle?: number;
    endArrowHeadStyle?: number;
    textboxBorderColor?: string;
    textboxBorderWidth?: number;
    isPreview?: boolean;
  }

  interface Canvas {
    /** 뷰포트 줌 이전의 원본 캔버스 크기(줌 계산 기준). */
    originalW?: number;
    originalH?: number;
  }
}
