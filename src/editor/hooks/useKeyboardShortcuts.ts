import { useEffect } from "react";
import { useEditorStore } from "../store/editorStore";
import { removeActiveObjects, selectAllObjects } from "../core/objects";
import { copyActive, pasteClipboard, duplicateActive } from "../core/clipboard";
import { getCanvasSnapshot } from "../core/serialize";
import { STORAGE_KEY } from "../core/constants";
import type { ToolId } from "../types";

const ALT_TOOL_MAP: Record<string, ToolId> = {
  s: "select",
  h: "hand",
  "1": "ellipse",
  "2": "triangle",
  "3": "rect",
  "4": "shapes",
  "5": "draw",
  "6": "curvedLine",
  "7": "arrow",
  "8": "polypath",
  t: "ctextbox",
};

function isTyping() {
  const el = document.activeElement;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || (el as HTMLElement).isContentEditable);
}

/** 전역 키보드 단축키(undo/redo, 삭제, 이동, 복사/붙여넣기, 도구 전환, 저장). */
export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const store = useEditorStore.getState();
      const canvas = store.canvas;
      if (!canvas) return;

      const ctrl = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      // 편집 중 텍스트 입력은 방해하지 않음
      if (isTyping()) {
        if (ctrl && key === "s") {
          e.preventDefault();
          window.localStorage.setItem(STORAGE_KEY, getCanvasSnapshot(canvas));
        }
        return;
      }

      if (ctrl && key === "z") {
        e.preventDefault();
        void store.undo();
        return;
      }
      if (ctrl && (key === "y" || (key === "z" && e.shiftKey))) {
        e.preventDefault();
        void store.redo();
        return;
      }
      if (ctrl && key === "a") {
        e.preventDefault();
        selectAllObjects(canvas);
        return;
      }
      if (ctrl && key === "c") {
        e.preventDefault();
        void copyActive(canvas);
        return;
      }
      if (ctrl && key === "v") {
        e.preventDefault();
        void pasteClipboard(canvas);
        return;
      }
      if (ctrl && key === "d") {
        e.preventDefault();
        void duplicateActive(canvas);
        return;
      }
      if (ctrl && key === "s") {
        e.preventDefault();
        window.localStorage.setItem(STORAGE_KEY, getCanvasSnapshot(canvas));
        return;
      }

      if (key === "delete" || key === "backspace") {
        e.preventDefault();
        removeActiveObjects(canvas);
        return;
      }

      // 화살표 키로 1px 이동
      const active = canvas.getActiveObject();
      if (active && ["arrowleft", "arrowright", "arrowup", "arrowdown"].includes(key)) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        if (key === "arrowleft") active.left -= step;
        if (key === "arrowright") active.left += step;
        if (key === "arrowup") active.top -= step;
        if (key === "arrowdown") active.top += step;
        active.setCoords();
        canvas.fire("object:modified", { target: active });
        canvas.requestRenderAll();
        return;
      }

      // Alt + 키로 도구 전환
      if (e.altKey && ALT_TOOL_MAP[key]) {
        e.preventDefault();
        store.setActiveTool(ALT_TOOL_MAP[key]);
      }
    };

    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);
}
