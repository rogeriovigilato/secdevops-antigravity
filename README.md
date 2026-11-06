# 🌌 SecDevOps Antigravity — 2-Tier Low-Token Agent Architecture & Galaxy Mind Radar

<p align="center">
  <img src="./docs/assets/galaxy-monitor-animated.svg" alt="Antigravity Galaxy Mind & Token Radar (Animated Live Preview)" width="100%" />
</p>

<p align="center">
  <strong>Arquitetura de Agentes em 2 Camadas (&gt;85% Economia de Tokens) • Auto-Trigger Inteligente no Passo #1 • Monitor Galáctico de Telemetria em Tempo Real • Grafo de Contexto Obsidian</strong>
</p>

---

## 🚀 Visão Geral

O **SecDevOps Antigravity** é um ecossistema completo de Engenharia, Segurança (SecOps/OSINT), Redes/Homelab, Arquitetura de Software, TDD e Governança de Contexto projetado nativamente para o **Google Antigravity (AGY)**.

Em vez de carregar todas as 82 skills e 30 subagentes de uma vez no prompt de sistema (o que consumiria milhares de tokens a cada mensagem), este projeto implementa uma **Arquitetura Orbital em 4 Anéis (2 Camadas)** com **Auto-Gatilho Obrigatório (Seção 4 do Roteador)**:

| Anel Orbital | Camada | Itens | Como Funciona |
| :--- | :--- | :--- | :--- |
| **🟣 Anel 1** | Pré-Carregada (`.agents/agents/`) | **11 Agents Principais** | Sempre prontos na sessão (`planner`, `architect`, `tdd-guide`, `code-reviewer`, `security-reviewer`, `database-reviewer`, `python-reviewer`, `network-config-reviewer`, `network-troubleshooter`, `build-error-resolver`, `code-explorer`) |
| **🔵 Anel 2** | Pré-Carregada (`.agents/skills/`) | **15 Skills Principais** | Skills de alta frequência (`verification-loop`, `security-review`, `git-workflow`, `docker-patterns`, `deployment-patterns`, `network-config-validation`, `unified-memory`, `strategic-compact`, etc.) |
| **🩷 Anel 3** | Sob Demanda (`agents/`) | **19 Agents Especialistas** | Subagentes adicionais para linguagens e domínios específicos |
| **🟡 Anel 4** | Sob Demanda (`skills/`) | **67 Skills Especializadas** | Carregadas automaticamente via `read_file` no **Passo #1** pelo índice em `common-secdevops-router.md` apenas quando o assunto exige |

---

## ⚡ Auto-Gatilhos Obrigatórios & Delivery Gate (`common-secdevops-router.md`)

Graças à **Seção 4 (`Mandatory Auto-Triggers & Delivery Gate`)** configurada em `.agents/rules/common-secdevops-router.md`, você **não precisa lembrar nem digitar o nome de nenhuma skill ou subagente**:

1. **Auto-Skill Trigger no Passo #1:** Sempre que sua pergunta tocar em qualquer domínio do catálogo (Redes, VLAN, Cisco IOS, WireGuard, Pi-hole, Kubernetes, PostgreSQL, Redis, Segurança, OSINT, etc.), o agente aciona `read_file` automaticamente nas `SKILL.md` correspondentes antes de responder.
2. **Delivery Gate Automático Pós-Código:** Após criar ou editar qualquer código ou interface, o agente é obrigado a:
   - Rodar a suíte de testes automatizados (`node --test` / `pytest` / `go test`) e confirmar 100% de aprovação;
   - Acionar automaticamente o subagente `code-reviewer` (e `security-reviewer` / `network-config-reviewer` quando aplicável);
   - Validar servidores locais em modo daemon (`IsDaemon: true`) com verificação de status HTTP.

---

## 🛰️ Radar Galáctico Antigravity — Mente & Tokens (`token-monitor/`)

O repositório inclui o **Antigravity Galaxy Mind & Token Radar** (`token-monitor/`), um painel visual em tempo real (`http://127.0.0.1:4317`) com suporte a **Document Picture-in-Picture (PiP)**:

