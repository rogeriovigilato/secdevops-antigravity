# 04 - Directory & Architecture Map

```text
E:\antigravity-kit\
├── secdevops-antigravity\      # Clean GitHub repository & full on-demand catalog
│   ├── context\               # Local-only state (git-ignored)
│   ├── agents\                 # 30 agent definitions
│   ├── commands\               # 86 workflow definitions
│   ├── contexts\               # 4 posture modes (dev, review, research, secops)
│   ├── rules\                  # 4 rule packs (common, python, typescript, golang)
│   ├── skills\                 # 82 skill folders (<name>/SKILL.md)
│   ├── scripts\                # Installer, doctor, repair, uninstall, memory CLI/MCP
│   └── manifests\              # Installer module & profile manifests
├── global-profile\
│   └── .agents\                # Preloaded low-token profile (15 skills, 11 agents, 7 workflows incl. /monitor, rules)
├── token-monitor\              # Official Antigravity Galaxy Mind & Token Radar (127.0.0.1:4317)
├── memory-vault\               # Persistent Markdown memory vault (project/, user/, sessions/)
└── .home\                      # Redirected HOME for installer SQLite state
```