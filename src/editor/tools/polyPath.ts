import type { Canvas, TPointerEventInfo, TPointerEvent } from "fabric";
import type { ToolId } from "../types";
import { PolyPath, fabric } from "../fabric";
import { defaultShapeSettings } from "../core/constants";
import { generateUniqueId } from "../core/id";

type GetTool = () => ToolId;
type Seg = (string | number)[];

/**
 * 클릭으로 점을 배치하여 다각형/폴리라인을 그리는 도구.
 * 더블클릭 또는 Esc로 완성. 시작점 근처 클릭 시 닫힌 도형.
 */
export function installPolyPathTool(canvas: Canvas, getTool: GetTool) {
  let points: { x: number; y: number }[] = [];
  let preview: fabric.Polyline | null = null;

  const clearPreview = () => {
    if (preview) {
      canvas.remove(preview);
      preview = null;
    }
  };

  const renderPreview = () => {
    clearPreview();
    if (points.length < 1) return;
    preview = new fabric.Polyline(points, {
      stroke: defaultShapeSettings.stroke,
      strokeWidth: defaultShapeSettings.strokeWidth,
      fill: "transparent",
      strokeUniform: true,
      selectable: false,
      evented: false,
      objectCaching: false,
    });
    canvas.add(preview);
    canvas.requestRenderAll();
  };

  const finish = (closed: boolean) => {
    clearPreview();
    if (points.length < 2) {
      points = [];
      return;
    }
    const path: Seg[] = points.map((p, i) => (i === 0 ? ["M", p.x, p.y] : ["L", p.x, p.y]));
    if (closed) path.push(["Z"]);

    const poly = new PolyPath(path, {
      id: generateUniqueId(),
      stroke: defaultShapeSettings.stroke,
      strokeWidth: defaultShapeSettings.strokeWidth,
      fill: closed ? "transparent" : "",
      strokeUniform: true,
      selectable: true,
      evented: true,
      objectCaching: false,
    });
    canvas.add(poly);
    poly.setCoords();
    canvas.setActiveObject(poly);
    canvas.fire("object:modified", { target: poly });
    canvas.requestRenderAll();
    points = [];
  };

  const onDown = (opt: TPointerEventInfo<TPointerEvent>) => {
    if (getTool() !== "polypath") return;
    const p = canvas.getScenePoint(opt.e);

    if (points.length >= 1) {
      const first = points[0];
      if (Math.hypot(p.x - first.x, p.y - first.y) < 10) {
        finish(true);
        return;
      }
    }
    points.push({ x: p.x, y: p.y });
    renderPreview();
  };

  const onDblClick = () => {
    if (getTool() !== "polypath") return;
    finish(false);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (getTool() !== "polypath") return;
    if (e.key === "Escape") finish(false);
  };

  canvas.on("mouse:down", onDown);
  canvas.on("mouse:dblclick", onDblClick);
  document.addEventListener("keydown", onKeyDown);
}
