import { useRef } from "react";
import { useEditorCanvas } from "@/editor/hooks/useEditorCanvas";

/** 캔버스를 렌더링하고 Fabric 인스턴스를 초기화하는 스테이지 영역. */
export function CanvasStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasElRef = useRef<HTMLCanvasElement>(null);

  useEditorCanvas(canvasElRef, containerRef);

  return (
    <div className="stage" ref={containerRef}>
      <div className="stage__canvas-holder">
        <canvas ref={canvasElRef} />
      </div>
    </div>
  );
}
