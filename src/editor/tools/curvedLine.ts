import type { Canvas, TPointerEventInfo, TPointerEvent } from "fabric";
import type { ToolId } from "../types";
import { CurvedLine } from "../fabric";
import { defaultShapeSettings } from "../core/constants";
import { generateUniqueId } from "../core/id";

type GetTool = () => ToolId;
type Seg = (string | number)[];

/** 드래그로 자유 곡선을 그리는 도구. 완성 후 곡선 스무딩 적용. */
export function installCurvedLineTool(canvas: Canvas, getTool: GetTool) {
  let isDrawing = false;
  let points: { x: number; y: number }[] = [];
  let preview: CurvedLine | null = null;

  const buildStraightPath = (): Seg[] =>
    points.map((p, i) => (i === 0 ? ["M", p.x, p.y] : ["L", p.x, p.y]));

  const onDown = (opt: TPointerEventInfo<TPointerEvent>) => {
    if (getTool() !== "curvedLine") return;
    isDrawing = true;
    const p = canvas.getScenePoint(opt.e);
    points = [{ x: p.x, y: p.y }];
  };

  const onMove = (opt: TPointerEventInfo<TPointerEvent>) => {
    if (!isDrawing) return;
    const p = canvas.getScenePoint(opt.e);
    const last = points[points.length - 1];
    if (Math.hypot(p.x - last.x, p.y - last.y) < 4) return;
    points.push({ x: p.x, y: p.y });

    if (preview) canvas.remove(preview);
    if (points.length >= 2) {
      preview = new CurvedLine(buildStraightPath(), {
        stroke: defaultShapeSettings.stroke,
        strokeWidth: defaultShapeSettings.strokeWidth,
        fill: "",
        strokeUniform: true,
        selectable: false,
        evented: false,
        objectCaching: false,
      });
      canvas.add(preview);
    }
    canvas.requestRenderAll();
  };

  const onUp = () => {
    if (!isDrawing) return;
    isDrawing = false;
    if (preview) canvas.remove(preview);
    preview = null;

    if (points.length < 2) {
      points = [];
      return;
    }

    const line = new CurvedLine(buildStraightPath(), {
      id: generateUniqueId(),
      stroke: defaultShapeSettings.stroke,
      strokeWidth: defaultShapeSettings.strokeWidth,
      fill: "",
      strokeUniform: true,
      selectable: true,
      evented: true,
      objectCaching: false,
    });
    canvas.add(line);
    line.smoothing(false);
    line.setCoords();
    canvas.setActiveObject(line);
    canvas.fire("object:modified", { target: line });
    canvas.requestRenderAll();
    points = [];
  };

  canvas.on("mouse:down", onDown);
  canvas.on("mouse:move", onMove);
  canvas.on("mouse:up", onUp);
}
