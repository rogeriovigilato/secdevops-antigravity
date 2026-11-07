'use strict';

window.AGY_I18N = {
  pt: {
    title: 'Radar Galáctico Antigravity — Mente & Tokens',
    subtitle: 'Telemetria em tempo real: onde o agente procura, o que está pensando e pulso de tokens',
    showOnDemandOn: '🌌 Mostrar Sob Demanda: SIM (4 Anéis)',
    showOnDemandOff: '🎯 Mostrar Sob Demanda: NÃO (Só Carregados)',
    autoWalkOn: '🔴 Tempo Real: ON',
    autoWalkOff: '⏸ Histórico (Ir p/ Ao Vivo)',
    prevStep: '⏮ Anterior',
    nextStep: '⏭ Próximo',
    refreshBtn: '🔄 Atualizar Chats',
    refreshedBtn: '✅ Atualizado!',
    popupBtn: '📌 Popup no Canto (PiP)',
    cardSkill: '⚡ Skill Conectada ao Núcleo',
    cardAgent: '🤖 Subagent Conectado',
    cardTool: '🔧 Ferramenta & Arquivo Alvo',
    cardTokens: '🪙 Pulso de Tokens & Contexto',
    ring1Label: 'Anel 1: 11 Agents (Carregados)',
    ring2Label: 'Anel 2: 15 Skills (Carregadas)',
    ring3Label: 'Anel 3: 19 Agents (Sob Demanda)',
    ring4Label: 'Anel 4: 67 Skills (Sob Demanda)',
    hoverPrompt: '🖱️ Passe o mouse ou clique em qualquer bolinha!',
    thoughtTitle: '🧠 O que o Agente está pensando',
    peaksTitle: '📊 Consumo de Tokens por Passo',
    peaksSubtitle: 'Altura = tokens novos no passo (+In/Out) · Clique numa barra para inspecionar',
    preloadedAgentsTitle: '🤖 Agents Pré-Carregados (.agents/agents)',
    preloadedSkillsTitle: '⚡ Skills Pré-Carregadas (.agents/skills)',
    layerPreloadedSkill: '● Anel 2: Pré-carregada (1/15)',
    layerOnDemandSkill: '★ Anel 4: Sob Demanda (1/67)',
    layerPreloadedAgent: '● Anel 1: Pré-carregado (1/11)',
    layerOnDemandAgent: '★ Anel 3: Sob Demanda (1/19)',
    cacheHit: 'Reuso de Cache',
    contextWin: 'Contexto',
    stepWord: 'Passo',
    stepsWord: 'passos',
    popupTitle: 'AGY Mini-Popup (Canto da Tela)',
    usesWord: 'usos na sessão',
    mainSessionLabel: 'Chat Principal',
    subagentSessionLabel: 'Subagente',
    cachedShort: 'em cache',
    newTokensShort: 'novos',
    totalContextShort: 'Contexto Total'
  },
  en: {
    title: 'Antigravity Galaxy Mind & Token Radar',
    subtitle: 'Real-time telemetry: where the agent searches, what it is thinking, and token pulse',
    showOnDemandOn: '🌌 Show On-Demand: ON (4 Rings)',
    showOnDemandOff: '🎯 Show On-Demand: OFF (Preloaded Only)',
    autoWalkOn: '🔴 Live Follow: ON',
    autoWalkOff: '⏸ History (Go Live)',
    prevStep: '⏮ Prev',
    nextStep: '⏭ Next',
    refreshBtn: '🔄 Refresh Chats',
    refreshedBtn: '✅ Refreshed!',
    popupBtn: '📌 Corner Popup (PiP)',
    cardSkill: '⚡ Core-Connected Skill',
    cardAgent: '🤖 Connected Subagent',
    cardTool: '🔧 Tool & Target Path',
    cardTokens: '🪙 Token Pulse & Context',
    ring1Label: 'Ring 1: 11 Agents (Preloaded)',
    ring2Label: 'Ring 2: 15 Skills (Preloaded)',
    ring3Label: 'Ring 3: 19 Agents (On-Demand)',
    ring4Label: 'Ring 4: 67 Skills (On-Demand)',
    hoverPrompt: '🖱️ Hover or click any orbiting sphere!',
    thoughtTitle: '🧠 What the Agent is Thinking',
    peaksTitle: '📊 Token Usage per Step',
    peaksSubtitle: 'Bar height = new tokens in step (+In/Out) · Click any bar to inspect',
    preloadedAgentsTitle: '🤖 Preloaded Agents (.agents/agents)',
    preloadedSkillsTitle: '⚡ Preloaded Skills (.agents/skills)',
    layerPreloadedSkill: '● Ring 2: Preloaded (1/15)',
    layerOnDemandSkill: '★ Ring 4: On-Demand (1/67)',
    layerPreloadedAgent: '● Ring 1: Preloaded (1/11)',
    layerOnDemandAgent: '★ Ring 3: On-Demand (1/19)',
    cacheHit: 'Cache Hit',
    contextWin: 'Context',
    stepWord: 'Step',
    stepsWord: 'steps',
    popupTitle: 'AGY Mini-Popup (Corner HUD)',
    usesWord: 'uses in session',
    mainSessionLabel: 'Main Chat',
    subagentSessionLabel: 'Subagent',
    cachedShort: 'cached',
    newTokensShort: 'new',
    totalContextShort: 'Total Context'
  }
};

