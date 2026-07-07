import { Path, util, controlsUtils, FabricObject, classRegistry, Point } from "fabric";
import { generateUniqueId } from "../core/id";

type Seg = (string | number)[];

/** 자유 곡선/직선. 더블클릭으로 점 편집 모드 진입, 곡선<->직선 토글 지원. */
export class CurvedLine extends Path {
  static type = "CurvedLine";

  declare id: string;
  declare name: string;

  isEditing = false;
  isSmoothing = false;
  private tempControls: unknown = null;

  constructor(path: string | Seg[], options: Record<string, unknown> = {}) {
    super(path as never, options);
    this.name = "CurvedLine";
    this.id = (options.id as string) || generateUniqueId();
    this.objectCaching = false;
    this.borderDashArray = [2, 2];

    this.isSmoothing = (options.isSmoothing as boolean) || false;
    if (this.isSmoothing) this.smoothing(false);

    this.on("mousedblclick", () => this._onDoubleClick());
  }

  toggleSmoothing() {
    this.isSmoothing ? this.straighten() : this.smoothing();
  }

  straighten() {
    if (!this.isSmoothing) return;
    const straightPath = this._getStraightPath();
    if (straightPath.length < 2) return;

    const before = this._anchorInCanvas();
    this.set("path", straightPath as never);
    this.setDimensions();
    this._reAnchor(before);

    this.isSmoothing = false;
    this.dirty = true;
    if (this.isEditing) this._setupPathControls();
    this.setCoords();
    this.canvas?.renderAll();
    this.canvas?.fire("object:modified", { target: this });
  }

  smoothing(fireEvent = true) {
    const p = this.path as unknown as Seg[];
    if (this.isSmoothing) return;
    if (!p || p.length < 2) return;

    const before = this._anchorInCanvas();
    const newPath: Seg[] = [p[0]];
    for (let i = 1; i < p.length; i++) {
      const prev = newPath[newPath.length - 1];
      const cur = p[i];
      if (cur[0] === "L") {
        const startX = (prev[0] === "M" ? prev[1] : prev[prev.length - 2]) as number;
        const startY = (prev[0] === "M" ? prev[2] : prev[prev.length - 1]) as number;
        const endX = cur[1] as number;
        const endY = cur[2] as number;
        newPath.push(["Q", (startX + endX) / 2, (startY + endY) / 2, endX, endY]);
      } else {
        newPath.push(cur);
      }
    }

    this.set("path", newPath as never);
    this.setDimensions();
    this._reAnchor(before);

    this.isSmoothing = true;
    this.dirty = true;
    if (this.isEditing) this._setupPathControls();
    this.setCoords();

    if (fireEvent) {
      this.canvas?.renderAll();
      this.canvas?.fire("object:modified", { target: this });
    }
  }

  private _anchorInCanvas(): Point {
    const p = this.path as unknown as Seg[];
    const anchor = new Point(p[0][1] as number, p[0][2] as number);
    return util.transformPoint(anchor.subtract(this.pathOffset), this.calcTransformMatrix());
  }

  private _reAnchor(before: Point) {
    const p = this.path as unknown as Seg[];
    const after = util.transformPoint(
      new Point(p[0][1] as number, p[0][2] as number).subtract(this.pathOffset),
      this.calcTransformMatrix()
    );
    const diff = after.subtract(before);
    this.set({ left: this.left - diff.x, top: this.top - diff.y });
  }

  private _getStraightPath(): Seg[] {
    const out: Seg[] = [];
    const p = this.path as unknown as Seg[];
    if (!p) return out;
    for (const s of p) {
      if (s[0] === "M" || s[0] === "L") out.push(s);
      else if (s[0] === "Q") out.push(["L", s[3], s[4]]);
      else if (s[0] === "C") out.push(["L", s[5], s[6]]);
    }
    return out;
  }

  private _onDoubleClick() {
    this.isEditing ? this.exitEditMode() : this.enterEditMode();
  }

  enterEditMode() {
    if (this.isEditing || !this.canvas) return;
    this.isEditing = true;
    this.tempControls = this.controls;
    this._setupPathControls();
    this.setCoords();
    this.canvas.preserveObjectStacking = false;
    this.canvas.setActiveObject(this);
    this.canvas.renderAll();
  }

  exitEditMode() {
    if (!this.isEditing || !this.canvas) return;
    this.isEditing = false;
    this.controls = this.tempControls as never;
    this.setCoords();
    this.canvas.preserveObjectStacking = true;
    const active = this.canvas.getActiveObject();
    this.canvas.discardActiveObject();
    if (active) this.canvas.setActiveObject(active);
    this.canvas.renderAll();
  }

  private _setupPathControls() {
    const controls = controlsUtils.createPathControls(this, {
      pointStyle: { controlFill: "white" },
      controlPointStyle: { controlStroke: "Indigo", controlFill: "MediumPurple" },
    });
    this.controls = { ...FabricObject.prototype.controls, ...controls };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override toObject(propertiesToInclude: any[] = []): any {
    return {
      ...super.toObject(propertiesToInclude),
      id: this.id,
      name: this.name,
      isSmoothing: this.isSmoothing,
    };
  }
}

classRegistry.setClass(CurvedLine);
classRegistry.setSVGClass(CurvedLine);
