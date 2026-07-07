/**
 * Fabric.js 진입점.
 * - fabric 7.x를 re-export
 * - 커스텀 클래스(Arrow/CurvedLine/PolyPath/CTextBox)를 import 하여 classRegistry에 등록
 * - 전역 기본 컨트롤/스타일 세팅
 */
import * as fabric from "fabric";

import { Arrow } from "./Arrow";
import { CurvedLine } from "./CurvedLine";
import { PolyPath } from "./PolyPath";
import { CTextBox } from "./CTextBox";

export { fabric, Arrow, CurvedLine, PolyPath, CTextBox };

let controlsConfigured = false;

/** 회전 컨트롤 아이콘 등 전역 상호작용 기본값을 1회 설정. */
export function configureFabricDefaults() {
  if (controlsConfigured) return;
  controlsConfigured = true;

  fabric.InteractiveFabricObject.ownDefaults = {
    ...fabric.InteractiveFabricObject.ownDefaults,
    transparentCorners: false,
    cornerStyle: "circle",
    cornerSize: 10,
    cornerColor: "#ffffff",
    cornerStrokeColor: "#2563eb",
    borderColor: "#2563eb",
    borderScaleFactor: 1.5,
    padding: 0,
  };
}

/** toJSON 시 유지할 커스텀 속성 목록. */
export const SERIALIZED_PROPS = [
  "id",
  "name",
  "label",
  "noFocusing",
  "selectable",
  "evented",
  "visible",
  "startArrowHeadStyle",
  "endArrowHeadStyle",
  "isSmoothing",
  "textboxBorderColor",
  "textboxBorderWidth",
  "strokeUniform",
];
