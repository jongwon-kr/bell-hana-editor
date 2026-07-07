import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { useEditorStore } from "@/editor/store/editorStore";
import { ColorPicker } from "@/components/common/ColorPicker";
import { NumberInput } from "@/components/common/NumberInput";
import { fabric } from "@/editor/fabric";

/** 캔버스 크기 / 배경색 / 배경 이미지 설정. (기상 주제도/backMap 기능 제거됨) */
export function BackgroundPanel() {
  const canvas = useEditorStore((s) => s.canvas);
  const canvasSize = useEditorStore((s) => s.canvasSize);
  const setCanvasSize = useEditorStore((s) => s.setCanvasSize);
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const inputRef = useRef<HTMLInputElement>(null);

  const applyBgColor = (color: string) => {
    setBgColor(color);
    if (!canvas) return;
    canvas.backgroundColor = color;
    canvas.requestRenderAll();
    canvas.fire("object:modified");
  };

  const handleBgImage = (files: FileList | null) => {
    if (!files?.[0] || !canvas) return;
    const reader = new FileReader();
    reader.onload = async (e) => {
      const url = e.target?.result as string;
      const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
      const scaleX = canvas.getWidth() / (img.width || 1);
      const scaleY = canvas.getHeight() / (img.height || 1);
      img.set({ scaleX, scaleY, left: 0, top: 0 });
      canvas.backgroundImage = img;
      canvas.requestRenderAll();
      canvas.fire("object:modified");
    };
    reader.readAsDataURL(files[0]);
  };

  const removeBgImage = () => {
    if (!canvas) return;
    canvas.backgroundImage = undefined;
    canvas.requestRenderAll();
    canvas.fire("object:modified");
  };

  return (
    <div className="panel">
      <h3 className="panel__title">캔버스 설정</h3>

      <div className="panel__section">
        <h4>캔버스 크기</h4>
        <NumberInput
          label="너비"
          value={canvasSize.width}
          min={100}
          step={10}
          onChange={(w) => setCanvasSize({ ...canvasSize, width: w })}
        />
        <NumberInput
          label="높이"
          value={canvasSize.height}
          min={100}
          step={10}
          onChange={(h) => setCanvasSize({ ...canvasSize, height: h })}
        />
      </div>

      <div className="panel__section">
        <h4>배경</h4>
        <ColorPicker label="배경 색상" value={bgColor} onChange={applyBgColor} />
        <button className="btn block" onClick={() => inputRef.current?.click()}>
          <Upload size={16} /> 배경 이미지 첨부
        </button>
        <button className="btn ghost block" onClick={removeBgImage}>
          배경 이미지 제거
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => handleBgImage(e.target.files)}
        />
      </div>
    </div>
  );
}
