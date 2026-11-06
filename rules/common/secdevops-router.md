# SecDevOps Router, Local Context Gate & Token Efficiency

## 1. Local Context Gate (`context/`)
- If a `context/` folder exists in the workspace root, read `context/00-STATE.md` and `context/01-ROADMAP.md` at the start of a task to avoid redundant codebase exploration.
- **STRICT UPDATE RULE:** Never modify any file inside `context/` during implementation or before verification. Only update `context/` (`00-STATE.md`, `01-ROADMAP.md`, `02-DECISIONS.md`, `03-CHANGELOG-LOCAL.md`, `04-ARCHITECTURE.md`) **AFTER** all changes are tested, verified, and confirmed 100% bug-free.

## 2. Token & Context Budget Efficiency
- Always bound terminal/log outputs (`--tail 40`, `Select-Object -First 30`) instead of dumping full logs into context.
- Prefer targeted searches and line-range file reads (`StartLine`/`EndLine`) over reading entire large files.
- When a task phase completes in a long conversation, remind the user they can compact context or record state in `context/`.

## 3. On-Demand SecDevOps Catalog (`skills/` & `contexts/` in Repo Root, or `E:/antigravity-kit/secdevops-antigravity`)
15 core skills and 11 core agents are preloaded in `.agents/`. When a task touches any specialized topic below, use `read_file` to load the corresponding Markdown file from `skills/<name>/SKILL.md` in the workspace root (or `E:/antigravity-kit/secdevops-antigravity/skills/<name>/SKILL.md` if running from `global-profile`) on demand:

- **Security & OSINT (`skills/<name>/SKILL.md`):** `osint-investigation`, `security-bounty-hunter`, `mcp-dependency-review`, `gateguard`, `safety-guard`, `workspace-surface-audit`, `agent-architecture-audit`, `automation-audit-ops`.
- **Containers, K8s & Infra (`skills/<name>/SKILL.md`):** `kubernetes-patterns`, `canary-watch`, `uncloud`, `flox-environments`, `github-ops`.
- **Networking & Homelab (`skills/<name>/SKILL.md`):** `homelab-network-readiness`, `homelab-network-setup`, `homelab-pihole-dns`, `homelab-vlan-segmentation`, `homelab-wireguard-vpn`, `netmiko-ssh-automation`, `network-bgp-diagnostics`, `network-interface-health`, `cisco-ios-patterns`.
- **Decision, Governance & Memory (`skills/<name>/SKILL.md`):** `context-and-decisions`, `recursive-decision-ledger`, `knowledge-ops`, `living-docs-governance`, `docs-governance`, `brownfield-retrospective`, `agent-self-evaluation`, `delivery-gate`, `santa-method`, `operator-approval-loop`, `intent-driven-development`, `rules-distill`, `growth-log`, `module-governance`, `module-regression`, `test-collaboration`, `repo-scan`, `search-first`, `blueprint`, `deep-research`, `research-ops`, `plan-canvas`, `plan-orchestrate`, `eval-harness`, `iterative-retrieval`, `context-budget`.
- **Architecture, Backend & DB (`skills/<name>/SKILL.md`):** `hexagonal-architecture`, `contract-first`, `mcp-server-patterns`, `api-design`, `backend-patterns`, `coding-standards`, `database-migrations`, `postgres-patterns`, `redis-patterns`, `prisma-patterns`, `python-patterns`, `python-testing`, `golang-patterns`, `golang-testing`, `tdd-workflow`, `e2e-testing`, `error-handling`, `codebase-onboarding`, `documentation-lookup`.
- **Context Modes (`contexts/<name>.md`):** `dev.md`, `review.md`, `research.md`, `secops.md`.
- **Memory Vault Path:** `.agents/memory-vault` (or `E:/antigravity-kit/memory-vault` if present).

## 4. Mandatory Auto-Triggers & Delivery Gate (Never Wait for User Prompt)
- **Auto-Skill Trigger (`read_file`):** Whenever the user's request touches any domain covered by a preloaded skill (`.agents/skills/<name>/SKILL.md`) or an on-demand catalog skill (`skills/<name>/SKILL.md` or `E:/antigravity-kit/secdevops-antigravity/skills/<name>/SKILL.md`), you MUST call `read_file` on that `SKILL.md` in your **first step** automatically, without waiting for the user to name the skill.
- **Auto-Subagent & Delivery Gate (`invoke_subagent`):** After using `write_file` or `edit_file` on any code, script, or UI file, you are **FORBIDDEN** from declaring the work ready or asking the user to test before:
  1. Running the automated test suite (`node --test` / `pytest` / `go test`) and confirming 100% pass;
  2. Calling `invoke_subagent(TypeName: "code-reviewer")` (plus `security-reviewer` when touching network, servers, auth, or secrets, or `network-config-reviewer` for router/switch configs) and resolving any reported issues;
  3. Launching any long-running local server with `run_command(..., IsDaemon: true)` and verifying its HTTP status in a separate step.
