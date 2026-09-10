import { useState } from "react";
import type { Canvas } from "./db";
import type { SaveStatus } from "./useCanvases";

type Props = {
  canvases: Canvas[];
  current: Canvas | null;
  status: SaveStatus;
  onSelect: (id: string) => void;
  onCreate: (name: string) => void;
  onRename: (name: string) => void;
  onDelete: () => void;
  onExport: () => void;
};

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: "",
  dirty: "Unsaved changes…",
  saving: "Saving…",
  saved: "All changes saved",
  error: "Save failed — retrying on next edit",
};

export function CanvasBar({
  canvases,
  current,
  status,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onExport,
}: Props) {
  const [confirming, setConfirming] = useState(false);

  return (
    <header className="bar">
      <div className="bar__row">
        <h1 className="bar__brand">Lean Canvas</h1>

        <input
          className="bar__name"
          aria-label="Canvas name"
          value={current?.name ?? ""}
          onChange={e => onRename(e.target.value)}
          placeholder="Untitled canvas"
          disabled={!current}
        />

        <select
          className="bar__select"
          aria-label="Switch canvas"
          value={current?.id ?? ""}
          onChange={e => onSelect(e.target.value)}
        >
          {canvases.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <button onClick={() => onCreate("Untitled canvas")}>New</button>
        <button onClick={onExport} disabled={!current}>
          Export .md
        </button>

        {confirming ? (
          <span className="bar__confirm">
            Delete “{current?.name}”?
            <button
              className="is-danger"
              onClick={() => {
                onDelete();
                setConfirming(false);
              }}
            >
              Delete
            </button>
            <button onClick={() => setConfirming(false)}>Cancel</button>
          </span>
        ) : (
          <button onClick={() => setConfirming(true)} disabled={!current}>
            Delete
          </button>
        )}
      </div>

      <div className={`bar__status bar__status--${status}`}>
        {STATUS_TEXT[status]}
      </div>
    </header>
  );
}
