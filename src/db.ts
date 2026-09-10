/**
 * SQLite persistence for canvases. One row per canvas; the nine blocks
 * (plus the three sub-blocks) are stored as a JSON blob in `fields`.
 */
import { Database } from "bun:sqlite";

const db = new Database(process.env.CANVAS_DB ?? "canvas.sqlite", {
  create: true,
});

db.exec("PRAGMA journal_mode = WAL");
db.exec(`
  CREATE TABLE IF NOT EXISTS canvases (
    id         TEXT PRIMARY KEY,
    name       TEXT NOT NULL,
    fields     TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

export const BLOCK_IDS = [
  "problem",
  "existingAlternatives",
  "solution",
  "keyMetrics",
  "uvp",
  "highLevelConcept",
  "unfairAdvantage",
  "channels",
  "customerSegments",
  "earlyAdopters",
  "costStructure",
  "revenueStreams",
] as const;

export type BlockId = (typeof BLOCK_IDS)[number];
export type Fields = Record<BlockId, string>;

export type Canvas = {
  id: string;
  name: string;
  fields: Fields;
  createdAt: string;
  updatedAt: string;
};

type Row = {
  id: string;
  name: string;
  fields: string;
  created_at: string;
  updated_at: string;
};

export function emptyFields(): Fields {
  return Object.fromEntries(BLOCK_IDS.map(id => [id, ""])) as Fields;
}

/** Keep only known block ids, coerced to strings, so bad input can't poison a row. */
function sanitizeFields(input: unknown): Fields {
  const out = emptyFields();
  if (input && typeof input === "object") {
    for (const id of BLOCK_IDS) {
      const value = (input as Record<string, unknown>)[id];
      if (typeof value === "string") out[id] = value;
    }
  }
  return out;
}

function toCanvas(row: Row): Canvas {
  return {
    id: row.id,
    name: row.name,
    fields: sanitizeFields(JSON.parse(row.fields)),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const selectAll = db.query<Row, []>(
  "SELECT * FROM canvases ORDER BY updated_at DESC",
);
const selectOne = db.query<Row, [string]>(
  "SELECT * FROM canvases WHERE id = ?",
);
const insertOne = db.query<Row, [string, string, string, string, string]>(
  `INSERT INTO canvases (id, name, fields, created_at, updated_at)
   VALUES (?, ?, ?, ?, ?) RETURNING *`,
);
const updateOne = db.query<Row, [string, string, string, string]>(
  `UPDATE canvases SET name = ?, fields = ?, updated_at = ?
   WHERE id = ? RETURNING *`,
);
const deleteOne = db.query<Row, [string]>(
  "DELETE FROM canvases WHERE id = ? RETURNING *",
);

export function listCanvases(): Canvas[] {
  return selectAll.all().map(toCanvas);
}

export function getCanvas(id: string): Canvas | null {
  const row = selectOne.get(id);
  return row ? toCanvas(row) : null;
}

export function createCanvas(name: string, fields?: unknown): Canvas {
  const now = new Date().toISOString();
  const row = insertOne.get(
    crypto.randomUUID(),
    name.trim() || "Untitled canvas",
    JSON.stringify(sanitizeFields(fields)),
    now,
    now,
  )!;
  return toCanvas(row);
}

export function updateCanvas(
  id: string,
  patch: { name?: unknown; fields?: unknown },
): Canvas | null {
  const existing = getCanvas(id);
  if (!existing) return null;

  const name =
    typeof patch.name === "string" && patch.name.trim()
      ? patch.name.trim()
      : existing.name;
  const fields =
    patch.fields === undefined
      ? existing.fields
      : sanitizeFields(patch.fields);

  const row = updateOne.get(
    name,
    JSON.stringify(fields),
    new Date().toISOString(),
    id,
  );
  return row ? toCanvas(row) : null;
}

export function deleteCanvas(id: string): boolean {
  return deleteOne.get(id) !== null;
}
