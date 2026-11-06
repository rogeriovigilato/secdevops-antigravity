# 00 - Estado Atual Verificado (secdevops-antigravity)

- **Idioma do usuário:** Português (Brasil).
- **Regra de ouro de trabalho:** SEMPRE revisar cada alteração, perguntar a si mesmo se está fazendo certo, verificar dependências antes de apagar/editar e confirmar com o usuário antes de ações destrutivas ou instalações. Tudo deve ficar concentrado no disco `E:`.
- **Raiz do projeto (vai para o GitHub):** `E:\antigravity-kit\secdevops-antigravity`
- **Perfil mestre global:** `E:\antigravity-kit\global-profile\.agents`
- **Cofre de Memória (Markdown / compatível com Obsidian):** `E:\antigravity-kit\memory-vault`
- **Node.js portátil:** `E:\nodejs` (`v26.13.0` LTS) | **Cache npm:** `E:\npm-cache` | **Home do instalador:** `E:\antigravity-kit\.home`

## O que já está pronto neste repositório
1. **Arquitetura em 2 camadas (Economia de Tokens) + Auto-Triggers:**
   - **Camada 1 — Pré-carregada em `.agents/`:** 15 skills principais, 11 agents principais (incluindo `tdd-guide`), 7 workflows (`/` incluindo `/monitor`), 6 rules `common` (`always_on`, incluindo `common-secdevops-router.md` com **Seção 4: Mandatory Auto-Triggers & Delivery Gate**) e 14 rules de linguagem (`python`, `typescript`, `golang` com `trigger: glob`).
   - **Camada 2 — Catálogo sob demanda na raiz (`skills/`, `agents/`, `commands/`, `contexts/`):** 82 skills no total, 30 agents, 87 commands e 4 modos de contexto (`dev.md`, `review.md`, `research.md`, `secops.md`). O agente lê esses arquivos via `read_file` automaticamente no Passo #1 quando o assunto toca qualquer domínio do catálogo.
2. **Token Monitor Oficial (`E:\antigravity-kit\token-monitor`):**
   - Servidor local em `http://127.0.0.1:4317` com 4 anéis orbitais (11+15 pré-carregados e 19+67 sob demanda), suporte a múltiplas skills acesas simultaneamente, seletor de sessões com nomes amigáveis (`Chat Principal` / `Subagente`), gráfico deslizante de consumo por passo com legenda e ícones de ação, filtro de idioma (`PT-BR` / `EN`) e modo Popup de Canto (`Document Picture-in-Picture` com CSS isolado).
   - Validado com **14/14 testes automatizados** (`84.58%` de cobertura) e auditado pelo `code-reviewer` (`APPROVE`, 0 issues).
2. **Limpeza e Desvinculação concluídas:**
   - Removidas pastas antigas (`original`, `original-affaan`, `teste`, `ecc-secdevops`).
   - Removidas pastas de outros harnesses (`.openclaw`, `.hermes`, `.cursor`, `.codex`, `pi`, `ecc2` etc.), arquivos `hooks.md` inúteis e scripts sem dependência (`build-opencode.js`, `build-pi-core.js`, `claw.js`, `nasiko.js`, `gan-harness.sh`, `release-video-suite.js`, `scripts/ci`, `scripts/dev`, `scripts/dsh`, `scripts/codex-git-hooks`).
   - Mantidos `qwen-adapt-agents.js` (requerido por `content-transform.js`) e `hooks/` (checado por `harness-audit.js`).
   - Removidos links/propagandas do autor original e tags `origin: ECC`. Mantido `LICENSE` MIT legalmente válido.
3. **Blindagem do Git:**
   - `context/`, `.agents/` e `node_modules/` estão no `.gitignore` e em `.git/info/exclude` (nunca vão para o GitHub).
## Fluxo Oficial de Trabalho (Lab -> GitHub)
- **`E:\antigravity-kit\global-profile` (LABORATÓRIO / TESTE):** é o workspace principal onde abrimos no Antigravity, fazemos experimentos, ajustes e validações.
- **`E:\antigravity-kit\secdevops-antigravity` (PRODUÇÃO / GITHUB):** NUNCA deve ser alterado diretamente antes de testar. Só copiamos/aplicamos alterações nele DEPOIS que estiverem 100% testadas, validadas e aprovadas no `global-profile`.