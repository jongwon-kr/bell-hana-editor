import type { Canvas, FabricObject } from "fabric";
import { fabric } from "../fabric";

const TYPE_LABELS: Record<string, string> = {
  ctextbox: "텍스트",
  polygon: "도형",
  ellipse: "원",
  circle: "원",
  triangle: "삼각형",
  rect: "사각형",
  image: "이미지",
  group: "그룹",
  curvedline: "선",
  arrow: "화살표",
  polypath: "다각형",
  path: "펜",
};

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** 새 객체에 "사각형 2"처럼 타입 기반 자동 라벨을 부여. */
export function assignObjectLabel(canvas: Canvas, obj: FabricObject) {
  if (obj.noFocusing || obj.label) return;

  const desc = (obj.type || "unknown").toLowerCase();
  const baseName = TYPE_LABELS[desc] || desc;

  const used = canvas
    .getObjects()
    .filter((o) => o.label && o.label.startsWith(baseName))
    .map((o) => {
      const re = new RegExp(`^${escapeRegExp(baseName)}(?: (\\d+))?$`);
      const m = o.label!.match(re);
      if (!m) return null;
      return m[1] ? parseInt(m[1], 10) : 1;
    })
    .filter((n): n is number => n !== null)
    .sort((a, b) => a - b);

  let next = 1;
  while (used.includes(next)) next++;

  obj.set({ label: used.length > 0 ? `${baseName} ${next}` : baseName });
}

/** 선택 가능한(잠금 아닌) 모든 객체를 선택. */
export function selectAllObjects(canvas: Canvas) {
  const objects = canvas.getObjects().filter((o) => !o.noFocusing && o.selectable);
  if (objects.length === 0) return;
  canvas.discardActiveObject();
  const selection = new fabric.ActiveSelection(objects, { canvas });
  canvas.setActiveObject(selection);
  canvas.requestRenderAll();
}

/** 활성 객체(들) 삭제. */
export function removeActiveObjects(canvas: Canvas) {
  const objects = canvas.getActiveObjects();
  if (objects.length === 0) return;
  objects.forEach((o) => canvas.remove(o));
  canvas.discardActiveObject();
  canvas.requestRenderAll();
  canvas.fire("object:modified");
}

/** 레이어 패널에 표시할 사용자 객체 목록(잠금 객체 제외). */
export function getUserObjects(canvas: Canvas): FabricObject[] {
  return canvas.getObjects().filter((o) => !o.noFocusing);
}
