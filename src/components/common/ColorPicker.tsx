import { useEffect, useRef, useState } from "react";
import { RgbaStringColorPicker } from "react-colorful";
import { Pipette } from "lucide-react";
import { pickColor, isEyeDropperSupported } from "@/editor/core/eyedropper";

interface ColorPickerProps {
  label?: string;
  value: string;
  onChange: (color: string) => void;
}

/** react-colorful 기반 색상 선택기 팝오버 + 브라우저 내장 스포이트. */
export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const handleEyedrop = async () => {
    const color = await pickColor();
    if (color) onChange(color);
  };

  return (
    <div className="color-field" ref={ref}>
      {label && <label>{label}</label>}
      <div className="color-field__controls">
        <button
          type="button"
          className="color-swatch"
          style={{ background: value || "transparent" }}
          onClick={() => setOpen((v) => !v)}
          aria-label="색상 선택"
        />
        {isEyeDropperSupported() && (
          <button type="button" className="icon-btn sm" title="스포이트" onClick={handleEyedrop}>
            <Pipette size={14} />
          </button>
        )}
      </div>
      {open && (
        <div className="color-popover">
          <RgbaStringColorPicker color={toRgba(value)} onChange={onChange} />
          <input
            className="color-hex"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
          />
        </div>
      )}
    </div>
  );
}

/** 임의 색 문자열을 react-colorful가 이해하는 rgba 문자열로 정규화. */
function toRgba(value: string): string {
  if (!value || value === "transparent") return "rgba(0,0,0,0)";
  return value;
}
