import { ZoomIn, ZoomOut, Maximize2 } from "lucide-react";
import { useEditorStore } from "@/editor/store/editorStore";
import { fitZoom } from "@/editor/core/zoom";

export function Footer() {
  const zoom = useEditorStore((s) => s.zoom);
  const setZoom = useEditorStore((s) => s.setZoom);
  const canvas = useEditorStore((s) => s.canvas);

  const handleFit = () => {
    const holder = document.querySelector(".stage") as HTMLElement | null;
    if (canvas && holder) {
      const z = fitZoom(canvas, holder);
      useEditorStore.setState({ zoom: z });
    }
  };

  return (
    <footer className="footer">
      <div className="footer__zoom">
        <button className="icon-btn" title="축소" onClick={() => setZoom(zoom - 0.1)}>
          <ZoomOut size={16} />
        </button>
        <span className="footer__zoom-value">{Math.round(zoom * 100)}%</span>
        <button className="icon-btn" title="확대" onClick={() => setZoom(zoom + 0.1)}>
          <ZoomIn size={16} />
        </button>
        <button className="icon-btn" title="화면 맞춤" onClick={handleFit}>
          <Maximize2 size={16} />
        </button>
      </div>
      <div className="footer__hint">Ctrl+휠: 확대/축소 · 더블클릭: 선/다각형 점 편집</div>
    </footer>
  );
}
