import type { Canvas } from "fabric";
import type { ToolId } from "../types";
import { defaultBrushSettings } from "../core/constants";
import { fabric } from "../fabric";

/** 자유 그리기 이외의 도구는 드래그 그리기용으로 객체 선택/이벤트를 잠근다. */
const DRAW_TOOLS: ToolId[] = ["ellipse", "triangle", "rect", "curvedLine", "arrow", "polypath", "ctextbox"];

const CURSORS: Partial<Record<ToolId, string>> = {
  hand: "grab",
  ellipse: "crosshair",
  triangle: "crosshair",
  rect: "crosshair",
  curvedLine: "crosshair",
  arrow: "crosshair",
  polypath: "crosshair",
  ctextbox: "crosshair",
};

export interface BrushSettings {
  color: string;
  size: number;
}

/**
 * 도구 전환 시 캔버스 상호작용 상태를 갱신.
 * (기존 core.js setActiveTool의 캔버스 사이드 로직을 이식, 기상 도구 제외)
 */
export function applyToolMode(canvas: Canvas, tool: ToolId, brush: BrushSettings) {
  // 초기화
  canvas.isDrawingMode = false;
  canvas.selection = true;
  canvas.defaultCursor = "default";
  canvas.skipTargetFind = false;

  if (tool !== "select") {
    canvas.discardActiveObject();
  }

  const lockObjects = tool === "hand" || DRAW_TOOLS.includes(tool);

  canvas.forEachObject((o) => {
    if (o.noFocusing) return;
    o.selectable = !lockObjects;
    o.evented = !lockObjects;
    if (tool === "select") o.hoverCursor = "move";
  });

  if (lockObjects) canvas.selection = false;

  canvas.defaultCursor = CURSORS[tool] ?? "default";

  if (tool === "draw") {
    canvas.isDrawingMode = true;
    if (!canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    }
    canvas.freeDrawingBrush.color = brush.color || defaultBrushSettings.color;
    canvas.freeDrawingBrush.width = brush.size || defaultBrushSettings.size;
  }

  canvas.requestRenderAll();
}
