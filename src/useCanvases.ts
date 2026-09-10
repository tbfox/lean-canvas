import { useCallback, useEffect, useRef, useState } from "react";
import type { Canvas, Fields } from "./db";

export type SaveStatus = "idle" | "dirty" | "saving" | "saved" | "error";

const AUTOSAVE_MS = 700;

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { "Content-Type": "application/json" } : undefined,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.status === 204 ? (undefined as T) : ((await res.json()) as T);
}

/**
 * Owns the canvas list, the selected canvas, and debounced autosave.
 * Edits apply locally right away; the PUT trails behind by AUTOSAVE_MS.
 */
export function useCanvases() {
  const [canvases, setCanvases] = useState<Canvas[]>([]);
  const [current, setCurrent] = useState<Canvas | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest unsaved canvas, so saveNow/unmount can flush without stale state.
  const pending = useRef<Canvas | null>(null);

  const flush = useCallback(async () => {
    const canvas = pending.current;
    if (!canvas) return;
    pending.current = null;
    setStatus("saving");
    try {
      const saved = await api<Canvas>(`/api/canvases/${canvas.id}`, {
        method: "PUT",
        body: JSON.stringify({ name: canvas.name, fields: canvas.fields }),
      });
      setCanvases(list =>
        list.map(c => (c.id === saved.id ? saved : c)),
      );
      setCurrent(c =>
        c && c.id === saved.id ? { ...c, updatedAt: saved.updatedAt } : c,
      );
      setStatus("saved");
      setError(null);
    } catch (e) {
      pending.current = canvas; // keep it queued for the next attempt
      setStatus("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  }, []);

  const queueSave = useCallback(
    (canvas: Canvas) => {
      pending.current = canvas;
      setStatus("dirty");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), AUTOSAVE_MS);
    },
    [flush],
  );

  const saveNow = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    await flush();
  }, [flush]);

  // Initial load: pick the most recently updated canvas, or make the first one.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await api<Canvas[]>("/api/canvases");
        if (cancelled) return;
        if (list.length === 0) {
          const created = await api<Canvas>("/api/canvases", {
            method: "POST",
            body: JSON.stringify({ name: "My first canvas" }),
          });
          if (cancelled) return;
          setCanvases([created]);
          setCurrent(created);
        } else {
          setCanvases(list);
          setCurrent(list[0]!);
        }
        setError(null);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Don't lose the trailing edit on tab close.
  useEffect(() => {
    function onHide() {
      if (!pending.current) return;
      const canvas = pending.current;
      navigator.sendBeacon?.(
        `/api/canvases/${canvas.id}`,
        new Blob([JSON.stringify({ name: canvas.name, fields: canvas.fields })], {
          type: "application/json",
        }),
      );
    }
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, []);

  const setField = useCallback(
    (id: string, value: string) => {
      setCurrent(c => {
        if (!c) return c;
        const next = { ...c, fields: { ...c.fields, [id]: value } as Fields };
        queueSave(next);
        return next;
      });
    },
    [queueSave],
  );

  const select = useCallback(
    async (id: string) => {
      if (id === current?.id) return;
      await saveNow();
      const canvas = canvases.find(c => c.id === id);
      if (canvas) {
        setCurrent(canvas);
        setStatus("idle");
      }
    },
    [canvases, current?.id, saveNow],
  );

  const create = useCallback(
    async (name: string) => {
      await saveNow();
      try {
        const created = await api<Canvas>("/api/canvases", {
          method: "POST",
          body: JSON.stringify({ name }),
        });
        setCanvases(list => [created, ...list]);
        setCurrent(created);
        setStatus("idle");
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e));
      }
    },
    [saveNow],
  );

  const rename = useCallback(
    (name: string) => {
      setCurrent(c => {
        if (!c) return c;
        const next = { ...c, name };
        queueSave(next);
        return next;
      });
      setCanvases(list =>
        list.map(c => (c.id === current?.id ? { ...c, name } : c)),
      );
    },
    [current?.id, queueSave],
  );

  const remove = useCallback(async () => {
    if (!current) return;
    const id = current.id;
    if (timer.current) clearTimeout(timer.current);
    pending.current = null;
    try {
      await api<void>(`/api/canvases/${id}`, { method: "DELETE" });
      const rest = canvases.filter(c => c.id !== id);
      setCanvases(rest);
      if (rest.length > 0) {
        setCurrent(rest[0]!);
      } else {
        const created = await api<Canvas>("/api/canvases", {
          method: "POST",
          body: JSON.stringify({ name: "My first canvas" }),
        });
        setCanvases([created]);
        setCurrent(created);
      }
      setStatus("idle");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  }, [canvases, current]);

  return {
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
  };
}
