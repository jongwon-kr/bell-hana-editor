import type { Canvas, FabricObject } from "fabric";

let clipboard: FabricObject | null = null;

/** 활성 객체를 내부 클립보드에 복사. */
export async function copyActive(canvas: Canvas) {
  const active = canvas.getActiveObject();
  if (!active) return;
  clipboard = await active.clone();
}

/** 클립보드 객체를 약간 오프셋하여 붙여넣기. */
export async function pasteClipboard(canvas: Canvas) {
  if (!clipboard) return;
  const cloned = await clipboard.clone();
  canvas.discardActiveObject();
  cloned.set({
    left: (cloned.left ?? 0) + 20,
    top: (cloned.top ?? 0) + 20,
    evented: true,
  });
  canvas.add(cloned);
  canvas.setActiveObject(cloned);
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: cloned });
}

/** 활성 객체를 즉시 복제(복사+붙여넣기). */
export async function duplicateActive(canvas: Canvas) {
  const active = canvas.getActiveObject();
  if (!active) return;
  const cloned = await active.clone();
  canvas.discardActiveObject();
  cloned.set({
    left: (cloned.left ?? 0) + 20,
    top: (cloned.top ?? 0) + 20,
    evented: true,
  });
  canvas.add(cloned);
  canvas.setActiveObject(cloned);
  canvas.requestRenderAll();
  canvas.fire("object:modified", { target: cloned });
}
