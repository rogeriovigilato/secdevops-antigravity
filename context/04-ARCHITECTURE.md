# 04 - Directory & Architecture Map

```text
secdevops-antigravity/            # Repository root (any clone location)
├── .agents/                      # Preloaded low-token profile (15 skills, 11 agents, 7 workflows incl. /monitor, 19 rules + catalog README)
├── context/                      # Governance ledger (versioned, Obsidian Graph compatible)
├── agents/                       # 30 agent definitions
├── commands/                     # 87 workflow definitions
├── contexts/                     # 4 posture modes (dev, review, research, secops)
├── rules/                        # 4 rule packs (common, python, typescript, golang)
├── skills/                       # 82 skill folders (<name>/SKILL.md)
├── scripts/                      # Installer, doctor, repair, uninstall, memory CLI/MCP (vendored ECC runtime)
├── benchmarks/                   # Reproducible token benchmark (transcript parser + disk footprint)
├── manifests/                    # Installer module & profile manifests
├── docs/                         # Guides, assets, and UPSTREAM.md
└── token-monitor/                # Galaxy Mind & Token Radar (127.0.0.1:4317)
```

> **Author's local environment (legacy, not required):** `E:\antigravity-kit\` also contains `global-profile\.agents` (active global profile), `memory-vault` (session store), and `.home` (redirected installer home). All tooling resolves paths relative to the repository root, with optional `AGY_*` environment overrides; no absolute path is required.
