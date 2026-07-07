import { useEditorStore } from "@/editor/store/editorStore";
import { SHAPE_SVGS } from "@/editor/data/shapes";
import { addShapeFromSVG } from "@/editor/tools/shapeLibrary";

export function ShapesPanel() {
  const canvas = useEditorStore((s) => s.canvas);

  return (
    <div className="panel">
      <h3 className="panel__title">도형</h3>
      <p className="panel__hint">도형을 클릭하여 캔버스에 추가합니다.</p>
      <div className="shape-grid">
        {SHAPE_SVGS.map((svg, i) => (
          <button
            key={i}
            className="shape-grid__item"
            onClick={() => canvas && addShapeFromSVG(canvas, svg)}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ))}
      </div>
    </div>
  );
}
