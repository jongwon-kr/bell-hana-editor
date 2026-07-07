import type { Canvas } from "fabric";
import { fabric } from "../fabric";

export const MIN_ZOOM = 0.1;
export const MAX_ZOOM = 8;

/** 지정 배율로 캔버스 뷰포트를 확대/축소(원본 크기 기준으로 표시 크기 조정). */
export function applyZoom(canvas: Canvas, level: number) {
  const zoom = Math.min(Math.max(level, MIN_ZOOM), MAX_ZOOM);
  const w = canvas.originalW ?? canvas.getWidth();
  const h = canvas.originalH ?? canvas.getHeight();

  canvas.setZoom(zoom);
  canvas.setDimensions({ width: w * zoom, height: h * zoom });
  canvas.requestRenderAll();
  return zoom;
}

/** 지정 지점을 기준으로 줌(마우스 휠). */
export function zoomToPoint(canvas: Canvas, level: number, x: number, y: number) {
  const zoom = Math.min(Math.max(level, MIN_ZOOM), MAX_ZOOM);
  canvas.zoomToPoint(new fabric.Point(x, y), zoom);
  canvas.requestRenderAll();
  return zoom;
}

/** 컨테이너에 맞춰 캔버스를 100% 또는 축소 표시하고 뷰포트를 초기화. */
export function fitZoom(canvas: Canvas, container: HTMLElement, padding = 48) {
  const w = canvas.originalW ?? canvas.getWidth();
  const h = canvas.originalH ?? canvas.getHeight();
  const availW = container.clientWidth - padding;
  const availH = container.clientHeight - padding;
  const zoom = Math.min(availW / w, availH / h, 1);

  canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
  return applyZoom(canvas, zoom > 0 ? zoom : 1);
}
