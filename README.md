# Lean Canvas

A one-page Lean Canvas editor. Nine blocks laid out in Ash Maurya's
arrangement, with autosave to a local SQLite database.

## Run

```bash
bun install
bun dev
```

Then open the URL it prints (http://localhost:3000 by default).

## Using it

- Type in any block — edits autosave ~0.7s after you stop typing. The status
  line under the toolbar shows `Saving…` / `All changes saved`.
- **⌘S / Ctrl-S** saves immediately.
- **New** starts another canvas; the dropdown switches between them. Keep one
  canvas per customer segment, and a new one when your thinking shifts, so you
  can see how it changed.
- **Export .md** downloads the current canvas as Markdown.

## Layout

Left half is the product, right half is the market, with the UVP bridging them
in the center. Numbered badges show the suggested fill order (Problem →
Customer Segments → UVP → Solution → Channels → Revenue → Costs → Key Metrics →
Unfair Advantage), not reading order.

## Storage

Canvases live in `canvas.sqlite` in the project root (gitignored). Set
`CANVAS_DB` to point elsewhere. The nine blocks are stored as a JSON column, so
adding a block only means editing `src/blocks.ts` and `BLOCK_IDS` in
`src/db.ts`.

## Files

| File | Role |
|---|---|
| `src/index.ts` | Bun server: static frontend + `/api/canvases` CRUD |
| `src/db.ts` | SQLite schema and queries |
| `src/blocks.ts` | Block definitions, hints, and grid placement |
| `src/useCanvases.ts` | Canvas list, selection, debounced autosave |
| `src/App.tsx` | Page shell, keyboard shortcut, Markdown export |
| `src/Block.tsx` | One auto-growing block |
| `src/CanvasBar.tsx` | Toolbar: name, switcher, new/export/delete |
| `src/index.css` | Grid layout (the canvas geometry) and theme |

## Production

```bash
bun run build   # bundle to dist/
bun start       # serve with NODE_ENV=production
```
