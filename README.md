# 🌌 SecDevOps Antigravity — 2-Tier Low-Token Agent Architecture & Galaxy Mind Radar

<p align="center">
  <img src="./docs/assets/galaxy-monitor-animated.svg" alt="Antigravity Galaxy Mind & Token Radar (Animated Live Preview)" width="100%" />
</p>

<p align="center">
  <strong>2-Tier Agent Architecture (&gt;85% Token Savings) • Step #1 Auto-Trigger Router • Real-Time Galaxy Mind &amp; Token Radar (PiP) • Obsidian Context Graph</strong>
</p>

---

## 🚀 Overview

**SecDevOps Antigravity** is a full-stack Software Engineering, Security (SecOps/OSINT), Networking/Homelab, System Architecture, TDD, and Context Governance ecosystem built natively for **Google Antigravity (AGY)**.

Instead of injecting all 82 skills and 30 subagents into the system prompt on every turn (which wastes thousands of tokens per message), this repository implements a **4-Ring Orbital Architecture (2 Tiers)** powered by **Mandatory Step #1 Auto-Triggers**:

| Orbital Ring | Tier | Count | How It Works |
| :--- | :--- | :--- | :--- |
| **🟣 Ring 1** | Preloaded (`.agents/agents/`) | **11 Core Agents** | Always ready in session (`planner`, `architect`, `tdd-guide`, `code-reviewer`, `security-reviewer`, `database-reviewer`, `python-reviewer`, `network-config-reviewer`, `network-troubleshooter`, `build-error-resolver`, `code-explorer`) |
| **🔵 Ring 2** | Preloaded (`.agents/skills/`) | **15 Core Skills** | High-frequency skills (`verification-loop`, `security-review`, `git-workflow`, `docker-patterns`, `deployment-patterns`, `network-config-validation`, `unified-memory`, `strategic-compact`, etc.) |
| **🩷 Ring 3** | On-Demand (`agents/`) | **19 Specialist Agents** | Specialized language and domain subagents loaded when needed |
| **🟡 Ring 4** | On-Demand (`skills/`) | **67 Specialist Skills** | Automatically loaded via `read_file` on **Step #1** through the index in `common-secdevops-router.md` only when the prompt touches that domain |

---

## ⚡ Mandatory Auto-Triggers & Delivery Gate (`common-secdevops-router.md`)

Thanks to **Section 4 (`Mandatory Auto-Triggers & Delivery Gate`)** in `.agents/rules/common-secdevops-router.md`, you **never need to remember or type any skill or subagent name**:

1. **Step #1 Auto-Skill Trigger:** Whenever a prompt touches any domain covered by the catalog (Networking, VLANs, Cisco IOS, WireGuard, Pi-hole, Kubernetes, PostgreSQL, Redis, Security, OSINT, etc.), the agent automatically calls `read_file` on the matching `SKILL.md` files on its very first step.
2. **Post-Code Automated Delivery Gate:** After creating or modifying any code, script, or UI file, the agent is strictly required to:
   - Run the automated test suite (`node --test` / `pytest` / `go test`) and verify a 100% pass rate;
   - Automatically invoke the `code-reviewer` subagent (plus `security-reviewer` / `network-config-reviewer` when applicable);
   - Verify any local daemon server (`IsDaemon: true`) with a live HTTP health check.

---

## 📊 Empirical Token Benchmark (Audited on Google Antigravity)

Instead of relying on theoretical guesses, we benchmarked **Scenario A (Monolithic — all 82 skills, 30 agents, and rules active in `.agents/`)** against **Scenario B (Our 2-Tier Architecture — 15 preloaded skills, 11 core agents, `trigger: glob` language rules, and `common-secdevops-router.md`)** by inspecting the actual `input_tokens` recorded by Google Antigravity in `.system_generated/logs/transcript.jsonl`.

### 1. Per-Turn System Prompt Overhead (Gemini BPE Tokenizer @ `5.42 bytes/token`)

| Injected Layer per Turn | 🔴 Scenario A (Monolithic) | 🟢 Scenario B (2-Tier Orbital) | 💰 Real Audited Savings |
| :--- | :---: | :---: | :---: |
| **1. Antigravity Base Prompt** *(Native IDE + Tools)* | `~11,233 tokens` | `~11,233 tokens` | *Fixed IDE baseline* |
| **2. Skills + Agents YAML Index** *(`<skills>` + `<subagents>`)* | **`7,428 tokens`** *(82 skills + 30 agents)* | **`1,650 tokens`** *(15 skills + 11 agents)* | **`-5,778 tokens/turn` (`-77.8%`)** |
| **3. Active Rules** *(`<user_rules>` in `transcript.jsonl`)* | **`4,257 – 6,660 tokens`** *(18–32 rules)* | **`2,403 tokens`** *(5 core + Router)* | **`-1,854 to -4,257 tokens/turn` (`-43.6% to -64.0%`)** |
| **🔥 Total Customization Weight / Turn** | **`11,685 – 14,088 tokens/turn`** | **`4,053 tokens/turn`** | **`-7,632 to -10,035 tokens/turn` (`-65.3% to -71.2%`)** |
| **📈 Total Step #1 `input_tokens` Billed** | **`~22,918 – 25,321 tokens`** | **`14,311 – 15,286 tokens`** *(measured)* | **`~230k – 300k tokens saved per 30-turn chat`** |

### 2. Controlled A/B Probe Sessions (`transcript.jsonl` Audit)

We also ran twin 1-step subagent probes (`TypeName: "self"`, identical prompt: `"Responda apenas 'OK - Cenario A/B medido' sem chamar nenhuma ferramenta"`) to isolate dynamic `<user_rules>` reloading on disk alongside real workspace sessions:

