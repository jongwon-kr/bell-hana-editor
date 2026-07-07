import type { Canvas } from "fabric";
import { fabric } from "../fabric";
import { generateUniqueId } from "../core/id";

/** SVG 문자열을 파싱하여 캔버스 중앙에 도형으로 추가. */
export async function addShapeFromSVG(canvas: Canvas, svg: string) {
  const { objects } = await fabric.loadSVGFromString(svg);
  const valid = objects.filter((o): o is fabric.FabricObject => Boolean(o));
  if (valid.length === 0) return;

  const shape = valid.length === 1 ? valid[0] : new fabric.Group(valid);

  const targetSize = 160;
  const maxDim = Math.max(shape.width || 1, shape.height || 1);
  const scale = targetSize / maxDim;

  const w = (canvas.originalW ?? canvas.getWidth()) / canvas.getZoom();
  const h = (canvas.originalH ?? canvas.getHeight()) / canvas.getZoom();

  shape.set({
    id: generateUniqueId(),
    left: w / 2,
    top: h / 2,
    originX: "center",
    originY: "center",
    scaleX: scale,
    scaleY: scale,
    fill: "transparent",
    stroke: "#111827",
    strokeUniform: true,
  });

  canvas.add(shape);
  canvas.setActiveObject(shape);
  canvas.fire("object:modified", { target: shape });
  canvas.requestRenderAll();
}

/** 파일/데이터URL 이미지를 캔버스에 추가. */
export async function addImageFromURL(canvas: Canvas, url: string) {
  const img = await fabric.FabricImage.fromURL(url, { crossOrigin: "anonymous" });
  const w = (canvas.originalW ?? canvas.getWidth()) / canvas.getZoom();
  const h = (canvas.originalH ?? canvas.getHeight()) / canvas.getZoom();
  const maxDim = Math.max(img.width || 1, img.height || 1);
  const scale = Math.min((w * 0.6) / maxDim, (h * 0.6) / maxDim, 1);

  img.set({
    id: generateUniqueId(),
    left: w / 2,
    top: h / 2,
    originX: "center",
    originY: "center",
    scaleX: scale,
    scaleY: scale,
  });

  canvas.add(img);
  canvas.setActiveObject(img);
  canvas.fire("object:modified", { target: img });
  canvas.requestRenderAll();
}
