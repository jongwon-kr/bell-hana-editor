# Canvas Studio Editor

React + Fabric.js 기반의 범용 캔버스 편집 플랫폼입니다. PPT / Canva 처럼 포트폴리오, 카드뉴스, 프레젠테이션, SNS 콘텐츠 등 다양한 서비스에 임베드할 수 있는 편집기 코어를 목표로 합니다.

기존 기상 특화 편집기(jQuery + Webpack + Fabric 6)를 **React 19 + Vite + TypeScript + Fabric 7** 스택으로 리팩토링하고, 기상(WeatherFront) / WGC API / 기상자료 관련 기능을 모두 제거했습니다.

## 주요 변경 사항 (마이그레이션)

| 구분 | 이전 | 현재 |
| --- | --- | --- |
| 프레임워크 | Vanilla JS + jQuery | React 19 |
| 빌드 도구 | Webpack | Vite 6 |
| 언어 | JS/TS 혼용 | TypeScript (strict) |
| 캔버스 | Fabric.js 6.7.1 (vendored) | Fabric.js 7.4 |
| 상태 관리 | 전역 변수 / DOM | Zustand |
| 색상 선택 | spectrum-colorpicker2 | react-colorful + 내장 EyeDropper API |
| 그라디언트 | grapick | 제거 |
| Undo/Redo | undo-redo-stack | 자체 `History` 클래스 |
| 내보내기 | html2canvas | Fabric 내장 `toDataURL` / `toSVG` |
| 스포이트 | d3 기반 커스텀 | 브라우저 `EyeDropper` API |
| 아이콘 | SVG 파일 | lucide-react |

기상 관련 코드(`app/`, `vendor/`, `public/ias/wgc`)는 모두 제거되었습니다.

## 기술 스택

- **React 19** / **Vite 6** / **TypeScript 5.7**
- **Fabric.js 7.4** — 캔버스 렌더링 및 객체 모델
- **Zustand 5** — 에디터 전역 상태
- **react-colorful** — 경량 색상 선택기
- **lucide-react** — 아이콘

## 시작하기

```bash
npm install      # 의존성 설치
npm run dev      # 개발 서버 (http://localhost:5173)
npm run build    # 타입체크 + 프로덕션 빌드 (dist/)
npm run preview  # 빌드 결과 미리보기
npm run typecheck
```

## 기능

- 도형: 사각형, 타원, 삼각형, SVG 도형 라이브러리
- 선/화살표: 자유 곡선, 화살표(머리 스타일), 다각형(선 잇기), 자유 그리기(펜)
- 텍스트: 커스텀 `CTextBox` (글꼴/크기/자간/줄간격/정렬/스타일/박스 테두리)
- 이미지 업로드 및 배경 이미지/배경색 설정
- 선택 개체 편집: 채우기·선 색상, 선 두께/스타일, 네온(그림자), 불투명도
- 정렬(좌/중/우/상/중/하), 그룹/그룹 해제, 복제, 좌우/상하 대칭, 순서 변경
- 레이어 패널: 선택 / 표시 토글 / 순서 변경 / 삭제
- 캔버스 프리셋(16:9, A4, 인스타그램, 스토리 등)
- Undo/Redo, 복사/붙여넣기, 캔버스 확대/축소·이동
- PNG / JPG / SVG 내보내기
- localStorage 자동 저장/복원

### 단축키

| 동작 | 키 |
| --- | --- |
| 실행 취소 / 다시 실행 | `Ctrl+Z` / `Ctrl+Y` (또는 `Ctrl+Shift+Z`) |
| 전체 선택 | `Ctrl+A` |
| 복사 / 붙여넣기 / 복제 | `Ctrl+C` / `Ctrl+V` / `Ctrl+D` |
| 삭제 | `Delete` / `Backspace` |
| 이동 (미세/크게) | 방향키 / `Shift`+방향키 |
| 저장 | `Ctrl+S` |
| 도구 전환 | `Alt`+`S/H/T/1~8` |

## 프로젝트 구조

```
src/
├─ main.tsx                # 진입점
├─ App.tsx
├─ styles/index.css        # 전역 스타일
├─ components/             # React UI
│  ├─ EditorLayout.tsx     # 전체 레이아웃
│  ├─ Toolbar.tsx          # 좌측 도구 툴바
│  ├─ CanvasStage.tsx      # 캔버스 스테이지
│  ├─ Footer.tsx           # 줌 컨트롤
│  ├─ LeftPanel.tsx / RightPanel.tsx
│  ├─ DownloadModal.tsx
│  ├─ common/              # ColorPicker, NumberInput
│  └─ panels/              # Shapes/FreeDraw/Images/Templates/Background/Layers/Selection
└─ editor/                 # 프레임워크 독립 편집기 코어
   ├─ fabric/              # Fabric 7 커스텀 클래스(Arrow/CurvedLine/PolyPath/CTextBox) + 등록
   ├─ core/                # id/constants/serialize/history/align/grouping/clipboard/download/objects/eyedropper/zoom
   ├─ tools/               # 드로잉 도구 설치기 + 도구 모드/등록
   ├─ store/               # Zustand 스토어
   ├─ hooks/               # useEditorCanvas / useKeyboardShortcuts
   ├─ data/                # 도형 SVG, 툴바 정의
   └─ types.ts
```

## 라이선스

MIT
