import { useEditorStore } from "@/editor/store/editorStore";
import { SelectionPanel } from "./panels/SelectionPanel";
import { LayersPanel } from "./panels/LayersPanel";

/** 우측 사이드바: 선택된 개체가 있으면 설정 패널, 항상 레이어 패널 표시. */
export function RightPanel() {
  const activeObject = useEditorStore((s) => s.activeObject);

  return (
    <div className="sidebar right">
      {activeObject && <SelectionPanel />}
      <LayersPanel />
    </div>
  );
}
