import { useReducer } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  FlipHorizontal,
  FlipVertical,
  BringToFront,
  SendToBack,
  Group as GroupIcon,
  Ungroup,
  Copy,
  Trash2,
  AlignHorizontalJustifyStart,
  AlignHorizontalJustifyCenter,
  AlignHorizontalJustifyEnd,
  AlignVerticalJustifyStart,
  AlignVerticalJustifyCenter,
  AlignVerticalJustifyEnd,
} from "lucide-react";
import { useEditorStore } from "@/editor/store/editorStore";
import { ColorPicker } from "@/components/common/ColorPicker";
import { NumberInput } from "@/components/common/NumberInput";
import { fabric } from "@/editor/fabric";
import { alignObject } from "@/editor/core/align";
import { groupObjects, ungroupObjects } from "@/editor/core/grouping";
import { duplicateActive } from "@/editor/core/clipboard";
import { removeActiveObjects } from "@/editor/core/objects";
import { BorderStyleList, FONT_FAMILIES, borderSectionTypeList } from "@/editor/core/constants";
import { ArrowHeadStyle } from "@/editor/core/constants";
import type { AlignPosition } from "@/editor/types";

const TEXT_TYPES = ["ctextbox"];
const FILL_TYPES = ["ctextbox", "path", "polygon", "circle", "ellipse", "triangle", "rect", "polypath"];

