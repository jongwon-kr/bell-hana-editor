import { useEditorStore } from "@/editor/store/editorStore";
import { ShapesPanel } from "./panels/ShapesPanel";
import { FreeDrawPanel } from "./panels/FreeDrawPanel";
import { ImagesPanel } from "./panels/ImagesPanel";
import { TemplatesPanel } from "./panels/TemplatesPanel";
import { BackgroundPanel } from "./panels/BackgroundPanel";

/** 현재 도구에 따라 좌측 보조 패널을 표시. 해당 없으면 렌더링하지 않음. */
export function LeftPanel() {
  const tool = useEditorStore((s) => s.activeTool);

  switch (tool) {
    case "shapes":
      return <div className="sidebar left"><ShapesPanel /></div>;
    case "draw":
      return <div className="sidebar left"><FreeDrawPanel /></div>;
    case "images":
      return <div className="sidebar left"><ImagesPanel /></div>;
    case "templates":
      return <div className="sidebar left"><TemplatesPanel /></div>;
    case "background":
      return <div className="sidebar left"><BackgroundPanel /></div>;
    default:
      return null;
  }
}