- **Órbita Interativa de 4 Anéis:** Veja em tempo real quais Skills (Anéis 2 e 4) e Subagentes (Anéis 1 e 3) estão conectados ao núcleo `AGY CORE` — inclusive quando múltiplas skills acendem simultaneamente no mesmo passo.
- **Seletor de Sessões Inteligente + Botão `🔄 Atualizar Chats`:** Identifica automaticamente **Chats Principais (`🟢`)** e **Subagentes (`🤖`)**, exibindo o assunto da conversa e o total de passos.
- **Gráfico Deslizante de Consumo de Tokens por Passo:** Acompanha o passo inspecionado (`⏮ Anterior` / `⏭ Próximo`), mostrando os tokens novos gastos em cada passo (`+In/Out`), o ícone da ação executada (`⚡` Skill, `🤖` Subagente, `💻` Terminal, `📄` Leitura, `✏️` Edição) e a taxa de **Reuso de Cache**.
- **Filtros Instantâneos:** Alternância `PT-BR` / `EN` e filtro `Mostrar Sob Demanda: SIM (4 Anéis) / NÃO (Só Carregados)`.
- **Mini-Popup Flutuante (`📌 Popup no Canto / PiP`):** Janela compacta sempre no topo para acompanhar os feixes e o consumo de tokens enquanto programa.

### Comandos Rápidos no Chat (`/monitor`)

```text
/monitor start    # Inicia o servidor em background e abre http://127.0.0.1:4317
/monitor popup    # Abre diretamente no modo Mini-Popup de canto
/monitor status   # Exibe o resumo de tokens e cache da sessão atual no chat
/monitor stop     # Encerra o servidor local na porta 4317
```

Ou via terminal:

```bash
node token-monitor/src/cli.js start
node --test token-monitor/test/*.test.js
```

---

## 🧠 Painel de Contexto Local & Grafo Obsidian (`context/`)

O projeto mantém sua memória arquitetural estruturada na pasta `context/`, pronta para visualização no **Obsidian Graph View**:

<p align="center">
  <img src="./docs/assets/obsidian-context-graph.png" alt="Obsidian Context Graph View" width="85%" />
</p>

- **`context/00-INDEX.md`** — Ponto central do grafo conectando todos os documentos de governança.
- **`context/00-STATE.md`** — Estado atual verificado, isolamento de ambiente e fluxo de trabalho.
- **`context/01-ROADMAP.md`** — Checklist de validação e evolução contínua.
- **`context/02-DECISIONS.md`** — Registros de Decisão de Arquitetura (ADRs).
- **`context/03-CHANGELOG-LOCAL.md`** — Histórico cronológico de entregas 100% testadas e livres de bugs.
- **`context/04-ARCHITECTURE.md`** — Mapa completo da estrutura de diretórios.

---

## 📂 Estrutura do Repositório

```text
secdevops-antigravity/
├── .agents/                  # Perfil Pré-Carregado (15 skills, 11 agents, 7 workflows incl. /monitor, 20 rules)
├── token-monitor/            # Radar Galáctico & Monitor de Tokens (127.0.0.1:4317 + 15 testes automatizados)
├── context/                  # Cofre de Contexto & ADRs compatível com Obsidian Graph View
├── agents/                   # Catálogo completo com 30 definições de subagentes
├── skills/                   # Catálogo completo com 82 skills (SecDevOps, Homelab, Cloud, Backend, OSINT, TDD)
├── commands/                 # 87 workflows e comandos slash (incluindo /monitor)
├── contexts/                 # 4 modos operacionais (dev.md, review.md, research.md, secops.md)
├── rules/                    # Regras modulares (common, python, typescript, golang)
├── scripts/                  # Instalador multi-perfil, doctor.js, repair.js e utilitários de memória
└── manifests/                # Manifestos de módulos e perfis de instalação
```

---

## 🛠️ Como Usar

1. **Uso Direto (Zero Configuração):**
   Basta clonar este repositório e abrir a pasta no **Antigravity**. Como a pasta `.agents/` já está pré-configurada na raiz, todas as **15 skills pré-carregadas**, **11 agents**, **7 workflows (`/monitor`)**, **20 rules** e o **roteador para as 67 skills sob demanda** entram em vigor imediatamente!
2. **Diagnóstico de Saúde (`doctor.js`):**
   ```bash
   node scripts/doctor.js --target antigravity
   ```
3. **Executar Testes do Token Monitor:**
   ```bash
   node --test token-monitor/test/*.test.js
   ```

---

## 📄 Licença

Distribuído sob a licença **MIT**. Veja [LICENSE](./LICENSE) para mais informações.
