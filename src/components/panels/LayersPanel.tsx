import { Eye, EyeOff, ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { useEditorStore } from "@/editor/store/editorStore";

/** 레이어 목록: 선택 / 표시 토글 / 순서 변경 / 삭제. */
export function LayersPanel() {
  const layers = useEditorStore((s) => s.layers);
  const canvas = useEditorStore((s) => s.canvas);
  const activeObject = useEditorStore((s) => s.activeObject);

  const findObj = (id: string) => canvas?.getObjects().find((o) => o.id === id) ?? null;

  const selectLayer = (id: string) => {
    if (!canvas) return;
    const obj = findObj(id);
    if (!obj || !obj.selectable) return;
    canvas.setActiveObject(obj);
    canvas.requestRenderAll();
    useEditorStore.getState().setActiveTool("select");
  };

  const toggleVisible = (id: string) => {
    if (!canvas) return;
    const obj = findObj(id);
    if (!obj) return;
    obj.visible = !obj.visible;
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: obj });
  };

  const move = (id: string, dir: "up" | "down") => {
    if (!canvas) return;
    const obj = findObj(id);
    if (!obj) return;
    dir === "up" ? canvas.bringObjectForward(obj) : canvas.sendObjectBackwards(obj);
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: obj });
  };

  const remove = (id: string) => {
    if (!canvas) return;
    const obj = findObj(id);
    if (!obj) return;
    canvas.remove(obj);
    canvas.discardActiveObject();
    canvas.requestRenderAll();
    canvas.fire("object:modified");
  };

  return (
    <div className="panel layers">
      <h3 className="panel__title">레이어</h3>
      {layers.length === 0 && <p className="panel__hint">아직 객체가 없습니다.</p>}
      <ul className="layer-list">
        {layers.map((layer) => (
          <li
            key={layer.id}
            className={`layer-item${activeObject?.id === layer.id ? " active" : ""}`}
            onClick={() => selectLayer(layer.id)}
          >
            <button
              className="icon-btn sm"
              title="표시/숨김"
              onClick={(e) => {
                e.stopPropagation();
                toggleVisible(layer.id);
              }}
            >
              {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
            <span className="layer-item__label">{layer.label}</span>
            <span className="layer-item__actions">
              <button className="icon-btn sm" title="앞으로" onClick={(e) => { e.stopPropagation(); move(layer.id, "up"); }}>
                <ChevronUp size={14} />
              </button>
              <button className="icon-btn sm" title="뒤로" onClick={(e) => { e.stopPropagation(); move(layer.id, "down"); }}>
                <ChevronDown size={14} />
              </button>
              <button className="icon-btn sm danger" title="삭제" onClick={(e) => { e.stopPropagation(); remove(layer.id); }}>
                <Trash2 size={14} />
              </button>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
