import { Minus, Plus } from "lucide-react";

interface NumberInputProps {
  label?: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

/** 증감 버튼이 있는 숫자 입력(기존 custom-number-input 대체). */
export function NumberInput({ label, value, min, max, step = 1, onChange }: NumberInputProps) {
  const clamp = (v: number) => {
    if (min != null && v < min) v = min;
    if (max != null && v > max) v = max;
    return Number(v.toFixed(2));
  };

  return (
    <div className="input-row">
      {label && <label>{label}</label>}
      <div className="number-input">
        <button type="button" className="icon-btn sm" onClick={() => onChange(clamp(value - step))}>
          <Minus size={14} />
        </button>
        <input
          type="number"
          value={value}
          min={min}
          max={max}
          step={step}
          onChange={(e) => onChange(clamp(parseFloat(e.target.value) || 0))}
        />
        <button type="button" className="icon-btn sm" onClick={() => onChange(clamp(value + step))}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}
