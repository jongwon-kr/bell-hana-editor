# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Vite dev server, opens http://localhost:5173
npm run build      # tsc -b && vite build  → dist/
npm run typecheck  # tsc -b --noEmit
npm run preview    # serve the built dist/
```

- **`npm run lint` is broken** — the script invokes `eslint`, but eslint is not in `devDependencies` and no eslint config exists in the repo. Use `npm run typecheck` as the gate instead. (Source files still carry `eslint-disable` comments left over from the pre-migration codebase.)
- **No test runner is configured.** There is no test framework, no test files, and no `test` script. Verify changes by running the dev server and exercising the canvas.
- TypeScript is `strict` with `noUnusedLocals` / `noUnusedParameters` — an unused import or parameter fails `build`/`typecheck`, not just lints.
- `@/*` resolves to `src/*` (aliased in both [vite.config.ts](vite.config.ts) and [tsconfig.app.json](tsconfig.app.json) — keep them in sync).

## Architecture

A React 19 + Vite + TypeScript canvas editor (Canva/PPT style) built on **Fabric.js 7**. It is a refactor of an older jQuery + Webpack + Fabric 6 weather-specific editor; all weather (WeatherFront / WGC) features were removed, but comments across the codebase still reference what was ported from the old `core.js`.

### The two-layer split

The central structural decision is that **[src/editor/](src/editor/) is framework-independent** — it imports Fabric and Zustand but never React components — while **[src/components/](src/components/) is pure UI**. Editor logic must not move into components; components read/write state only through the store.

```
src/components/  ─────►  src/editor/store/editorStore.ts  ─────►  src/editor/core|tools|fabric
   (React UI)              (Zustand: the only bridge)              (canvas logic)
```

[editorStore.ts](src/editor/store/editorStore.ts) holds the live `fabric.Canvas` instance itself plus derived UI state (`activeTool`, `activeObject`, `zoom`, `layers`, `canUndo/canRedo`). Anything that needs the canvas calls `useEditorStore.getState().canvas`.

### Canvas lifecycle

[useEditorCanvas.ts](src/editor/hooks/useEditorCanvas.ts) is the single mount point, called once from [CanvasStage.tsx](src/components/CanvasStage.tsx). In one `useEffect` with an empty dep array it: configures Fabric defaults → constructs the `Canvas` → `registerTools()` → wires `selection:*` / `object:added` / `object:removed` / `object:modified` / `path:created` handlers → `store.attachCanvas()` → restores from `localStorage` → fits zoom. It reads the store via `useEditorStore.getState()` rather than subscribing, so the effect never re-runs. Cleanup disposes the canvas.

### Custom Fabric classes — registration is mandatory

[src/editor/fabric/](src/editor/fabric/) holds `Arrow`, `CurvedLine`, `PolyPath`, `CTextBox`, each ending with `classRegistry.setClass(X)` / `setSVGClass(X)`. [fabric/index.ts](src/editor/fabric/index.ts) imports all four purely for that side effect and re-exports `fabric`. **Always import Fabric via `@/editor/fabric`, never from `"fabric"` directly for runtime values** — importing the package directly skips registration, and `loadFromJSON` will silently fail to revive custom objects. (Type-only `import type { Canvas } from "fabric"` is fine and used throughout.)

Adding a custom property to an object requires **three** edits, or it will not survive save/undo:

1. Declare it in [fabric-augment.d.ts](src/editor/fabric/fabric-augment.d.ts) (module augmentation of `FabricObject` / `Canvas`).
2. Add it to `SERIALIZED_PROPS` in [fabric/index.ts](src/editor/fabric/index.ts).
3. If it lives on a custom subclass, also return it from that class's `toObject()` override.

### History and persistence — snapshot-based

[history.ts](src/editor/core/history.ts) is a plain two-stack undo/redo of **JSON snapshot strings** (limit 100), not a command/diff log. `getCanvasSnapshot()` in [serialize.ts](src/editor/core/serialize.ts) serializes objects plus `viewportTransform`/`width`/`height`.

- History is recorded by the `object:modified` canvas event, which `store.pushHistory()` listens to. **Tools and core helpers must `canvas.fire("object:modified", ...)` manually** after programmatic mutations (see [shapeDraw.ts](src/editor/tools/shapeDraw.ts), [objects.ts](src/editor/core/objects.ts)) — otherwise the change is invisible to undo.
- `undo`/`redo` set `isRestoring: true` while `loadCanvasJSON` runs; `pushHistory()` bails out on that flag to avoid recording the restore itself.
- `Ctrl+S` writes a snapshot to `localStorage` under `STORAGE_KEY` (`"canvasStudioEditor"`); `useEditorCanvas` restores it on mount.

### The `noFocusing` convention

`obj.noFocusing === true` marks a locked/background object. Such objects are excluded from layer listings ([`getUserObjects`](src/editor/core/objects.ts)), from select-all, from `applyToolMode`'s selectable toggling, and are stripped from history snapshots. Respect this flag in any new code that iterates `canvas.getObjects()`.

### Tools: installed once, gated by `getTool()`

[registerTools.ts](src/editor/tools/registerTools.ts) installs every tool's `mouse:down/move/up` handlers **once at mount**. Handlers are never added or removed on tool switch — each one early-returns unless `getTool()` matches its own tool id. Switching tools instead goes through [`applyToolMode`](src/editor/tools/mode.ts), which resets `isDrawingMode`, `selection`, cursors, and per-object `selectable`/`evented`. Adding a tool means: extend `ToolId` in [types.ts](src/editor/types.ts), write an `installXTool(canvas, getTool)`, call it from `registerTools`, and handle its mode in `applyToolMode`.

### Zoom uses `originalW`/`originalH`

The `Canvas` augmentation carries the unzoomed dimensions. [`applyZoom`](src/editor/core/zoom.ts) calls `setZoom()` _and_ `setDimensions({ w * zoom, h * zoom })` — the canvas element physically resizes, so `originalW`/`originalH` are the only reliable base for zoom math. Keep them updated whenever canvas size changes (`setCanvasSize`, `clearCanvas`, `loadCanvasJSON` all do).

### Panels

[EditorLayout.tsx](src/components/EditorLayout.tsx) composes Toolbar / LeftPanel / CanvasStage + Footer / RightPanel. The left panel swaps content based on `activeTool` (shapes, free-draw, images, templates, background); the right panel shows `SelectionPanel` only when `activeObject` is set, plus the always-present `LayersPanel`. Export goes through [download.ts](src/editor/core/download.ts) using Fabric's built-in `toDataURL`/`toSVG` (no html2canvas).

## Repo conventions

- **Korean** for UI strings, JSDoc comments, and commit messages/PR bodies. Match this in new code.
- Commit subjects use a type prefix with a Korean body: `feat:`, `docs:`, `setting:`. PR titles follow `[feat/#21] 설명` (see [PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md)); issue templates live in [.github/ISSUE_TEMPLATE/](.github/ISSUE_TEMPLATE/) as design/feature/fix/refactor/setting/test reports.
- Styling is a single global stylesheet, [src/styles/index.css](src/styles/index.css), with BEM-ish class names (`editor__main`, `stage__canvas-holder`). No CSS modules or CSS-in-JS.
- [AGENTS.md](AGENTS.md) contains a stale auto-injected Next.js rule block — this project is Vite, not Next.js. Ignore it.

---

# Behavioral guidelines

Guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:

- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:

- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 답변 방식

- 한글로 답변

## Git 커밋 컨벤션

- feat: 새로운 기능 추가
- fix: 버그 수정
- docs: 문서 수정
- style: 코드 스타일 변경 (코드 포매팅, 세미콜론 누락 등)
- design: 사용자 UI 디자인 변경 (CSS 등)
- test: 테스트 코드, 리팩토링 (Test Code)
- refactor: 리팩토링 (Production Code)
- build: 빌드 파일 수정
- ci: CI 설정 파일 수정
- perf: 성능 개선
- chore: 자잘한 수정이나 빌드 업데이트
- rename: 파일 혹은 폴더명을 수정만 한 경우
- remove: 파일을 삭제만 한 경우
