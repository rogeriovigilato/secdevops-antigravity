# Third-Party Notices

This repository is distributed under the MIT License (see `LICENSE`). It also
includes material from third-party projects. The notices below are provided in
addition to the root `LICENSE`.

## ECC — Everything Claude Code

- **Project:** ECC (Everything Claude Code)
- **Upstream:** https://github.com/affaan-m/ECC
- **npm package:** `ecc-universal` (pinned at `2.2.3`)
- **Copyright:** Copyright (c) 2026 Affaan Mustafa
- **License:** MIT

### Scope in this repository

The following directories contain the vendored ECC installer/diagnostics
runtime and are distributed under the upstream MIT license:

- `scripts/` — installer, doctor, repair, uninstall, list-installed, memory
  CLI/MCP, hooks tooling, and shared libraries
- `manifests/` — install module, component, and profile manifests
- `hooks/` — hook definitions and consent metadata used by install targets

The curated profile in `.agents/`, the on-demand catalog in `skills/`,
`agents/`, `commands/`, `contexts/`, and `rules/`, the `token-monitor/`
application, and the governance files in `context/` are maintained by the
secdevops-antigravity contributors. See `docs/UPSTREAM.md` for the authorship
boundary and update procedure.

### MIT License (ECC)

MIT License

Copyright (c) 2026 Affaan Mustafa

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Other third-party components

Some catalog skills include their own license files (for example,
`skills/context-and-decisions/LICENSE` and
`skills/osint-investigation/LICENSE.txt`). Those components remain under their
respective licenses.
