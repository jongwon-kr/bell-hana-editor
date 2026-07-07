import type { Canvas } from "fabric";

export type ExportFormat = "png" | "jpg" | "svg";

/** 캔버스를 지정 포맷으로 내보내 파일 다운로드. html2canvas 의존성 제거(fabric 내장 사용). */
export function downloadCanvas(canvas: Canvas, filename: string, format: ExportFormat) {
  const link = document.createElement("a");
  link.download = `${filename}.${format}`;

  if (format === "svg") {
    const svg = canvas.toSVG();
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    link.href = URL.createObjectURL(blob);
  } else {
    link.href = canvas.toDataURL({
      format: format === "jpg" ? "jpeg" : "png",
      multiplier: 1,
    });
  }

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (format === "svg") {
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  }
}

/** 미리보기용 데이터 URL 생성. */
export function getPreviewDataURL(canvas: Canvas): string {
  return canvas.toDataURL({ format: "png", multiplier: 0.5 });
}