window.AGY_NODE_SUMMARIES_PT = {
  // Ring 1 Preloaded Agents (11)
  'architect': 'Subagente especialista em Arquitetura de Sistemas, escalabilidade, design patterns e decisões técnicas estruturais.',
  'build-error-resolver': 'Subagente focado em diagnosticar e corrigir erros de build, compilação e tipagem com diffs mínimos e seguros.',
  'code-explorer': 'Subagente que mapeia fluxos de execução, camadas de arquitetura e dependências do código antes de novas implementações.',
  'code-reviewer': 'Subagente obrigatório de revisão de código: audita qualidade, imutabilidade, segurança e manutenibilidade após alterações.',
  'database-reviewer': 'Subagente especialista em PostgreSQL/bancos de dados: otimização de queries, índices, migrations, RLS e performance.',
  'network-config-reviewer': 'Subagente revisor de configurações de roteadores, switches e firewalls (VLANs, ACLs, sub-redes e riscos operacionais).',
  'network-troubleshooter': 'Subagente de diagnóstico de redes camada a camada (Modelo OSI): conectividade, DNS, roteamento, VPN e interfaces.',
  'planner': 'Subagente especialista em planejamento técnico passo a passo, análise de riscos e quebra de features complexas em fases.',
  'python-reviewer': 'Subagente revisor especialista em Python (PEP 8, type hints, segurança, concorrência e código Pythonico).',
  'security-reviewer': 'Subagente de auditoria de segurança (AppSec/SecOps): detecta OWASP Top 10, CWEs, SSRF, XSS, injeções e segredos expostos.',
  'tdd-guide': 'Subagente guardião de Test-Driven Development (RED → GREEN → REFACTOR), garantindo cobertura mínima de 80%+.',

  // Ring 2 Preloaded Skills (15)
  'agent-security-hardening': 'Blindagem de segurança para runtimes de agentes de IA que processam entradas externas, ferramentas, arquivos e credenciais.',
  'architecture-decision-records': 'Criação e governança de ADRs (Architecture Decision Records) numerados documentando contexto, trade-offs e decisões.',
  'change-impact': 'Análise de raio de explosão (blast radius) antes e depois de mudanças em código, banco de dados, contratos de API e testes.',
  'continuous-learning-v2': 'Sistema de aprendizado contínuo baseado em instintos de sessão com pontuação de confiança e evolução para skills.',
  'council': 'Conselho de 4 vozes independentes para decisões arquiteturais ambíguas, trade-offs difíceis e chamadas de Go/No-Go.',
  'deployment-patterns': 'Padrões de deploy, pipelines CI/CD, containerização, health checks, estratégias de rollback e prontidão de produção.',
  'docker-patterns': 'Padrões de Docker e Docker Compose: segurança de containers, multi-stage builds, redes isoladas e volumes.',
  'git-workflow': 'Padrões de Git: Conventional Commits, estratégias de branch, histórico limpo, rebase vs. merge e revisão de Pull Requests.',
  'network-config-validation': 'Validação pré-deploy de configurações de roteadores/switches/firewalls (IPs duplicados, sobreposição de sub-redes, comandos de risco).',
  'production-audit': 'Auditoria local de prontidão para produção: identifica pontos únicos de falha, gargalos e riscos antes do lançamento.',
  'security-review': 'Checklist prático de Engenharia de Segurança: validação de inputs, prevenção de SQLi/XSS/CSRF, autenticação e segredos.',
  'security-scan': 'Varredura de segurança em configurações de agentes, servidores MCP, hooks e permissões em busca de vulnerabilidades.',
  'strategic-compact': 'Compactação estratégica de contexto no fechamento de fases lógicas para economizar tokens sem perder memória crítica.',
  'unified-memory': 'Memória compartilhada e handoff durável de sessões entre agentes através do Memory Vault local.',
  'verification-loop': 'Loop de verificação em 6 fases (build, tipos, lint, testes com cobertura, scan de segurança e revisão de diff).',

  // Key On-Demand Skills & Agents (Rings 3 & 4)
  'security-bounty-hunter': 'Caça de vulnerabilidades reais e exploráveis (Bug Bounty / SAST): Path Traversal, SSRF, RCE, SQLi, XSS e Auth Bypass.',
  'osint-investigation': 'Investigação OSINT estruturada de domínios, IPs, certificados, superfícies expostas e inteligência de ameaças.',
  'workspace-surface-audit': 'Auditoria da superfície do repositório, servidores MCP, variáveis de ambiente e integrações ativas.',
  'homelab-vlan-segmentation': 'Planejamento e implementação de segmentação de rede em VLANs (Gerência, Servidores, IoT, Visitantes) e regras de firewall.',
  'homelab-wireguard-vpn': 'Configuração segura de túneis VPN WireGuard com chaves restritas, AllowedIPs, roteamento e hardening de firewall.',
  'homelab-pihole-dns': 'Implementação de DNS Sinkhole (Pi-hole), bloqueio de telemetria/malvertising, DNS local e alta disponibilidade.',
  'homelab-network-setup': 'Arquitetura completa de rede Homelab: endereçamento IP, sub-redes, DHCP, gateway, switching e segurança de borda.',
  'homelab-network-readiness': 'Checklist de prontidão e saúde de infraestrutura de rede Homelab antes de expor serviços ou alterar topologia.',
  'cisco-ios-patterns': 'Padrões seguros de configuração e hardening para equipamentos Cisco IOS (SSHv2, AAA, ACLs, STP PortFast/BPDU Guard).',
  'netmiko-ssh-automation': 'Automação segura de ativos de rede via SSH com Python/Netmiko, backups de configuração e execução idempotente.',
  'network-bgp-diagnostics': 'Diagnóstico de sessões BGP, tabelas de roteamento, prefixos anunciados, flapping e filtros de rota.',
  'network-interface-health': 'Monitoramento de erros físicos/lógicos em interfaces de rede (CRC, drops, duplex mismatch, saturação de link).',
  'kubernetes-patterns': 'Padrões de produção para Kubernetes: Pods seguros, NetworkPolicies, Resource Quotas, liveness/readiness probes e RBAC.'
};

window.getLocalizedNodeDescription = function (name, ringLabel, rawEnDesc, lang) {
  if (lang === 'pt') {
    if (window.AGY_NODE_SUMMARIES_PT[name]) {
      return window.AGY_NODE_SUMMARIES_PT[name];
    }
    if (rawEnDesc && rawEnDesc.trim()) {
      return `Especialista do catálogo (${ringLabel}): ${rawEnDesc.trim()}`;
    }
    return `Módulo especialista [${name}] posicionado em ${ringLabel}, acionado automaticamente pelo roteador quando o tema é detectado.`;
  }
  if (rawEnDesc && rawEnDesc.trim()) {
    return rawEnDesc.trim();
  }
  return `Specialized module [${name}] in ${ringLabel}, automatically triggered when the task domain matches.`;
};
