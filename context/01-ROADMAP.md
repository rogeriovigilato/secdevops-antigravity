# 01 - Roadmap & Validation Checklist

## Current Phase — Full Local & Pre-GitHub Validation
- [x] **1. Validate Native Discovery in Antigravity:** Confirmed that the 15 preloaded skills, 11 core agents, 7 workflows, and 6 `common-*` rules are discovered automatically.
- [x] **2. Validate On-Demand Router & Step #1 Auto-Trigger (`common-secdevops-router.md`):** Verified both manual and blind subagent tests (`96c5425b`), confirming automatic `read_file` activation on Step #1 across Ring 2 and Ring 4 skills.
- [x] **3. Validate Diagnostics CLI & Memory Vault:** Verified `node scripts/doctor.js --target antigravity` (at the time: `Status: OK`, `checked=1, ok=1, warnings=0, errors=0`) and configured the memory vault (now `.agents/memory-vault` by default, or `AGY_MEMORY_VAULT`).
- [x] **4. Final Pre-GitHub Audit & Release:** Synchronized `.agents/`, `token-monitor/`, and `context/` (Obsidian Graph), validated SVG/Markdown/tests with `code-reviewer`, and committed to `main` for `https://github.com/rogeriovigilato/secdevops-antigravity.git`.

## Completed Milestones
- [x] **Antigravity Galaxy Mind & Token Radar (`token-monitor/`):** Official visual telemetry monitor verified with TDD (15/15 tests at the time, superseded by the current 24/24 suite) and `code-reviewer` approval. Features 4 orbital rings (11+15 preloaded and 19+67 on-demand), parallel multi-skill lighting, `EN` / `PT-BR` toggle, On-Demand ring filter, friendly session selector + instant refresh button, sliding per-step token chart, and `Document Picture-in-Picture` Corner Popup.
- [x] **2026-11-09 Portability & Documentation Audit:** Removed absolute-machine-path dependence from workflows/rules (`AGY_*` env overrides + workspace-relative resolution), untracked the machine-specific install-state (ADR-004), corrected documentation counts (24/24 tests, 13 language rules, 11 core agents, 87 commands), and documented the vendored ECC runtime in `docs/UPSTREAM.md` (ADR-005).
