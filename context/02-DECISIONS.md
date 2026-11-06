# 02 - Architectural & Operational Decisions

## ADR-001: Two-Tier Low-Token Architecture (Preloaded 15 + On-Demand 67)
- **Context:** Loading all 82 skills and 30 agents into `.agents/` consumes ~3,800+ tokens on every turn.
- **Decision:** Preload only 15 high-frequency skills and 10 core agents in `.agents/`, and index the remaining 67 skills in `rules/common/secdevops-router.md` for on-demand `read_file` loading.
- **Consequence:** >85% reduction in per-message system prompt overhead with zero loss of capability.

## ADR-002: Strictly Local `context/` with Post-Verification Update Gate
- **Context:** Context files must never pollute public Git history or record unverified/broken work.
- **Decision:** Exclude `context/` via both `.gitignore` and `.git/info/exclude`, and enforce via `secdevops-router.md` that `context/` is updated only after changes are tested and 100% bug-free.

## ADR-003: 100% E: Drive Isolation
- **Context:** C: drive space is constrained.
- **Decision:** Keep Node.js (`E:\nodejs`), npm cache (`E:\npm-cache`), installer state (`E:\antigravity-kit\.home`), memory vault (`E:\antigravity-kit\memory-vault`), and repositories on `E:\`.