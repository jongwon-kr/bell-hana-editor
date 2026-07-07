import type { Canvas } from "fabric";
import type { ToolId } from "../types";
import { installShapeDrawTools } from "./shapeDraw";
import { installArrowTool } from "./arrow";
import { installCurvedLineTool } from "./curvedLine";
import { installPolyPathTool } from "./polyPath";
import { installTextTool } from "./text";
import { installPanAndZoom } from "./pan";

interface ToolHandlers {
  getTool: () => ToolId;
  setTool: (tool: ToolId) => void;
  onZoom: (zoom: number) => void;
}

/** 모든 드로잉/상호작용 도구 핸들러를 캔버스에 1회 등록. */
export function registerTools(canvas: Canvas, handlers: ToolHandlers) {
  const { getTool, setTool, onZoom } = handlers;
  installShapeDrawTools(canvas, getTool);
  installArrowTool(canvas, getTool);
  installCurvedLineTool(canvas, getTool);
  installPolyPathTool(canvas, getTool);
  installTextTool(canvas, getTool, setTool);
  installPanAndZoom(canvas, getTool, onZoom);
}
