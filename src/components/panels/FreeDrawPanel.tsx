import { useEditorStore } from "@/editor/store/editorStore";
import { ColorPicker } from "@/components/common/ColorPicker";
import { NumberInput } from "@/components/common/NumberInput";

export function FreeDrawPanel() {
  const brush = useEditorStore((s) => s.brush);
  const setBrush = useEditorStore((s) => s.setBrush);

  return (
    <div className="panel">
      <h3 className="panel__title">펜 설정</h3>
      <p className="panel__hint">드래그하여 자유롭게 그립니다.</p>
      <ColorPicker label="펜 색상" value={brush.color} onChange={(c) => setBrush({ color: c })} />
      <NumberInput
        label="굵기"
        value={brush.size}
        min={1}
        max={100}
        onChange={(v) => setBrush({ size: v })}
      />
    </div>
  );
}
