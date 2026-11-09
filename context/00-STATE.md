# 00 - Verified Current State (secdevops-antigravity)

- **Golden Rule:** Always review every modification, verify dependencies before editing or deleting, and run the automated test suite and code review before marking work complete. All tooling resolves paths relative to the repository root, with optional `AGY_*` environment overrides.
- **Repository Root:** any clone location. No absolute path is required to use this project (e.g. `E:\antigravity-kit\secdevops-antigravity` on the author's machine).
- **Memory Vault (Markdown / Obsidian-compatible):** `.agents/memory-vault` by default, or `AGY_MEMORY_VAULT` when set.
- **Node.js:** >= 18. When `node` is not in `PATH`, point `AGY_NODE_BIN` at the binary.

## Completed & Verified Components
1. **Two-Tier Low-Token Architecture + Mandatory Auto-Triggers:**
   - **Tier 1 — Preloaded in `.agents/`:** 15 core skills, 11 core agents (including `tdd-guide`), 7 slash workflows (`/` including `/monitor`), 6 `common-*` rules (`always_on`, including `common-secdevops-router.md` with **Section 4: Mandatory Auto-Triggers & Delivery Gate**), and 13 language rules (4 Golang + 5 Python + 4 TypeScript, with `trigger: glob`), plus the rules catalog `README.md` — 20 files total.
   - **Tier 2 — On-Demand Catalog at Root (`skills/`, `agents/`, `commands/`, `contexts/`):** 82 total skills, 30 total agents, 87 commands, and 4 operational context modes (`dev.md`, `review.md`, `research.md`, `secops.md`). Automatically loaded via `read_file` on Step #1 whenever a prompt touches a matching domain.
2. **Official Antigravity Galaxy Mind & Token Radar (`token-monitor/`):**
   - Local HTTP + SSE telemetry server (`http://127.0.0.1:4317`) with 4 concentric orbital rings (11+15 preloaded and 19+67 on-demand), parallel multi-skill beam highlighting, smart session selector (`Main Chat` / `Subagent`) + `🔄 Refresh Chats` button, sliding 6-step token delta chart, `EN` / `PT-BR` i18n switcher, and `Document Picture-in-Picture` Corner HUD.
   - Validated with **24/24 automated tests passing**. The historical `84.58%` line coverage refers to the earlier 15-test suite; coverage of the current 24-test suite has not been re-measured.
3. **Repository Cleanup & Decoupling:**
   - Removed unused third-party harness directories and unreferenced legacy scripts.
   - Preserved valid MIT `LICENSE`.

## Local Environment (author's machine — legacy, not required)

> These paths describe the original author's setup only. They are not requirements for using this repository.

- **Production / GitHub clone:** `E:\antigravity-kit\secdevops-antigravity`
- **Active working copy:** `E:\hermes\secdevops-antigravity`
- **Global profile:** `E:\antigravity-kit\global-profile\.agents`
- **Memory vault:** `E:\antigravity-kit\memory-vault`
- **Portable Node.js:** `E:\nodejs` (`v26.13.0`) | **npm cache:** `E:\npm-cache` | **Installer home:** `E:\antigravity-kit\.home`