| Audited Session | Session ID | Active Profile | Step #1 `input_tokens` (`transcript.jsonl`) |
| :--- | :---: | :--- | :---: |
| **Main Workspace Session** | `55921528` | **Scenario B (2-Tier)** | **`14,311 tokens`** |
| **Blind VLAN Auto-Trigger Subagent** | `96c5425b` | **Scenario B (2-Tier)** | **`14,968 tokens`** |
| **Controlled Probe B** *(5 core rules + Router)* | `e4d1b9a1` | **Scenario B (2-Tier)** | **`15,286 tokens`** |
| **Controlled Probe A** *(18 common rules `always_on`)* | `5f2f6a0a` | **Scenario A (Rules Only)** | **`17,140 tokens`** *(+1,854 tokens from rules alone)* |

> **Key Engineering Takeaways:**
> - **Preloaded vs. Catalog Disk Payload:** Preloaded `.agents/` drops from **`1,365 KB` (`82 skills / 30 agents`)** down to **`262 KB` (`-80.8%`)**.
> - **Zero-Cost Workflows:** Custom slash workflows in `.agents/workflows/` (`0 tokens/turn`) stay dormant on disk until explicitly invoked via `/monitor` or `/command`.
> - **Surgical On-Demand Loading:** Loading a specialist skill from Ring 4 (`skills/<name>/SKILL.md`) via `read_file` costs only **`~750–1,200 tokens` once** when needed, rather than taxing every turn of every conversation.

---

## 🛰️ Antigravity Galaxy Mind & Token Radar (`token-monitor/`)

This repository includes the **Antigravity Galaxy Mind & Token Radar** (`token-monitor/`), a real-time visual telemetry server (`http://127.0.0.1:4317`) with native **Document Picture-in-Picture (PiP)** support:

- **Interactive 4-Ring Galaxy Orbit:** Watch in real time which Skills (Rings 2 & 4) and Subagents (Rings 1 & 3) are connected to the `AGY CORE` nucleus — including parallel multi-skill activations on the same step.
- **Smart Session Selector + `🔄 Refresh Chats` Button:** Automatically distinguishes **Main Chats (`🟢`)** and **Subagents (`🤖`)**, displaying the human-readable conversation topic and step count.
- **Sliding Token Usage per Step Chart:** Follows your inspected step (`⏮ Prev` / `⏭ Next`), displaying the new tokens spent per step (`+In/Out`), the action icon (`⚡` Skill, `🤖` Subagent, `💻` Terminal, `📄` Read, `✏️` Edit), and the **Cache Hit Rate**.
- **Instant Filters:** Toggle between `EN` / `PT-BR` and `Show On-Demand: ON (4 Rings) / OFF (Preloaded Only)`.
- **Always-on-Top Corner HUD (`📌 Corner Popup / PiP`):** Compact floating window with self-contained dark styling so you can monitor active beams and token usage while coding.

### Slash Workflow Commands (`/monitor`)

```text
/monitor start    # Starts the background daemon server and opens http://127.0.0.1:4317
/monitor popup    # Opens directly in compact Corner Popup mode
/monitor status   # Prints live token and cache telemetry in chat
/monitor stop     # Stops the local monitor server on port 4317
```

Or via terminal:

```bash
node token-monitor/src/cli.js start
node --test token-monitor/test/*.test.js
```

---

## 🧠 Local Context Gate & Obsidian Graph (`context/`)

Architectural decisions, verified state, and roadmaps are maintained in `context/`, structured for **Obsidian Graph View**:

<p align="center">
  <img src="./docs/assets/obsidian-context-graph.png" alt="Obsidian Context Graph View" width="85%" />
</p>

- **`context/00-INDEX.md`** — Central hub linking all governance documents.
- **`context/00-STATE.md`** — Verified current state, environment isolation, and workflow rules.
- **`context/01-ROADMAP.md`** — Validation checklist and continuous roadmap.
- **`context/02-DECISIONS.md`** — Architecture Decision Records (ADRs).
- **`context/03-CHANGELOG-LOCAL.md`** — Chronological log of 100% tested and verified deliverables.
- **`context/04-ARCHITECTURE.md`** — Complete directory and two-tier architecture map.

---

## 📂 Repository Structure

```text
secdevops-antigravity/
├── .agents/                  # Preloaded 2-Tier Profile (15 skills, 11 agents, 7 workflows incl. /monitor, 20 rules)
├── token-monitor/            # Official Galaxy Mind & Token Radar (127.0.0.1:4317 + 16 automated tests)
├── context/                  # Architectural Context Ledger compatible with Obsidian Graph View
├── agents/                   # Full catalog of 30 specialized subagent definitions
├── skills/                   # Full catalog of 82 skills (SecDevOps, Homelab, Cloud, Backend, OSINT, TDD)
├── commands/                 # 87 slash workflows and commands (including /monitor)
├── contexts/                 # 4 operational posture modes (dev.md, review.md, research.md, secops.md)
├── rules/                    # Modular rule packs (common, python, typescript, golang)
├── scripts/                  # Multi-target installer, doctor.js, repair.js, and memory utilities
└── manifests/                # Installer module and profile manifests
```

---

## 🛠️ Quick Start

1. **Zero-Config Workspace Usage:**
   Clone this repository and open it in **Google Antigravity**. Because `.agents/` is pre-configured at the root, all **15 preloaded skills**, **11 agents**, **7 workflows (`/monitor`)**, **20 rules**, and the **on-demand router for all 67 specialist skills** are active out of the box!
2. **Health Diagnostics (`doctor.js`):**
   ```bash
   node scripts/doctor.js --target antigravity
   ```
3. **Run the Token Monitor Test Suite:**
   ```bash
   node --test token-monitor/test/*.test.js
   ```

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE](./LICENSE) for details.
