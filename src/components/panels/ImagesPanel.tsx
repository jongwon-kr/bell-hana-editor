import { useRef } from "react";
import { Upload } from "lucide-react";
import { useEditorStore } from "@/editor/store/editorStore";
import { addImageFromURL } from "@/editor/tools/shapeLibrary";

export function ImagesPanel() {
  const canvas = useEditorStore((s) => s.canvas);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList | null) => {
    if (!files || !canvas) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        if (url) addImageFromURL(canvas, url);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="panel">
      <h3 className="panel__title">이미지</h3>
      <p className="panel__hint">이미지를 업로드하여 캔버스에 추가합니다.</p>
      <button className="btn primary block" onClick={() => inputRef.current?.click()}>
        <Upload size={16} /> 이미지 업로드
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
