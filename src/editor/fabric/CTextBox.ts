import { IText, classRegistry } from "fabric";
import { generateUniqueId } from "../core/id";

/**
 * IText 확장. 텍스트 자체 테두리(stroke)와 별개로 "텍스트 박스" 외곽 테두리를 그린다.
 * 기상 특화 로직 없음 — 범용 텍스트 요소.
 */
export class CTextBox extends IText {
  static type = "CTextBox";

  declare id: string;
  declare name: string;
  declare textboxBorderColor: string;
  declare textboxBorderWidth: number;

  constructor(text: string, options: Record<string, unknown> = {}) {
    super(text, options);
    this.name = "CTextBox";
    this.id = (options.id as string) || generateUniqueId();
    this.objectCaching = false;

    this.textboxBorderColor = (options.textboxBorderColor as string) || "transparent";
    this.textboxBorderWidth = (options.textboxBorderWidth as number) ?? 2;

    this.on("modified", () => this.setCoords());
  }

  override _render(ctx: CanvasRenderingContext2D) {
    super._render(ctx);

    if (
      this.textboxBorderWidth > 0 &&
      this.textboxBorderColor &&
      this.textboxBorderColor !== "transparent"
    ) {
      ctx.save();

      const textStrokeWidth = this.strokeWidth || 0;
      const padding = this.padding || 0;
      const contentHalfWidth = this.width / 2 + padding + textStrokeWidth / 2;
      const contentHalfHeight = this.height / 2 + padding + textStrokeWidth / 2;

      const rectPathHalfWidth = contentHalfWidth + this.textboxBorderWidth / 2;
      const rectPathHalfHeight = contentHalfHeight + this.textboxBorderWidth / 2;

      ctx.strokeStyle = this.textboxBorderColor;
      ctx.lineWidth = this.textboxBorderWidth;

      ctx.strokeRect(
        -rectPathHalfWidth + 2,
        -rectPathHalfHeight + 2,
        rectPathHalfWidth * 2 - 4,
        rectPathHalfHeight * 2 - 4
      );

      ctx.restore();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  override toObject(propertiesToInclude: any[] = []): any {
    return {
      ...super.toObject(propertiesToInclude),
      id: this.id,
      name: this.name,
      textboxBorderColor: this.textboxBorderColor,
      textboxBorderWidth: this.textboxBorderWidth,
    };
  }
}

classRegistry.setClass(CTextBox);
classRegistry.setSVGClass(CTextBox);
