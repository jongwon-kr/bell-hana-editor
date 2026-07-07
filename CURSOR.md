# Using this repo with Cursor

This project includes **Cursor project rules** so the Karpathy-inspired behavioral guidelines apply automatically when you work here.

## In this repository

1. Open the folder in Cursor.
2. Rules are committed in two places (keep them in sync):
   - [`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc) — Cursor project rules (`alwaysApply: true`)
   - [`.cursorrules`](.cursorrules) — root fallback for tools that read a single rules file
3. In Cursor, confirm under **Settings → Rules** that `karpathy-guidelines` appears.

## Use the same guidelines in another project

**Cursor (recommended):** Copy `.cursor/rules/karpathy-guidelines.mdc` into that project’s `.cursor/rules/` directory (create the folders if needed). Adjust or merge with existing rules as you like.

**Other tools:** If a stack only supports a root instruction file, copy [`CLAUDE.md`](CLAUDE.md) or [`.cursorrules`](.cursorrules) into that project instead (or merge into your existing instructions).

## Claude Code vs Cursor

- **Claude Code:** Per-project use can rely on [`CLAUDE.md`](CLAUDE.md).
- **Cursor:** Prefer `.cursor/rules/karpathy-guidelines.mdc`. Cursor does not read `CLAUDE.md` by default.

## For contributors

When you change the four principles, keep **[`CLAUDE.md`](CLAUDE.md)**, **[`.cursorrules`](.cursorrules)**, and **[`.cursor/rules/karpathy-guidelines.mdc`](.cursor/rules/karpathy-guidelines.mdc)** in sync.
