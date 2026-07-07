import { Path, util, controlsUtils, FabricObject, classRegistry, Point } from "fabric";
import { ArrowHeadStyle } from "../core/constants";
import { generateUniqueId, getLineAngle } from "../core/id";

type Seg = (string | number)[];

interface Endpoints {
  start: { x: number; y: number };
  end: { x: number; y: number };
  beforeStart: { x: number; y: number };
  beforeEnd: { x: number; y: number };
}

class ArrowPathManager {
  extractEndpoints(path: Seg[]): Endpoints {
    if (!path || path.length === 0) {
      const z = { x: 0, y: 0 };
      return { start: z, end: z, beforeStart: z, beforeEnd: z };
    }
    const start = { x: path[0][1] as number, y: path[0][2] as number };
    let end: { x: number; y: number };
    let beforeEnd: { x: number; y: number };

    if (path[1] && path[1][0] === "Q") {
      end = { x: path[1][3] as number, y: path[1][4] as number };
      beforeEnd = { x: path[1][1] as number, y: path[1][2] as number };
    } else if (path[1]) {
      end = { x: path[1][1] as number, y: path[1][2] as number };
      beforeEnd = start;
    } else {
      end = start;
      beforeEnd = start;
    }

    return {
      start,
      end,
      beforeStart:
        path.length > 1 && path[1][0] === "Q"
          ? { x: path[1][1] as number, y: path[1][2] as number }
          : end,
      beforeEnd,
    };
  }

  calculateAngles(e: Endpoints) {
    const startAngle =
      getLineAngle(e.beforeStart.x - e.start.x, e.beforeStart.y - e.start.y) + Math.PI;
    const endAngle = getLineAngle(e.end.x - e.beforeEnd.x, e.end.y - e.beforeEnd.y);
    return { startAngle, endAngle };
  }
}

/** 시작/끝 화살표 머리를 렌더링하는 Path 확장. 곡선(Q) 변환/직선화 지원. */
export class Arrow extends Path {
  static type = "Arrow";

  declare id: string;
  declare name: string;
  declare startArrowHeadStyle: ArrowHeadStyle;
  declare endArrowHeadStyle: ArrowHeadStyle;

  isEditing = false;
  isSmoothing = false;
  private tempControls: unknown = null;
  private pathManager = new ArrowPathManager();
  private startArrowHeadPath: Seg[] | null = null;
  private endArrowHeadPath: Seg[] | null = null;
  private startArrowHeadFilled = false;
  private endArrowHeadFilled = false;

  constructor(path: string | Seg[], options: Record<string, unknown> = {}) {
    super(path as never, options);
    this.name = "Arrow";
    this.id = (options.id as string) || generateUniqueId();
    this.objectCaching = false;
    this.borderDashArray = [2, 2];

    this.isSmoothing = (options.isSmoothing as boolean) || false;
    this.startArrowHeadStyle = (options.startArrowHeadStyle as ArrowHeadStyle) ?? ArrowHeadStyle.NoHead;
    this.endArrowHeadStyle = (options.endArrowHeadStyle as ArrowHeadStyle) ?? ArrowHeadStyle.Head;

    if (this.isSmoothing) this.smoothing(false);

    this.on("modified", () => this._onModified());
    this.on("mousedblclick", () => this._onDoubleClick());

    this._updateArrow();
  }

  toggleSmoothing() {
    this.isSmoothing ? this.straighten() : this.smoothing();
  }

  straighten() {
    const p = this.path as unknown as Seg[];
    if (!this.isSmoothing) return;
    if (!p || p.length < 2 || p[1][0] !== "Q") return;

    const anchorBefore = this._anchorInCanvas();
    const startPoint = p[0];
    const curvedPoint = p[1];
    this.set("path", [
      ["M", startPoint[1], startPoint[2]],
      ["L", curvedPoint[3], curvedPoint[4]],
    ] as never);
    this.setDimensions();
    this._reAnchor(anchorBefore);

    this.isSmoothing = false;
    this.dirty = true;
    if (this.isEditing) this._setupPathControls();
    this._updateArrow();
    this.setCoords();
    this.canvas?.renderAll();
    this.canvas?.fire("object:modified", { target: this });
  }

