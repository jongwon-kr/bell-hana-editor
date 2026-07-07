import { Path, util, controlsUtils, FabricObject, classRegistry, Point } from "fabric";
import { generateUniqueId } from "../core/id";

type Seg = (string | number)[];

/** 다각형/폴리라인. 점 추가/삭제 및 곡선 스무딩(Catmull-Rom 유사) 지원. */
export class PolyPath extends Path {
  static type = "PolyPath";

  declare id: string;
  declare name: string;

  isEditing = false;
  isSmoothing = false;
  private tempControls: unknown = null;

  constructor(path: string | Seg[], options: Record<string, unknown> = {}) {
    super(path as never, options);
    this.name = "PolyPath";
    this.id = (options.id as string) || generateUniqueId();
    this.objectCaching = false;
    this.borderDashArray = [2, 2];
    this.on("mousedblclick", () => this._onDoubleClick());
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

  smoothing() {
    const straightPath = this._getStraightPath();
    if (straightPath.length < 3) return;
    this.isSmoothing = true;

    const before = this._anchorInCanvas();
    let points = straightPath.map((p) => ({
      x: p[p.length - 2] as number,
      y: p[p.length - 1] as number,
    }));

    const isClosed =
      Math.abs(points[0].x - points[points.length - 1].x) < 1 &&
      Math.abs(points[0].y - points[points.length - 1].y) < 1;
    if (isClosed) points.pop();

    const newPath: Seg[] = [["M", points[0].x, points[0].y]];
    const tension = 0.2;

    for (let i = 0; i < points.length; i++) {
      const p1 = points[i];
      const p2 = points[i + 1];
      if (!p2) break;
      const p0 = i === 0 ? points[points.length - 1] : points[i - 1];
      const p3 = i >= points.length - 2 ? points[(i + 2) % points.length] : points[i + 2];
      const cp1 = { x: p1.x + (p2.x - p0.x) * tension, y: p1.y + (p2.y - p0.y) * tension };
      const cp2 = { x: p2.x - (p3.x - p1.x) * tension, y: p2.y - (p3.y - p1.y) * tension };
      newPath.push(["C", cp1.x, cp1.y, cp2.x, cp2.y, p2.x, p2.y]);
    }

    const a = points[points.length - 1];
    const b = points[0];
    const before0 = points[points.length - 2];
    const after1 = points[1];
    const cp1 = { x: a.x + (b.x - before0.x) * tension, y: a.y + (b.y - before0.y) * tension };
    const cp2 = { x: b.x - (after1.x - a.x) * tension, y: b.y - (after1.y - a.y) * tension };
    newPath.push(["C", cp1.x, cp1.y, cp2.x, cp2.y, b.x, b.y]);

    this.set("path", newPath as never);
    this.setDimensions();
    this._reAnchor(before);

    this.dirty = true;
    if (this.isEditing) this._setupPathControls();
    this.setCoords();
    this.canvas?.renderAll();
    this.canvas?.fire("object:modified", { target: this });
  }

  addPoint(pointer: Point) {
    const p = this.path as unknown as Seg[];
    if (!this.isEditing || !p || !this.canvas) return;
    const straightPath = this._getStraightPath();
    if (straightPath.length < 2) return;

    const local = this._toLocal(pointer);
    let minDistance = Infinity;
    let insertionIndex = -1;

    for (let i = 0; i < straightPath.length - 1; i++) {
      const p1 = new Point(straightPath[i][1] as number, straightPath[i][2] as number);
      const p2 = new Point(straightPath[i + 1][1] as number, straightPath[i + 1][2] as number);
      const d = this._pointToSegment(local, p1, p2);
      if (d < minDistance) {
        minDistance = d;
        insertionIndex = i + 1;
      }
    }

    if (insertionIndex === -1) return;

    if (this.isSmoothing) {
      straightPath.splice(insertionIndex, 0, ["L", local.x, local.y]);
      this.set("path", straightPath as never);
      this.smoothing();
    } else {
      const before = this._anchorInCanvas();
      const newPath = [...p];
      newPath.splice(insertionIndex, 0, ["L", local.x, local.y]);
      this.set("path", newPath as never);
      this.setDimensions();
      this._reAnchor(before);
      this.dirty = true;
      if (this.isEditing) this._setupPathControls();
      this.setCoords();
      this.canvas.renderAll();
      this.canvas.fire("object:modified", { target: this });
    }
  }

  removePoint(pointer: Point) {
    const p = this.path as unknown as Seg[];
    if (!this.isEditing || !p || p.length <= 3) return;
    const straightPath = this._getStraightPath();
    const local = this._toLocal(pointer);
    let minDistance = Infinity;
    let removalIndex = -1;

    for (let i = 0; i < straightPath.length; i++) {
      const s = straightPath[i];
      const point = new Point(s[s.length - 2] as number, s[s.length - 1] as number);
      const d = local.distanceFrom(point);
      if (d < minDistance) {
        minDistance = d;
        removalIndex = i;
      }
    }

    if (removalIndex === -1 || minDistance > 10) return;

    const fixHead = (arr: Seg[]) => {
      if (removalIndex === 0 && arr.length > 0) {
        const next = arr[0];
        arr[0] = ["M", next[next.length - 2], next[next.length - 1]];
      }
    };

    if (this.isSmoothing) {
      straightPath.splice(removalIndex, 1);
      fixHead(straightPath);
      this.set("path", straightPath as never);
      this.smoothing();
    } else {
      const before = this._anchorInCanvas();
      const newPath = [...p];
      newPath.splice(removalIndex, 1);
      fixHead(newPath);
      this.set("path", newPath as never);
      this.setDimensions();
      this._reAnchor(before);
      this.dirty = true;
      if (this.isEditing) this._setupPathControls();
      this.setCoords();
      this.canvas?.renderAll();
      this.canvas?.fire("object:modified", { target: this });
    }
  }

  private _toLocal(pointer: Point): Point {
    const inv = util.invertTransform(this.calcTransformMatrix());
    const local = util.transformPoint(pointer, inv);
    local.x += this.pathOffset.x;
    local.y += this.pathOffset.y;
    return local;
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

  private _pointToSegment(point: Point, p1: Point, p2: Point): number {
    const l2 = p1.distanceFrom(p2) ** 2;
    if (l2 === 0) return point.distanceFrom(p1);
    const t = Math.max(
      0,
      Math.min(1, ((point.x - p1.x) * (p2.x - p1.x) + (point.y - p1.y) * (p2.y - p1.y)) / l2)
    );
    const closest = new Point(p1.x + t * (p2.x - p1.x), p1.y + t * (p2.y - p1.y));
    return point.distanceFrom(closest);
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

classRegistry.setClass(PolyPath);
classRegistry.setSVGClass(PolyPath);
