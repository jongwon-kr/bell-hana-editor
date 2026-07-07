import type { Canvas } from "fabric";
import { fabric } from "../fabric";

/** 현재 활성 다중 선택을 하나의 Group으로 묶는다. */
export function groupObjects(canvas: Canvas) {
  const active = canvas.getActiveObject();
  if (!active || active.type !== "activeselection") return;

  const selection = active as fabric.ActiveSelection;
  const group = new fabric.Group(selection.removeAll(), {});
  canvas.add(group);
  canvas.setActiveObject(group);
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: group });
}

/** 선택된 Group을 해제하여 개별 객체로 되돌린다. */
export function ungroupObjects(canvas: Canvas) {
  const active = canvas.getActiveObject();
  if (!active || active.type !== "group") return;

  const group = active as fabric.Group;
  const items = group.removeAll();
  canvas.remove(group);
  items.forEach((item) => canvas.add(item));

  const selection = new fabric.ActiveSelection(items, { canvas });
  canvas.setActiveObject(selection);
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: selection });
}
