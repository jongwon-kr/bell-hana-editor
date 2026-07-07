/**
 * 경량 undo/redo 스택. 외부 라이브러리(undo-redo-stack) 대체.
 * 각 항목은 캔버스 스냅샷(JSON 문자열).
 */
export class History {
  private undoStack: string[] = [];
  private redoStack: string[] = [];
  private limit: number;

  constructor(limit = 100) {
    this.limit = limit;
  }

  /** 새 상태를 push. 직전 상태와 동일하면 무시하고, redo 스택은 초기화. */
  push(state: string) {
    if (this.undoStack[this.undoStack.length - 1] === state) return;
    this.undoStack.push(state);
    if (this.undoStack.length > this.limit) this.undoStack.shift();
    this.redoStack = [];
  }

  canUndo() {
    return this.undoStack.length > 1;
  }

  canRedo() {
    return this.redoStack.length > 0;
  }

  /** 현재 상태를 redo로 옮기고 직전 상태를 반환. */
  undo(): string | null {
    if (!this.canUndo()) return null;
    const current = this.undoStack.pop()!;
    this.redoStack.push(current);
    return this.undoStack[this.undoStack.length - 1];
  }

  /** redo 상태를 undo로 복귀시키고 반환. */
  redo(): string | null {
    if (!this.canRedo()) return null;
    const state = this.redoStack.pop()!;
    this.undoStack.push(state);
    return state;
  }

  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
