# Upstream: ECC Runtime (Vendored)

This repository vendors the **ECC installer/diagnostics runtime** originally published as `ecc-universal@2.2.3` (see `docs/ANTIGRAVITY-GUIDE.md`). This document delimits what is authored here, what is vendored, and how to update the upstream safely.

## What is vendored

| Path | Contents | Role |
| :--- | :--- | :--- |
| `scripts/` | 318 files, ~2.84 MB (installer, doctor, repair, uninstall, list-installed, memory CLI/MCP, hooks tooling, shared libs) | Inherited ECC runtime — mostly catalog/infrastructure |
| `manifests/` | Installer module and profile manifests | Inherited ECC runtime |
| `hooks/` | Hook definitions/consent metadata used by install targets | Inherited ECC runtime |

The pinned upstream version is `ecc-universal@2.2.3`. The install-state schema is `ecc.install.v1` (`manifestVersion: 1`).

## What is authored in this repository

| Path | Contents |
| :--- | :--- |
| `.agents/` | Preloaded 2-tier profile: 15 skills, 11 agents, 7 workflows (incl. `/monitor`), 20 rule files (6 `common-*` + 13 language rules + `README.md`) |
| `skills/` | On-demand catalog — 82 skill folders (`<name>/SKILL.md`) |
| `agents/` | On-demand catalog — 30 subagent definitions |
| `commands/` | 87 slash workflows/commands (source of the `.agents/workflows/` copies) |
| `contexts/` | 4 operational posture modes (`dev`, `review`, `research`, `secops`) |
| `rules/` | Rule-pack sources (`common`, `golang`, `python`, `typescript`) — source of the flattened `.agents/rules/` copies |
| `token-monitor/` | Galaxy Mind & Token Radar (HTTP+SSE on `127.0.0.1:4317`, 24 automated tests) |
| `context/` | Governance ledger (versioned, Obsidian Graph compatible) |
| `docs/` | Guides, assets, and this document |

## Scripts actually used by this project's flow

- `scripts/install-apply.js` — regenerates `.agents/` from `rules/`, `agents/`, `commands/` and rewrites the local install-state (see `package.json` → `install:antigravity`).
- `scripts/doctor.js` — health diagnostics (`doctor:antigravity`); reads the local install-state when present and verifies managed-file hashes.
- `scripts/repair.js` — reconciles managed files and install-state when drift is detected.
- `scripts/uninstall.js` — removes managed files recorded in the install-state.
- `scripts/list-installed.js` — lists install targets and managed operations.

Everything else under `scripts/` is catalog/infrastructure inherited from ECC and is not required by the core workflow of this repository.

## Updating the upstream safely

1. Never delete vendored files without proving they are unreferenced (`git grep` plus a full test/doctor run).
2. Prefer upstream-compatible changes in `scripts/lib/` over local forks of library code.
3. After any upstream sync: re-run `node scripts/doctor.js --target antigravity` and the token-monitor suite (`node --test token-monitor/test/*.test.js`), then update `context/00-STATE.md` and `context/03-CHANGELOG-LOCAL.md`.
4. Keep `docs/ANTIGRAVITY-GUIDE.md` version references in sync with the vendored runtime.

## Licensing and attribution

The vendored ECC runtime is distributed under the MIT License,
Copyright (c) 2026 Affaan Mustafa. The full upstream license text and the
scope of vendored paths are recorded in
[`THIRD-PARTY-NOTICES.md`](../THIRD-PARTY-NOTICES.md).

Other third-party components keep their own license files inside their
directories (for example, `skills/context-and-decisions/LICENSE` and
`skills/osint-investigation/LICENSE.txt`).