export function SelectionPanel() {
  const canvas = useEditorStore((s) => s.canvas);
  const obj = useEditorStore((s) => s.activeObject);
  const [, bump] = useReducer((x) => x + 1, 0);

  if (!canvas || !obj) return null;
  const type = (obj.type ?? "").toLowerCase();

  const commit = () => {
    canvas.requestRenderAll();
    canvas.fire("object:modified", { target: obj });
    bump();
  };

  const setProp = (props: Record<string, unknown>) => {
    obj.set(props);
    commit();
  };

  const isMulti = type === "activeselection" || type === "group";
  const showFill = FILL_TYPES.includes(type);
  const showBorder = borderSectionTypeList.includes(type);
  const showText = TEXT_TYPES.includes(type);
  const showArrow = type === "arrow";
  const showNeon = ["path", "polygon", "arrow", "curvedline", "ctextbox"].includes(type);

  const align = (pos: AlignPosition) => alignObject(canvas, obj, pos);

  return (
    <div className="panel selection">
      <h3 className="panel__title">{obj.label || "선택 영역"} 설정</h3>

      {showText && (
        <div className="panel__section">
          <h4>텍스트</h4>
          <div className="style-row">
            <button className={`icon-btn${obj.get("fontWeight") === "bold" ? " active" : ""}`} title="굵게"
              onClick={() => setProp({ fontWeight: obj.get("fontWeight") === "bold" ? "normal" : "bold" })}>
              <Bold size={16} />
            </button>
            <button className={`icon-btn${obj.get("fontStyle") === "italic" ? " active" : ""}`} title="기울임"
              onClick={() => setProp({ fontStyle: obj.get("fontStyle") === "italic" ? "normal" : "italic" })}>
              <Italic size={16} />
            </button>
            <button className={`icon-btn${obj.get("underline") ? " active" : ""}`} title="밑줄"
              onClick={() => setProp({ underline: !obj.get("underline") })}>
              <Underline size={16} />
            </button>
            <button className={`icon-btn${obj.get("linethrough") ? " active" : ""}`} title="취소선"
              onClick={() => setProp({ linethrough: !obj.get("linethrough") })}>
              <Strikethrough size={16} />
            </button>
          </div>
          <div className="input-row">
            <label>글꼴</label>
            <select value={String(obj.get("fontFamily") ?? "Pretendard")} onChange={(e) => setProp({ fontFamily: e.target.value })}>
              {FONT_FAMILIES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <NumberInput label="크기" value={Number(obj.get("fontSize") ?? 32)} min={1} max={400}
            onChange={(v) => setProp({ fontSize: v })} />
          <NumberInput label="줄 간격" value={Number(obj.get("lineHeight") ?? 1)} min={0.1} max={3} step={0.1}
            onChange={(v) => setProp({ lineHeight: v })} />
          <NumberInput label="자간" value={Number(obj.get("charSpacing") ?? 0)} min={-200} max={2000} step={10}
            onChange={(v) => setProp({ charSpacing: v })} />
          <div className="input-row">
            <label>정렬</label>
            <select value={String(obj.get("textAlign") ?? "left")} onChange={(e) => setProp({ textAlign: e.target.value })}>
              <option value="left">왼쪽</option>
              <option value="center">가운데</option>
              <option value="right">오른쪽</option>
              <option value="justify">양쪽</option>
            </select>
          </div>
          <ColorPicker label="글자 색" value={String(obj.get("fill") ?? "#111827")} onChange={(c) => setProp({ fill: c })} />
          <ColorPicker label="텍스트 박스 테두리" value={obj.textboxBorderColor ?? "transparent"}
            onChange={(c) => setProp({ textboxBorderColor: c })} />
          <NumberInput label="박스 테두리 두께" value={obj.textboxBorderWidth ?? 2} min={0} max={40}
            onChange={(v) => setProp({ textboxBorderWidth: v })} />
        </div>
      )}

      {showFill && (
        <div className="panel__section">
          <h4>배경 / 채우기</h4>
          <ColorPicker label="채우기 색" value={String(obj.get("fill") ?? "transparent")} onChange={(c) => setProp({ fill: c })} />
        </div>
      )}

      {showBorder && (
        <div className="panel__section">
          <h4>테두리 / 선</h4>
          <NumberInput label="두께" value={Number(obj.get("strokeWidth") ?? 1)} min={0} max={100}
            onChange={(v) => setProp({ strokeWidth: v, strokeUniform: true })} />
          <div className="input-row">
            <label>스타일</label>
            <select
              value={JSON.stringify(currentBorderStyle(obj))}
              onChange={(e) => {
                const s = JSON.parse(e.target.value);
                setProp({ strokeDashArray: s.strokeDashArray, strokeLineCap: s.strokeLineCap, strokeUniform: true });
              }}
            >
              {BorderStyleList.map((s, i) => (
                <option key={i} value={JSON.stringify(s.value)}>{s.label}</option>
              ))}
            </select>
          </div>
          <div className="input-row">
            <label>모서리</label>
            <select value={String(obj.get("strokeLineJoin") ?? "miter")} onChange={(e) => setProp({ strokeLineJoin: e.target.value })}>
              <option value="miter">각짐</option>
              <option value="round">둥글게</option>
            </select>
          </div>
          <ColorPicker label="선 색" value={String(obj.get("stroke") ?? "#111827")} onChange={(c) => setProp({ stroke: c })} />
          {showNeon && (
            <ColorPicker
              label="네온 효과"
              value={(obj.shadow as fabric.Shadow | null)?.color ?? "transparent"}
              onChange={(c) =>
                setProp({ shadow: new fabric.Shadow({ color: c, blur: 12, offsetX: 0, offsetY: 0, affectStroke: true }) })
              }
            />
          )}
        </div>
      )}

      {showArrow && (
        <div className="panel__section">
          <h4>화살표</h4>
          <div className="input-row">
            <label>시작</label>
            <select value={String(obj.startArrowHeadStyle ?? ArrowHeadStyle.NoHead)} onChange={(e) => setProp({ startArrowHeadStyle: parseInt(e.target.value) })}>
              <option value={ArrowHeadStyle.NoHead}>없음</option>
              <option value={ArrowHeadStyle.Head}>화살표</option>
              <option value={ArrowHeadStyle.FilledHead}>채운 화살표</option>
            </select>
          </div>
          <div className="input-row">
            <label>끝</label>
            <select value={String(obj.endArrowHeadStyle ?? ArrowHeadStyle.FilledHead)} onChange={(e) => setProp({ endArrowHeadStyle: parseInt(e.target.value) })}>
              <option value={ArrowHeadStyle.NoHead}>없음</option>
              <option value={ArrowHeadStyle.Head}>화살표</option>
              <option value={ArrowHeadStyle.FilledHead}>채운 화살표</option>
            </select>
          </div>
        </div>
      )}

      <div className="panel__section">
        <h4>효과</h4>
        <div className="input-row">
          <label>불투명도</label>
          <input type="range" min={0} max={1} step={0.01} value={Number(obj.get("opacity") ?? 1)}
            onChange={(e) => setProp({ opacity: parseFloat(e.target.value) })} />
        </div>
      </div>

      <div className="panel__section">
        <h4>정렬</h4>
        <div className="align-grid">
          <button className="icon-btn" title="왼쪽" onClick={() => align("left")}><AlignHorizontalJustifyStart size={16} /></button>
          <button className="icon-btn" title="가운데" onClick={() => align("center-h")}><AlignHorizontalJustifyCenter size={16} /></button>
          <button className="icon-btn" title="오른쪽" onClick={() => align("right")}><AlignHorizontalJustifyEnd size={16} /></button>
          <button className="icon-btn" title="위" onClick={() => align("top")}><AlignVerticalJustifyStart size={16} /></button>
          <button className="icon-btn" title="중간" onClick={() => align("center-v")}><AlignVerticalJustifyCenter size={16} /></button>
          <button className="icon-btn" title="아래" onClick={() => align("bottom")}><AlignVerticalJustifyEnd size={16} /></button>
        </div>
      </div>

      <div className="panel__section">
        <h4>개체</h4>
        <div className="align-grid">
          <button className="icon-btn" title="복제" onClick={() => duplicateActive(canvas)}><Copy size={16} /></button>
          <button className="icon-btn" title="좌우 대칭" onClick={() => setProp({ flipX: !obj.flipX })}><FlipHorizontal size={16} /></button>
          <button className="icon-btn" title="상하 대칭" onClick={() => setProp({ flipY: !obj.flipY })}><FlipVertical size={16} /></button>
          <button className="icon-btn" title="앞으로" onClick={() => { canvas.bringObjectForward(obj); commit(); }}><BringToFront size={16} /></button>
          <button className="icon-btn" title="뒤로" onClick={() => { canvas.sendObjectBackwards(obj); commit(); }}><SendToBack size={16} /></button>
          {type === "activeselection" && (
            <button className="icon-btn" title="그룹" onClick={() => groupObjects(canvas)}><GroupIcon size={16} /></button>
          )}
          {type === "group" && (
            <button className="icon-btn" title="그룹 해제" onClick={() => ungroupObjects(canvas)}><Ungroup size={16} /></button>
          )}
          <button className="icon-btn danger" title="삭제" onClick={() => removeActiveObjects(canvas)}><Trash2 size={16} /></button>
        </div>
        {isMulti && <p className="panel__hint">여러 개체를 선택했습니다.</p>}
      </div>
    </div>
  );
}

/** 현재 객체의 dash/lineCap 조합에 해당하는 프리셋 값을 찾는다. */
function currentBorderStyle(obj: fabric.FabricObject) {
  const dash = (obj.strokeDashArray as number[] | null) ?? [];
  const cap = obj.strokeLineCap ?? "butt";
  const match = BorderStyleList.find(
    (s) =>
      s.value.strokeDashArray.length === dash.length &&
      s.value.strokeLineCap === cap
  );
  return match ? match.value : BorderStyleList[0].value;
}
