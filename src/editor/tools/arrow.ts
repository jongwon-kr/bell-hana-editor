import type { Canvas, TPointerEventInfo, TPointerEvent } from "fabric";
import type { ToolId } from "../types";
import { Arrow } from "../fabric";
import { ArrowHeadStyle, defaultShapeSettings } from "../core/constants";
import { generateUniqueId } from "../core/id";

type GetTool = () => ToolId;
type Seg = (string | number)[];

/** 드래그로 화살표를 그리는 도구. Shift 시 45° 스냅. */
export function installArrowTool(canvas: Canvas, getTool: GetTool) {
  let isDrawing = false;
  let arrow: Arrow | null = null;
  let start = { x: 0, y: 0 };

  const snap = (e: MouseEvent, x: number, y: number) => {
    if (!e.shiftKey) return { x, y };
    const dx = x - start.x;
    const dy = y - start.y;
    const angle = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * (Math.PI / 4);
    const len = Math.hypot(dx, dy);
    return { x: start.x + len * Math.cos(angle), y: start.y + len * Math.sin(angle) };
  };

  const onDown = (opt: TPointerEventInfo<TPointerEvent>) => {
    if (getTool() !== "arrow") return;
    isDrawing = true;
    const p = canvas.getScenePoint(opt.e);
    start = { x: p.x, y: p.y };
    arrow = new Arrow(`M ${p.x} ${p.y} L ${p.x} ${p.y}`, {
      id: generateUniqueId(),
      stroke: defaultShapeSettings.stroke,
      strokeWidth: defaultShapeSettings.strokeWidth,
      fill: "transparent",
      selectable: false,
      evented: false,
      strokeUniform: true,
      originX: "left",
      originY: "top",
      left: p.x,
      top: p.y,
      startArrowHeadStyle: ArrowHeadStyle.NoHead,
      endArrowHeadStyle: ArrowHeadStyle.FilledHead,
    });
    canvas.add(arrow);
    canvas.requestRenderAll();
  };

  const onMove = (opt: TPointerEventInfo<TPointerEvent>) => {
    if (!isDrawing || !arrow) return;
    const p = canvas.getScenePoint(opt.e);
    const end = snap(opt.e as MouseEvent, p.x, p.y);
    const path = arrow.path as unknown as Seg[];
    path[1][1] = end.x;
    path[1][2] = end.y;
    arrow._updateArrow();
    canvas.requestRenderAll();
  };

  const onUp = (opt: TPointerEventInfo<TPointerEvent>) => {
    if (!isDrawing || !arrow) return;
    isDrawing = false;
    const p = canvas.getScenePoint(opt.e);
    const end = snap(opt.e as MouseEvent, p.x, p.y);
    const path = arrow.path as unknown as Seg[];
    path[1][1] = end.x;
    path[1][2] = end.y;

    const dims = (arrow as unknown as { _calcDimensions(): { left: number; top: number; width: number; height: number } })._calcDimensions();
    arrow.set({
      left: dims.left,
      top: dims.top,
      width: dims.width,
      height: dims.height,
      pathOffset: { x: dims.width / 2 + dims.left, y: dims.height / 2 + dims.top },
      selectable: true,
      evented: true,
    });
    arrow._updateArrow();
    arrow.setCoords();
    canvas.setActiveObject(arrow);
    canvas.fire("object:modified", { target: arrow });
    canvas.requestRenderAll();
    arrow = null;
  };

  canvas.on("mouse:down", onDown);
  canvas.on("mouse:move", onMove);
  canvas.on("mouse:up", onUp);
}
