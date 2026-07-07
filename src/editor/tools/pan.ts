import type { Canvas, TPointerEventInfo, TPointerEvent } from "fabric";
import type { ToolId } from "../types";
import { zoomToPoint } from "../core/zoom";

type GetTool = () => ToolId;
type OnZoom = (zoom: number) => void;

/** 손도구(Pan) 드래그 이동 + Ctrl/휠 줌. */
export function installPanAndZoom(canvas: Canvas, getTool: GetTool, onZoom: OnZoom) {
  let isPanning = false;
  let lastX = 0;
  let lastY = 0;

  canvas.on("mouse:down", (opt: TPointerEventInfo<TPointerEvent>) => {
    if (getTool() !== "hand") return;
    isPanning = true;
    const e = opt.e as MouseEvent;
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.defaultCursor = "grabbing";
    canvas.setCursor("grabbing");
  });

  canvas.on("mouse:move", (opt: TPointerEventInfo<TPointerEvent>) => {
    if (!isPanning) return;
    const e = opt.e as MouseEvent;
    const vpt = canvas.viewportTransform;
    vpt[4] += e.clientX - lastX;
    vpt[5] += e.clientY - lastY;
    canvas.setViewportTransform(vpt);
    lastX = e.clientX;
    lastY = e.clientY;
    canvas.requestRenderAll();
  });

  canvas.on("mouse:up", () => {
    if (!isPanning) return;
    isPanning = false;
    canvas.defaultCursor = "grab";
  });

  canvas.on("mouse:wheel", (opt: TPointerEventInfo<WheelEvent>) => {
    const e = opt.e;
    if (!e.ctrlKey && !e.metaKey) return; // Ctrl+휠에서만 줌
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    const applied = zoomToPoint(canvas, zoom, e.offsetX, e.offsetY);
    onZoom(applied);
  });
}
