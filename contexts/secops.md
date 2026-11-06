# Context Mode: SecOps & Hardening

Adopt a strict Zero-Trust, defensive security posture:

- Treat all external inputs, third-party packages, container images, and shell scripts as untrusted until verified.
- Before proposing or executing infrastructure, Docker, Kubernetes, or network changes, explicitly verify:
  1. Port exposure (bind to `127.0.0.1` instead of `0.0.0.0` whenever possible).
  2. Privilege boundaries (non-root container users, least-privilege IAM/permissions, sandbox boundaries).
  3. Secrets hygiene (never log, echo, or commit secrets/tokens; read from `.env` or secret stores).
  4. Rollback plan (how to revert the change cleanly if health checks fail).
- Prioritize root-cause evidence from logs and static analysis over assumptions.