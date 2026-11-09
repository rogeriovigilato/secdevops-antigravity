# Token Benchmark Harness

This directory makes the README token benchmark reproducible from Antigravity
runtime transcripts instead of hand-edited estimates.

## Data source

Antigravity records per-call counters in:

```text
~/.gemini/antigravity/brain/<conversation-id>/.system_generated/logs/transcript.jsonl
```

The relevant event is `PLANNER_RESPONSE`, which carries:

- `input_tokens` — new (uncached) input tokens billed for that call
- `cache_read_tokens` — prompt-cache tokens read for that call
- `output_tokens` — generated tokens
- `tool_calls` — tool names invoked in that step

Prompt size is `input_tokens + cache_read_tokens`. New billed input is
`input_tokens` only. Never label the former as `input_tokens`.

Raw transcripts are **not committed** because they contain prompts, paths, and
workspace content. Only aggregated counters are stored in `results/`.

## Baseline scenarios

The 2026-11-08 baseline uses the same Cisco IOS task in both scenarios:

> Crie uma configuração segura de switch Cisco IOS para segmentar 2 VLANs:
> VLAN 10 (Servidores, 10.10.10.0/24) e VLAN 20 (Visitantes, 10.10.20.0/24,
> isolada da VLAN 10 via ACL), com DHCP snooping e port-security.
> Leia apenas `homelab-vlan-segmentation` e `cisco-ios-patterns`;
> não crie arquivos no disco.

English equivalent: create a secure Cisco IOS switch configuration with VLAN 10
(Servers) and VLAN 20 (Visitors, isolated via ACL), DHCP snooping, and
port-security, reading only those two skills and writing no files.

| Scenario | Preloaded profile | Runs |
| :--- | :--- | :--- |
| `A` | Full catalog: 82 skills, 30 agents, 19 curated rules | `5363df44`, `2892b0ae`, `90c67441` |
| `B` | 2-tier: 15 skills, 11 agents, 19 rules + router | `f6018ce4`, `c5f3e20f`, `cddd7aad` |
| `A_single_step` | Full catalog, one-step answer | `c101b2fb`, `25abaf2b` |

One Scenario A run (`90c67441`) started with a warm prompt cache. Its
`11,113` new-input value is reported per-run but excluded from the cold
uncached mean. The cold mean for Scenario A therefore uses N=2; the other
multi-step means use N=3, and the single-step scenario uses N=2.

## Metrics

| Metric | Definition |
| :--- | :--- |
| Step #1 prompt | First `PLANNER_RESPONSE`: `input_tokens + cache_read_tokens` |
| Step #2 prompt | Second token-bearing `PLANNER_RESPONSE` (after `read_file`): `input_tokens + cache_read_tokens` |
| Cumulative prompt | Sum of prompt tokens across all steps |
| New input | Sum of `input_tokens` across all steps (uncached) |
| New input (cold) | Same, restricted to runs whose Step #1 cache was zero |
| Output | Sum of `output_tokens` across all steps |

The harness also deduplicates multiple `PLANNER_RESPONSE` events for the same
`step_index`, keeping the one with the largest token payload.

## Reproduce the baseline

```bash
node benchmarks/extract-metrics.js
node benchmarks/disk-footprint.js
```

Outputs:

- `results/baseline-2026-11-08.json` — per-run and aggregate counters
- `results/baseline-2026-11-08.md` — human-readable table
- `results/disk-footprint-2026-11-08.json` — disk footprint methods

Use `--brain <dir>` if the Antigravity brain directory is not in the default
home location.

## Disk footprint definitions

`disk-footprint.js` reports three comparisons:

1. **Full catalog → preloaded main** (`-80.4%`):
   every file under `skills/`, `agents/`, and `rules/`, versus
   `.agents/skills/*/SKILL.md` + `.agents/agents/*.md` +
   `.agents/rules/*.md` (excluding the rules README) +
   `.agents/workflows/*.md`. This mixes file sets: the catalog side includes
   references and scripts, the preloaded side does not. **Do not use it as the
   headline.**
2. **Catalog main → preloaded main** (`-72.8%`, like-for-like):
   main definition files only on both sides.
3. **Full catalog → all `.agents/` files** (`-62.6%`, like-for-like):
   every file under each tree, including references, scripts, and READMEs.

The README headline uses comparison 2. Any disk number only makes sense with an
explicit file set; never compare the full catalog to a subset of `.agents/`
without saying so.

## Running a new benchmark

1. Define the scenarios (control, monolithic, 2-tier) and keep the task prompt
   identical across them.
2. Use fresh Antigravity sessions; run each scenario at least 3 times,
   interleaving A/B/control to reduce drift.
3. Keep the model, Antigravity version, repository commit, OS, and Node version
   constant. Record them in the results file.
4. Record `cache_read_tokens` for every step. Report cold and warm runs
   separately; never average them into one number.
5. Collect the transcript IDs, add them to `baseline-runs.json` (or a new
   config file), and run `extract-metrics.js`.
6. Update the README with the new aggregate values and the methodology block.
