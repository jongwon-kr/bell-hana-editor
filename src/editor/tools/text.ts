import type { Canvas, TPointerEventInfo, TPointerEvent } from "fabric";
import type { ToolId } from "../types";
import { CTextBox } from "../fabric";
import { generateUniqueId } from "../core/id";

type GetTool = () => ToolId;
type SetTool = (tool: ToolId) => void;

/** 클릭한 위치에 텍스트 박스를 생성하고 편집 모드로 진입. */
export function installTextTool(canvas: Canvas, getTool: GetTool, setTool: SetTool) {
  const onDown = (opt: TPointerEventInfo<TPointerEvent>) => {
    if (getTool() !== "ctextbox") return;
    if (opt.target) return; // 기존 객체 클릭 시 생성 안 함

    const p = canvas.getScenePoint(opt.e);
    const textbox = new CTextBox("텍스트를 입력하세요", {
      id: generateUniqueId(),
      left: p.x,
      top: p.y,
      fontSize: 32,
      fill: "#111827",
      fontFamily: "Pretendard",
      originX: "left",
      originY: "top",
      editable: true,
    });
    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    setTool("select");
    textbox.enterEditing();
    textbox.selectAll();
    canvas.fire("object:modified", { target: textbox });
    canvas.requestRenderAll();
  };

  canvas.on("mouse:down", onDown);
}
