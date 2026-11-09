# 02 - Architectural & Operational Decisions

## ADR-001: Two-Tier Low-Token Architecture (Preloaded 15 + On-Demand 67)
- **Context:** Loading all 82 skills and 30 agents into `.agents/` consumes ~3,800+ tokens on every turn.
- **Decision:** Preload only 15 high-frequency skills and 11 core agents in `.agents/`, and index the remaining 67 skills in `rules/common/secdevops-router.md` for on-demand `read_file` loading.
- **Consequence:** >85% reduction in per-message system prompt overhead with zero loss of capability.

## ADR-002: Public, Versioned `context/` with Post-Verification Update Gate
- **Status:** Revised 2026-11-09 (supersedes the original "strictly local" decision).
- **Context:** Context files must never record unverified or broken work. The original decision (exclude `context/` via `.gitignore` and `.git/info/exclude`) was never implemented: `context/` has always been tracked (6 files) and the README publicly showcases the Obsidian Graph, which is a project feature.
- **Decision:** Keep `context/` public and versioned. Do not add it to `.gitignore` or `.git/info/exclude`. Enforce via `secdevops-router.md` that `context/` is updated only **after** changes are tested, verified, and 100% bug-free.
- **Consequence:** The governance ledger is auditable in public history; the strict update gate remains the quality control.

## ADR-003: 100% E: Drive Isolation (author's local environment)
- **Context:** C: drive space is constrained on the author's machine.
- **Decision:** Keep Node.js (`E:\nodejs`), npm cache (`E:\npm-cache`), installer state (`E:\antigravity-kit\.home`), memory vault (`E:\antigravity-kit\memory-vault`), and repositories on `E:\`.
- **Consequence:** This is a local-environment decision only; it is **not** a requirement for users of this repository, which resolves all paths relative to the clone root with optional `AGY_*` overrides.

## ADR-004: Install-State Removed from Version Control
- **Context:** `.agents/ecc-install-state.json` is a machine-specific installation receipt. It contained 78 absolute paths from the author's machine, 36 of them pointing to `E:\antigravity-kit\ecc-secdevops` (a source directory that no longer exists), and zero references to the current working location. Committing it leaks local layout and risks repair/uninstall acting on stale paths.
- **Decision:** Remove `.agents/ecc-install-state.json` from Git tracking (`git rm --cached`) and ignore it via `.gitignore`. The stale local receipt was also retired from the working tree (backup kept outside the repository) because a `repair.js` dry-run showed that repair recomputes its plan from the full install manifests and would re-expand the curated 2-tier profile (~107 extra files) instead of merely refreshing hashes. The receipt is regenerable by `scripts/install-apply.js` only when a deliberate full install is intended. This repository is the source of truth, not an installation target.
- **Consequence:** Fresh clones carry no machine-specific state. `doctor.js` exits 0 with no install-state present ("not installed" is the accurate state for a source repository). `repair.js`/`uninstall.js` become no-ops instead of acting on stale scope. Re-running the installer is a deliberate full-profile operation, not part of routine diagnostics.

## ADR-005: ECC Runtime Is Vendored
- **Context:** `scripts/`, `manifests/`, and `hooks/` (318 files, ~2.84 MB) are inherited from the ECC installer runtime, pinned at `ecc-universal@2.2.3` (see `docs/ANTIGRAVITY-GUIDE.md`).
- **Decision:** Keep the runtime vendored in this repository rather than consuming it as an external dependency. Authorship and update rules are delimited in `docs/UPSTREAM.md`.
- **Consequence:** Clones are self-contained; upstream updates must be applied deliberately and verified against the published test suite.
