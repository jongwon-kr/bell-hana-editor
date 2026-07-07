import { useEffect, type RefObject } from "react";
import { fabric, configureFabricDefaults } from "../fabric";
import { useEditorStore } from "../store/editorStore";
import { registerTools } from "../tools/registerTools";
import { assignObjectLabel } from "../core/objects";
import { fitZoom } from "../core/zoom";
import { DEFAULT_CANVAS, STORAGE_KEY } from "../core/constants";
import { loadCanvasJSON } from "../core/serialize";
import { generateUniqueId } from "../core/id";

/**
 * Fabric 캔버스를 생성하고 스토어/도구/이벤트를 연결하는 핵심 훅.
 * 컴포넌트 언마운트 시 dispose.
 */
export function useEditorCanvas(
  canvasElRef: RefObject<HTMLCanvasElement | null>,
  containerRef: RefObject<HTMLElement | null>
) {
  useEffect(() => {
    const el = canvasElRef.current;
    const container = containerRef.current;
    if (!el || !container) return;

    configureFabricDefaults();

    const canvas = new fabric.Canvas(el, {
      width: DEFAULT_CANVAS.width,
      height: DEFAULT_CANVAS.height,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,
      fireRightClick: true,
      stopContextMenu: true,
      selectionColor: "rgba(37, 99, 235, 0.15)",
      selectionBorderColor: "rgba(37, 99, 235, 0.8)",
      selectionLineWidth: 1,
    });
    canvas.originalW = DEFAULT_CANVAS.width;
    canvas.originalH = DEFAULT_CANVAS.height;

    const store = useEditorStore.getState();

    registerTools(canvas, {
      getTool: () => useEditorStore.getState().activeTool,
      setTool: (tool) => useEditorStore.getState().setActiveTool(tool),
      onZoom: (zoom) => useEditorStore.setState({ zoom }),
    });

    // 선택 동기화
    const syncSelection = () => {
      store.setActiveObject(canvas.getActiveObject() ?? null);
    };
    canvas.on("selection:created", syncSelection);
    canvas.on("selection:updated", syncSelection);
    canvas.on("selection:cleared", () => store.setActiveObject(null));

    // 라벨/레이어/히스토리
    canvas.on("object:added", (e) => {
      const obj = e.target;
      if (obj && !obj.label) assignObjectLabel(canvas, obj);
      useEditorStore.getState().refreshLayers();
    });
    canvas.on("object:removed", () => useEditorStore.getState().refreshLayers());
    canvas.on("object:modified", () => useEditorStore.getState().pushHistory());

    // 자유 그리기 결과에 id 부여 + 히스토리 기록
    canvas.on("path:created", (e) => {
      const path = (e as unknown as { path: fabric.FabricObject }).path;
      if (path && !path.id) path.id = generateUniqueId();
      canvas.fire("object:modified", { target: path });
    });

    store.attachCanvas(canvas);

    // 저장된 작업 복원
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) {
      loadCanvasJSON(canvas, saved).then(() => {
        useEditorStore.setState({
          canvasSize: { width: canvas.getWidth(), height: canvas.getHeight() },
        });
        useEditorStore.getState().refreshLayers();
      });
    }

    // 초기 화면 맞춤
    requestAnimationFrame(() => {
      const z = fitZoom(canvas, container);
      useEditorStore.setState({ zoom: z });
    });

    return () => {
      canvas.dispose();
      useEditorStore.setState({ canvas: null });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
