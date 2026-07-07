import { useState } from "react";
import { X } from "lucide-react";
import { useEditorStore } from "@/editor/store/editorStore";
import { downloadCanvas, getPreviewDataURL, type ExportFormat } from "@/editor/core/download";

interface DownloadModalProps {
  onClose: () => void;
}

const FORMATS: ExportFormat[] = ["png", "jpg", "svg"];

export function DownloadModal({ onClose }: DownloadModalProps) {
  const canvas = useEditorStore((s) => s.canvas);
  const [filename, setFilename] = useState("canvas-export");
  const [format, setFormat] = useState<ExportFormat>("png");
  const preview = canvas ? getPreviewDataURL(canvas) : "";

  const handleDownload = () => {
    if (!canvas || !filename.trim()) return;
    downloadCanvas(canvas, filename.trim(), format);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <h3>파일 내보내기</h3>
          <button className="icon-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="modal__body">
          <div className="modal__preview">
            {preview && <img src={preview} alt="미리보기" />}
          </div>
          <div className="modal__options">
            <label>파일 이름</label>
            <input value={filename} onChange={(e) => setFilename(e.target.value)} />
            <label>형식</label>
            <div className="format-toggle">
              {FORMATS.map((f) => (
                <button key={f} className={`btn${format === f ? " primary" : ""}`} onClick={() => setFormat(f)}>
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal__footer">
          <button className="btn primary" onClick={handleDownload}>다운로드</button>
        </div>
      </div>
    </div>
  );
}
