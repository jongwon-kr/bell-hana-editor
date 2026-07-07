import { create } from "zustand";
import type { Canvas, FabricObject } from "fabric";
import type { CanvasSize, LayerItem, ToolId } from "../types";
import { History } from "../core/history";
import { getCanvasSnapshot, loadCanvasJSON } from "../core/serialize";
import { getUserObjects } from "../core/objects";
import { applyToolMode, type BrushSettings } from "../tools/mode";
import { applyZoom } from "../core/zoom";
import { DEFAULT_CANVAS } from "../core/constants";

interface EditorState {
  canvas: Canvas | null;
  history: History;
  isRestoring: boolean;

  activeTool: ToolId;
  activeObject: FabricObject | null;
  selectionType: string | null;
  zoom: number;
  canvasSize: CanvasSize;
  canUndo: boolean;
  canRedo: boolean;
  layers: LayerItem[];
  brush: BrushSettings;

  attachCanvas: (canvas: Canvas) => void;
  setActiveTool: (tool: ToolId) => void;
  setActiveObject: (obj: FabricObject | null) => void;
  pushHistory: () => void;
  undo: () => Promise<void>;
  redo: () => Promise<void>;
  refreshLayers: () => void;
  setZoom: (zoom: number) => void;
  setCanvasSize: (size: CanvasSize) => void;
  setBrush: (patch: Partial<BrushSettings>) => void;
  clearCanvas: () => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  canvas: null,
  history: new History(),
  isRestoring: false,

  activeTool: "select",
  activeObject: null,
  selectionType: null,
  zoom: 1,
  canvasSize: { ...DEFAULT_CANVAS },
  canUndo: false,
  canRedo: false,
  layers: [],
  brush: { color: "#111827", size: 8 },

  attachCanvas: (canvas) => {
    set({ canvas, canvasSize: { width: canvas.getWidth(), height: canvas.getHeight() } });
    const snap = getCanvasSnapshot(canvas);
    get().history.push(snap);
    get().refreshLayers();
  },

  setActiveTool: (tool) => {
    const { canvas, brush } = get();
    if (canvas) applyToolMode(canvas, tool, brush);
    if (tool !== "select") set({ activeObject: null, selectionType: null });
    set({ activeTool: tool });
  },

  setActiveObject: (obj) => {
    set({ activeObject: obj, selectionType: obj ? obj.type ?? null : null });
  },

  pushHistory: () => {
    const { canvas, history, isRestoring } = get();
    if (!canvas || isRestoring) return;
    history.push(getCanvasSnapshot(canvas));
    set({ canUndo: history.canUndo(), canRedo: history.canRedo() });
    get().refreshLayers();
  },

  undo: async () => {
    const { canvas, history } = get();
    if (!canvas || !history.canUndo()) return;
    const state = history.undo();
    if (state == null) return;
    set({ isRestoring: true });
    await loadCanvasJSON(canvas, state);
    set({
      isRestoring: false,
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      activeObject: null,
      selectionType: null,
    });
    get().refreshLayers();
  },

  redo: async () => {
    const { canvas, history } = get();
    if (!canvas || !history.canRedo()) return;
    const state = history.redo();
    if (state == null) return;
    set({ isRestoring: true });
    await loadCanvasJSON(canvas, state);
    set({
      isRestoring: false,
      canUndo: history.canUndo(),
      canRedo: history.canRedo(),
      activeObject: null,
      selectionType: null,
    });
    get().refreshLayers();
  },

  refreshLayers: () => {
    const { canvas } = get();
    if (!canvas) return;
    const layers: LayerItem[] = getUserObjects(canvas)
      .slice()
      .reverse()
      .map((o) => ({
        id: o.id ?? "",
        label: o.label ?? o.type ?? "객체",
        type: o.type ?? "object",
        visible: o.visible ?? true,
        locked: !o.selectable,
      }));
    set({ layers });
  },

  setZoom: (zoom) => {
    const { canvas } = get();
    if (!canvas) return;
    const applied = applyZoom(canvas, zoom);
    set({ zoom: applied });
  },

  setCanvasSize: (size) => {
    const { canvas } = get();
    if (!canvas) return;
    canvas.setDimensions({ width: size.width, height: size.height });
    canvas.originalW = size.width;
    canvas.originalH = size.height;
    canvas.requestRenderAll();
    set({ canvasSize: size });
    get().pushHistory();
  },

  setBrush: (patch) => {
    const brush = { ...get().brush, ...patch };
    set({ brush });
    const { canvas, activeTool } = get();
    if (canvas && activeTool === "draw" && canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.color = brush.color;
      canvas.freeDrawingBrush.width = brush.size;
    }
  },

  clearCanvas: () => {
    const { canvas, history } = get();
    if (!canvas) return;
    canvas.clear();
    canvas.backgroundColor = "#ffffff";
    canvas.originalW = DEFAULT_CANVAS.width;
    canvas.originalH = DEFAULT_CANVAS.height;
    canvas.setViewportTransform([1, 0, 0, 1, 0, 0]);
    canvas.setDimensions({ width: DEFAULT_CANVAS.width, height: DEFAULT_CANVAS.height });
    canvas.requestRenderAll();
    history.clear();
    history.push(getCanvasSnapshot(canvas));
    set({
      canvasSize: { ...DEFAULT_CANVAS },
      activeObject: null,
      selectionType: null,
      canUndo: false,
      canRedo: false,
    });
    get().refreshLayers();
  },
}));
