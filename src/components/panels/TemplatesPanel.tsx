import { useEditorStore } from "@/editor/store/editorStore";

interface Preset {
  label: string;
  width: number;
  height: number;
}

/** 범용 플랫폼용 캔버스 사이즈 프리셋(포트폴리오/프레젠테이션/SNS 등). */
const PRESETS: Preset[] = [
  { label: "프레젠테이션 16:9", width: 1280, height: 720 },
  { label: "와이드 FHD", width: 1920, height: 1080 },
  { label: "포스터 A4 세로", width: 794, height: 1123 },
  { label: "인스타그램 정사각", width: 1080, height: 1080 },
  { label: "인스타 스토리 9:16", width: 1080, height: 1920 },
  { label: "유튜브 썸네일", width: 1280, height: 720 },
  { label: "명함", width: 1004, height: 650 },
];

export function TemplatesPanel() {
  const setCanvasSize = useEditorStore((s) => s.setCanvasSize);

  return (
    <div className="panel">
      <h3 className="panel__title">템플릿 / 캔버스 프리셋</h3>
      <p className="panel__hint">용도별 캔버스 크기를 선택하세요.</p>
      <div className="preset-list">
        {PRESETS.map((p) => (
          <button
            key={p.label}
            className="preset-item"
            onClick={() => setCanvasSize({ width: p.width, height: p.height })}
          >
            <span className="preset-item__label">{p.label}</span>
            <span className="preset-item__dim">
              {p.width} × {p.height}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
