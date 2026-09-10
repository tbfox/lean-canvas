import { useCallback, useEffect, useState } from "react";
import "./index.css";
import { BLOCKS } from "./blocks";
import { Block } from "./Block";
import { CanvasBar } from "./CanvasBar";
import { useCanvases } from "./useCanvases";

export function App() {
  const {
    canvases,
    current,
    status,
    error,
    select,
    create,
    rename,
    remove,
    setField,
    saveNow,
  } = useCanvases();

  const [focused, setFocused] = useState<string | null>(null);

  // Cmd/Ctrl-S saves immediately rather than letting the browser save the page.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void saveNow();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [saveNow]);

  const exportMarkdown = useCallback(() => {
    if (!current) return;
    const body = BLOCKS.map(b => {
      const value = current.fields[b.id as keyof typeof current.fields] ?? "";
      return `## ${b.title}\n\n${value.trim() || "_(empty)_"}`;
    }).join("\n\n");
    const md = `# ${current.name}\n\n_Updated ${new Date(
      current.updatedAt,
    ).toLocaleString()}_\n\n${body}\n`;

    const url = URL.createObjectURL(
      new Blob([md], { type: "text/markdown" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = `${current.name.replace(/[^\w.-]+/g, "-").toLowerCase()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [current]);

  if (error && !current) {
    return (
      <main className="app">
        <p className="error-page">
          Couldn't reach the server: {error}
          <br />
          Is <code>bun dev</code> still running?
        </p>
      </main>
    );
  }

  return (
    <main className="app">
      <CanvasBar
        canvases={canvases}
        current={current}
        status={status}
        onSelect={select}
        onCreate={create}
        onRename={rename}
        onDelete={remove}
        onExport={exportMarkdown}
      />

      {current ? (
        <section className="canvas" aria-label="Lean canvas">
          {BLOCKS.map(block => (
            <Block
              key={block.id}
              def={block}
              value={current.fields[block.id as keyof typeof current.fields] ?? ""}
              onChange={value => setField(block.id, value)}
              focused={focused === block.id}
              onFocus={() => setFocused(block.id)}
              onBlur={() => setFocused(f => (f === block.id ? null : f))}
            />
          ))}
        </section>
      ) : (
        <p className="loading">Loading…</p>
      )}
    </main>
  );
}

export default App;
