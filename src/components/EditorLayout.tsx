import { useState } from "react";
import { Toolbar } from "./Toolbar";
import { LeftPanel } from "./LeftPanel";
import { CanvasStage } from "./CanvasStage";
import { RightPanel } from "./RightPanel";
import { Footer } from "./Footer";
import { DownloadModal } from "./DownloadModal";
import { useEditorStore } from "@/editor/store/editorStore";
import { useKeyboardShortcuts } from "@/editor/hooks/useKeyboardShortcuts";
import type { ActionId } from "@/editor/types";

export function EditorLayout() {
  const [showDownload, setShowDownload] = useState(false);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const clearCanvas = useEditorStore((s) => s.clearCanvas);

  useKeyboardShortcuts();

  const handleAction = (action: ActionId) => {
    switch (action) {
      case "undo":
        void undo();
        break;
      case "redo":
        void redo();
        break;
      case "download":
        setShowDownload(true);
        break;
      case "clear":
        if (window.confirm("캔버스를 초기화하시겠습니까?")) clearCanvas();
        break;
      case "fullscreen":
        if (document.fullscreenElement) document.exitFullscreen();
        else document.documentElement.requestFullscreen();
        break;
      case "help":
        break;
    }
  };

  return (
    <div className="editor">
      <Toolbar onAction={handleAction} />
      <LeftPanel />
      <main className="editor__main">
        <CanvasStage />
        <Footer />
      </main>
      <RightPanel />
      {showDownload && <DownloadModal onClose={() => setShowDownload(false)} />}
    </div>
  );
}
