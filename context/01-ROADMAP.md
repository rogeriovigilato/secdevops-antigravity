# 01 - Roadmap (O que falta fazer)

## Fase Atual — Validação Completa Local (Antes do GitHub)
- [x] **1. Validar descoberta no Antigravity:** confirmar no novo chat que as 15 skills, os 11 agents e as 6 rules `common-*` foram carregados pelo Antigravity.
- [x] **2. Validar o Roteador Sob Demanda (`common-secdevops-router.md`):** testar pedir uma skill do catálogo de 67 (ex.: `kubernetes-patterns`) e um modo de contexto (`secops.md`) para ver o modelo lendo automaticamente com `read_file`.
- [x] **3. Validar CLI de Diagnóstico e Memória:** rodar `doctor.js --target antigravity` (`Status: OK`) e testar um registro no `E:\antigravity-kit\memory-vault`.
- [x] **4. Revisão final pré-GitHub:** conferir `git status`, incluir `.agents/`, `token-monitor/` e `context/` (Obsidian Graph), criar o primeiro commit limpo na branch `main` e subir para `https://github.com/rogeriovigilato/secdevops-antigravity.git`.

## Backlog Futuro
- [x] **Token Monitor (`E:\antigravity-kit\token-monitor`):** versão oficial concluída e verificada com TDD (84.58% cobertura, 14/14 testes passando) + auditoria `code-reviewer` (`APPROVE`). Inclui 4 anéis orbitais (11+15 pré-carregados e 19+67 sob demanda), suporte a múltiplas skills simultâneas, filtro de idioma (`PT-BR` / `EN`), filtro para mostrar/ocultar Sob Demanda (`4 Anéis` vs `2 Anéis`), seletor de sessões com títulos legíveis (`Chat Principal` / `Subagente`), gráfico deslizante de consumo por passo e modo Popup de Canto (`Document Picture-in-Picture`).
