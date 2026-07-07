import {
  MousePointer2,
  Hand,
  Circle,
  Triangle,
  Square,
  Shapes,
  Pencil,
  Spline,
  MoveUpRight,
  Waypoints,
  Type,
  Image as ImageIcon,
  LayoutTemplate,
  Settings2,
  Undo2,
  Redo2,
  Download,
  Trash2,
  Maximize,
  type LucideIcon,
} from "lucide-react";
import type { ToolId, ActionId } from "../types";

export interface ToolDef {
  id: ToolId;
  title: string;
  icon: LucideIcon;
  /** 클릭 시 좌측 패널을 여는 도구인지 여부. */
  hasPanel?: boolean;
}

export interface ActionDef {
  id: ActionId;
  title: string;
  icon: LucideIcon;
}

/** 좌측 메인 툴바 도구(기상 전선 도구 제거됨). */
export const MAIN_TOOLS: ToolDef[] = [
  { id: "select", title: "선택 / 이동 (Alt+S)", icon: MousePointer2 },
  { id: "hand", title: "캔버스 이동 (Alt+H)", icon: Hand },
  { id: "ellipse", title: "타원 (Alt+1)", icon: Circle },
  { id: "triangle", title: "삼각형 (Alt+2)", icon: Triangle },
  { id: "rect", title: "사각형 (Alt+3)", icon: Square },
  { id: "shapes", title: "도형 (Alt+4)", icon: Shapes, hasPanel: true },
  { id: "draw", title: "펜 (Alt+5)", icon: Pencil, hasPanel: true },
  { id: "curvedLine", title: "곡선 (Alt+6)", icon: Spline },
  { id: "arrow", title: "화살표 (Alt+7)", icon: MoveUpRight },
  { id: "polypath", title: "선 잇기 (Alt+8)", icon: Waypoints },
  { id: "ctextbox", title: "텍스트 (Alt+T)", icon: Type },
  { id: "images", title: "이미지", icon: ImageIcon, hasPanel: true },
  { id: "templates", title: "템플릿", icon: LayoutTemplate, hasPanel: true },
  { id: "background", title: "캔버스 설정", icon: Settings2, hasPanel: true },
];

/** 상단/보조 액션 버튼. */
export const ACTIONS: ActionDef[] = [
  { id: "undo", title: "실행 취소 (Ctrl+Z)", icon: Undo2 },
  { id: "redo", title: "다시 실행 (Ctrl+Y)", icon: Redo2 },
  { id: "download", title: "내보내기", icon: Download },
  { id: "fullscreen", title: "전체화면", icon: Maximize },
  { id: "clear", title: "초기화", icon: Trash2 },
];

/** 도구 클릭 시 좌측 패널을 여는 도구 목록. */
export const PANEL_TOOLS: ToolId[] = ["shapes", "draw", "images", "templates", "background", "select"];
