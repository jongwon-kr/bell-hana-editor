import type { Canvas, TPointerEventInfo, TPointerEvent } from "fabric";
import type { ToolId } from "../types";
import { fabric } from "../fabric";
import { defaultShapeSettings } from "../core/constants";
import { generateUniqueId } from "../core/id";

type GetTool = () => ToolId;
type ShapeTool = Extract<ToolId, "rect" | "ellipse" | "triangle">;

/**
 * 드래그로 사각형/타원/삼각형을 그리는 도구.
 * Shift 시 정비율(정사각형/원/정삼각형).
 */
export function installShapeDrawTools(canvas: Canvas, getTool: GetTool) {
  let isDrawing = false;
  let shape: fabric.FabricObject | null = null;
  let start = { x: 0, y: 0 };
  let current: ShapeTool | null = null;

  const isShapeTool = (t: ToolId): t is ShapeTool =>
    t === "rect" || t === "ellipse" || t === "triangle";

  const createShape = (tool: ShapeTool) => {
    const base = {
      id: generateUniqueId(),
      left: start.x,
      top: start.y,
      originX: "left" as const,
      originY: "top" as const,
      fill: "transparent",
      stroke: defaultShapeSettings.stroke,
      strokeWidth: defaultShapeSettings.strokeWidth,
      strokeUniform: true,
      selectable: false,
    };
    if (tool === "rect") return new fabric.Rect({ ...base, width: 0, height: 0 });
    if (tool === "triangle") return new fabric.Triangle({ ...base, width: 0, height: 0 });
    return new fabric.Ellipse({ ...base, rx: 0, ry: 0 });
  };

  const onDown = (opt: TPointerEventInfo<TPointerEvent>) => {
    const tool = getTool();
    if (!isShapeTool(tool)) return;
    isDrawing = true;
    current = tool;
    const p = canvas.getScenePoint(opt.e);
    start = { x: p.x, y: p.y };
    shape = createShape(tool);
    canvas.add(shape);
    canvas.requestRenderAll();
  };

  const onMove = (opt: TPointerEventInfo<TPointerEvent>) => {
    if (!isDrawing || !shape || !current) return;
    const p = canvas.getScenePoint(opt.e);
    const shift = (opt.e as MouseEvent).shiftKey;

    let width = Math.abs(p.x - start.x);
    let height = Math.abs(p.y - start.y);
    let left = Math.min(start.x, p.x);
    let top = Math.min(start.y, p.y);

    if (shift) {
      const side = Math.max(width, height);
      if (start.x > p.x) left = start.x - side;
      if (start.y > p.y) top = start.y - side;
      width = side;
      height = side;
    }

    if (current === "ellipse") {
      (shape as fabric.Ellipse).set({ left, top, rx: width / 2, ry: height / 2, width, height });
    } else {
      shape.set({ left, top, width, height });
    }
    canvas.requestRenderAll();
  };

  const onUp = () => {
    if (!isDrawing) return;
    isDrawing = false;
    if (shape) {
      const w = shape.width ?? 0;
      const h = shape.height ?? 0;
      if (w < 5 && h < 5) {
        canvas.remove(shape);
      } else {
        shape.set({ selectable: true, evented: true });
        shape.setCoords();
        canvas.setActiveObject(shape);
        canvas.fire("object:modified", { target: shape });
      }
    }
    canvas.requestRenderAll();
    shape = null;
    current = null;
  };

  canvas.on("mouse:down", onDown);
  canvas.on("mouse:move", onMove);
  canvas.on("mouse:up", onUp);
}
