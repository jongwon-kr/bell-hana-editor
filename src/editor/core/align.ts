import type { Canvas, FabricObject } from "fabric";
import type { AlignPosition } from "../types";

/**
 * 활성 객체를 캔버스 기준으로 정렬.
 * ActiveSelection(다중 선택)의 경우 선택 그룹 내부 기준으로 정렬한다.
 */
export function alignObject(
  canvas: Canvas,
  target: FabricObject | null,
  position: AlignPosition
) {
  if (!target) return;

  const isSelection = target.type === "activeselection";
  const objects = isSelection ? (target as unknown as { getObjects(): FabricObject[] }).getObjects() : [target];

  const bounds = isSelection
    ? { left: -target.width / 2, top: -target.height / 2, width: target.width, height: target.height }
    : { left: 0, top: 0, width: canvas.getWidth(), height: canvas.getHeight() };

  objects.forEach((obj) => {
    const w = obj.getScaledWidth();
    const h = obj.getScaledHeight();
    const originOffsetX = obj.originX === "center" ? 0 : w / 2;
    const originOffsetY = obj.originY === "center" ? 0 : h / 2;

    switch (position) {
      case "left":
        obj.set({ left: bounds.left + (obj.originX === "center" ? w / 2 : 0) });
        break;
      case "center-h":
        obj.set({ left: bounds.left + bounds.width / 2 - (obj.originX === "center" ? 0 : w / 2) });
        break;
      case "right":
        obj.set({ left: bounds.left + bounds.width - (obj.originX === "center" ? w / 2 : w) });
        break;
      case "top":
        obj.set({ top: bounds.top + (obj.originY === "center" ? h / 2 : 0) });
        break;
      case "center-v":
        obj.set({ top: bounds.top + bounds.height / 2 - (obj.originY === "center" ? 0 : h / 2) });
        break;
      case "bottom":
        obj.set({ top: bounds.top + bounds.height - (obj.originY === "center" ? h / 2 : h) });
        break;
    }
    void originOffsetX;
    void originOffsetY;
    obj.setCoords();
  });

  canvas.requestRenderAll();
  canvas.fire("object:modified", { target });
}
