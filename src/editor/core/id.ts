/** 캔버스 객체용 고유 ID 생성기. */
export function generateUniqueId(): string {
  return "obj_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 11);
}

/** 두 점 사이 각도(라디안). Arrow 머리 방향 계산 등에 사용. */
export function getLineAngle(dx: number, dy: number): number {
  return Math.atan2(dy, dx);
}
