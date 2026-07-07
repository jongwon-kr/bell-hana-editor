/**
 * 스포이트(색상 추출). 기존 d3/커스텀 캔버스 방식 대신
 * 브라우저 내장 EyeDropper API 사용(Chromium 계열 지원).
 */
interface EyeDropperResult {
  sRGBHex: string;
}
interface EyeDropperConstructor {
  new (): { open: () => Promise<EyeDropperResult> };
}

export function isEyeDropperSupported(): boolean {
  return typeof (window as unknown as { EyeDropper?: unknown }).EyeDropper !== "undefined";
}

/** 화면에서 색을 추출. 지원하지 않으면 null 반환. */
export async function pickColor(): Promise<string | null> {
  const Ctor = (window as unknown as { EyeDropper?: EyeDropperConstructor }).EyeDropper;
  if (!Ctor) return null;
  try {
    const result = await new Ctor().open();
    return result.sRGBHex;
  } catch {
    return null;
  }
}
