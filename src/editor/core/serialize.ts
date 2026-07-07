import type { Canvas, TMat2D } from "fabric";
import { fabric, SERIALIZED_PROPS } from "../fabric";

/** 캔버스를 직렬화(뷰포트/크기 포함)하여 JSON 문자열로 반환. */
export function getCanvasJSON(canvas: Canvas): string {
  const json = canvas.toObject([...SERIALIZED_PROPS]) as Record<string, unknown>;
  json.viewportTransform = canvas.viewportTransform;
  json.width = canvas.getWidth();
  json.height = canvas.getHeight();
  return JSON.stringify(json);
}

/** 히스토리/저장용 스냅샷 객체. noFocusing 잠금 객체는 배경 오버레이만 유지. */
export function getCanvasSnapshot(canvas: Canvas): string {
  const json = canvas.toObject([...SERIALIZED_PROPS]) as Record<string, unknown>;
  json.viewportTransform = canvas.viewportTransform;
  json.width = canvas.getWidth();
  json.height = canvas.getHeight();
  const objects = json.objects as Array<Record<string, unknown>> | undefined;
  if (objects) {
    json.objects = objects.filter((o) => !o.noFocusing);
  }
  return JSON.stringify(json);
}

/** JSON 문자열을 캔버스에 로드하고 뷰포트/크기를 복원. */
export async function loadCanvasJSON(canvas: Canvas, jsonStr: string): Promise<void> {
  if (!jsonStr) return;
  const parsed = JSON.parse(jsonStr) as Record<string, unknown>;

  const vpt = ((parsed.viewportTransform as number[]) || [1, 0, 0, 1, 0, 0]) as TMat2D;
  const width = (parsed.width as number) || canvas.getWidth();
  const height = (parsed.height as number) || canvas.getHeight();

  await canvas.loadFromJSON(parsed);

  canvas.setDimensions({ width, height });
  canvas.originalW = width / (vpt[0] || 1);
  canvas.originalH = height / (vpt[3] || 1);
  canvas.setViewportTransform(vpt);

  canvas.getObjects().forEach((obj) => {
    if (obj.noFocusing) {
      obj.selectable = false;
      obj.evented = false;
    }
  });

  const bg = parsed.backgroundImage as { src?: string; scaleX?: number; scaleY?: number } | undefined;
  if (bg?.src) {
    const img = await fabric.FabricImage.fromURL(bg.src, { crossOrigin: "anonymous" });
    img.set({ scaleX: bg.scaleX || 1, scaleY: bg.scaleY || 1, left: 0, top: 0 });
    canvas.backgroundImage = img;
  }

  canvas.renderAll();
}