  smoothing(fireEvent = true) {
    const p = this.path as unknown as Seg[];
    if (this.isSmoothing) return;
    if (!p || p.length < 2 || p[1][0] !== "L") return;

    const anchorBefore = this._anchorInCanvas();
    const [, sx, sy] = p[0] as number[];
    const [, ex, ey] = p[1] as number[];
    const midX = (sx + ex) / 2;
    const midY = (sy + ey) / 2;

    this.set("path", [
      ["M", sx, sy],
      ["Q", midX, midY, ex, ey],
    ] as never);
    this.setDimensions();
    this._reAnchor(anchorBefore);

    this.isSmoothing = true;
    this.dirty = true;
    if (this.isEditing) this._setupPathControls();
    this._updateArrow();
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

  _updateArrow() {
    const p = this.path as unknown as Seg[];
    if (!this.pathManager || !p || p.length < 2) return;
    const endpoints = this.pathManager.extractEndpoints(p);
    const angles = this.pathManager.calculateAngles(endpoints);
    this._updateArrowHeads(endpoints.start, endpoints.end, angles.startAngle, angles.endAngle);
  }

  private _updateArrowHeads(
    startPoint: { x: number; y: number },
    endPoint: { x: number; y: number },
    angleStart: number,
    angleEnd: number
  ) {
    const off = this.pathOffset || { x: 0, y: 0 };

    if (this.startArrowHeadStyle !== ArrowHeadStyle.NoHead) {
      this.startArrowHeadPath = this._calculateHeadPath(startPoint.x, startPoint.y, angleStart, off);
      this.startArrowHeadFilled = this.startArrowHeadStyle === ArrowHeadStyle.FilledHead;
    } else {
      this.startArrowHeadPath = null;
    }

    if (this.endArrowHeadStyle !== ArrowHeadStyle.NoHead) {
      this.endArrowHeadPath = this._calculateHeadPath(endPoint.x, endPoint.y, angleEnd, off);
      this.endArrowHeadFilled = this.endArrowHeadStyle === ArrowHeadStyle.FilledHead;
    } else {
      this.endArrowHeadPath = null;
    }
  }

  private _calculateHeadPath(x: number, y: number, angle: number, off: { x: number; y: number }): Seg[] {
    const len = Math.max(this.strokeWidth * 3, 25);
    const x1 = x - len * Math.cos(angle - Math.PI / 7);
    const y1 = y - len * Math.sin(angle - Math.PI / 7);
    const x2 = x - len * Math.cos(angle + Math.PI / 7);
    const y2 = y - len * Math.sin(angle + Math.PI / 7);
    return [
      ["M", x1 - off.x, y1 - off.y],
      ["L", x - off.x, y - off.y],
      ["L", x2 - off.x, y2 - off.y],
    ];
  }

  private _onModified() {
    this._updateArrow();
    this.setCoords();
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

  override _set(key: string, value: unknown) {
    super._set(key, value);
    this._updateArrow();
    return this;
  }

  override _render(ctx: CanvasRenderingContext2D) {
    ctx.save();
    super._render(ctx);
    ctx.lineWidth = this.strokeWidth;
    ctx.strokeStyle = this.stroke as string;

    const drawHead = (segs: Seg[] | null, filled: boolean) => {
      if (!segs) return;
      ctx.beginPath();
      segs.forEach((s) => {
        if (s[0] === "M") ctx.moveTo(s[1] as number, s[2] as number);
        else if (s[0] === "L") ctx.lineTo(s[1] as number, s[2] as number);
      });
      if (filled) {
        ctx.closePath();
        ctx.fillStyle = this.stroke as string;
        ctx.fill();
      }
      ctx.stroke();
    };

    drawHead(this.startArrowHeadPath, this.startArrowHeadFilled);
    drawHead(this.endArrowHeadPath, this.endArrowHeadFilled);
    ctx.restore();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override toObject(propertiesToInclude: any[] = []): any {
    return {
      ...super.toObject(propertiesToInclude),
      id: this.id,
      name: this.name,
      startArrowHeadStyle: this.startArrowHeadStyle,
      endArrowHeadStyle: this.endArrowHeadStyle,
      isSmoothing: this.isSmoothing,
    };
  }
}

classRegistry.setClass(Arrow);
classRegistry.setSVGClass(Arrow);
