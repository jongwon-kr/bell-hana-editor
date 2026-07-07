import { useEditorStore } from "@/editor/store/editorStore";
import { MAIN_TOOLS, ACTIONS } from "@/editor/data/toolbar";
import type { ActionId } from "@/editor/types";

interface ToolbarProps {
  onAction: (action: ActionId) => void;
}

export function Toolbar({ onAction }: ToolbarProps) {
  const activeTool = useEditorStore((s) => s.activeTool);
  const setActiveTool = useEditorStore((s) => s.setActiveTool);
  const canUndo = useEditorStore((s) => s.canUndo);
  const canRedo = useEditorStore((s) => s.canRedo);

  const isDisabled = (id: ActionId) =>
    (id === "undo" && !canUndo) || (id === "redo" && !canRedo);

  return (
    <aside className="toolbar">
      <div className="toolbar__brand" title="Canvas Studio">CS</div>

      <div className="toolbar__group">
        {MAIN_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <button
              key={tool.id}
              className={`tool-btn${activeTool === tool.id ? " active" : ""}`}
              title={tool.title}
              onClick={() => setActiveTool(tool.id)}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>

      <div className="toolbar__spacer" />

      <div className="toolbar__group">
        {ACTIONS.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.id}
              className="tool-btn"
              title={action.title}
              disabled={isDisabled(action.id)}
              onClick={() => onAction(action.id)}
            >
              <Icon size={20} />
            </button>
          );
        })}
      </div>
    </aside>
  );
}
