# 🚀 COMECE AQUI

## Bem-vindo à Estrutura de Cenários BDD!

Este diretório contém **30 cenários de teste** mapeados com as ferramentas do **Chrome DevTools MCP**, organizados por criticidade e tipo.

---

## ⏱️ Tempo de Leitura

- **Resumo Executivo**: 5 minutos (leia isto primeiro!)
- **Guia Prático**: 5 minutos
- **Um cenário completo**: 2-3 minutos
- **Todos os cenários**: ~1 hora

---

## 📖 Comece por Uma Destas 3 Opções

### 1️⃣ Rápido (5 min)
```
Ler: GUIA_RAPIDO.md
├─ Como usar
├─ Estrutura
└─ Quick start
```

### 2️⃣ Completo (30 min)
```
Ler: README.md
├─ Visão geral
├─ Fluxo de dependências
├─ Estatísticas
└─ Referências
```

### 3️⃣ Detalhado (1h+)
```
Explorar: Cenários específicos
├─ @critical/ - Começar aqui!
├─ @important/ - Depois
└─ @medium/ - Por fim
```

---

## 🎯 O Que Você Vai Encontrar

```
scenarios/
│
├─ 📚 Documentação (leia primeiro)
│  ├─ 00_COMECE_AQUI.md      ← Você está aqui! 👈
│  ├─ README.md               (índice completo)
│  ├─ INDEX.md                (busca rápida)
│  ├─ GUIA_RAPIDO.md          (instruções)
│  └─ MAPA_VISUAL.txt         (fluxo visual)
│
├─ ⛔ @critical/              (8 testes - COMECE AQUI!)
│  ├─ FT-001.md → Carregar página
│  ├─ FT-002.md → Preencher nome
│  ├─ FT-005.md → Upload áudio
│  ├─ FT-007.md → Ir para storyboard
│  ├─ FT-010.md → Gerar cenas IA
│  ├─ FT-016.md → Renderizar vídeo
│  ├─ CT-001.md → Teclado (TAB)
│  └─ CT-007.md → Cores (Contraste)
│
├─ ⚠️  @important/            (11 testes - DEPOIS)
│  ├─ FT-003.md → Validações
│  ├─ FT-004.md → Habilitação
│  └─ ... (8 mais)
│
└─ ℹ️  @medium/               (11 testes - POR FIM)
   ├─ FT-009.md → Casos extremos
   └─ ... (10 mais)
```

---

## 🏃 Quick Start (3 passos)

### Passo 1: Entender a Estrutura (2 min)
```bash
# Ver quantos cenários tem em cada nível
ls -1 @critical/*.md   | wc -l   # 8
ls -1 @important/*.md  | wc -l   # 11
ls -1 @medium/*.md     | wc -l   # 11
```

### Passo 2: Ler o Primeiro Cenário (3 min)
```bash
# Abrir o cenário mais importante
cat @critical/FT-001.md
```

### Passo 3: Explorar Todos (30 min)
```bash
# Ver todos os critical
ls -la @critical/

# Buscar por palavra-chave
grep -r "Gemini" @critical/
grep -r "keyboard" @important/
```

---

## 🔍 Entender um Cenário

Cada arquivo `.md` tem esta estrutura:

```markdown
# [ID]: [Título]
│
├─ 📌 Informações Gerais
│  └─ Cenário, Tipo, Criticidade, Módulo
│
├─ 🎯 Objetivo
│  └─ O que o teste faz
│
├─ 🔧 Ferramentas Chrome DevTools MCP
│  └─ Quais ferramentas usar
│
├─ 📋 Fluxo de Execução
│  └─ Passo a passo
│
├─ ✅ Critérios de Aceitação
│  └─ O que significa PASSAR
│
└─ 🔗 Relacionados
   └─ Próximo cenário
```

**Exemplo completo**: Abra `@critical/FT-001.md`

---

## 📊 Números Importantes

```
Total de Cenários:    30
├─ Funcionais:        22 (73%)
└─ Acessibilidade:     8 (27%)

Por Criticidade:
├─ Critical:           8 (27%) - Smoke tests
├─ Important:         11 (37%) - Regression
└─ Medium:            11 (37%) - Edge cases

Tempo de Execução:
├─ Critical:         ~10 min
├─ Critical+Important: ~30 min
└─ Todos:            ~50 min
```

---

## 🔧 Ferramentas Utilizadas

```
Chrome DevTools MCP (14 ferramentas)

Mais usadas:
• evaluate_script      (31 usos)
• click               (28 usos)
• take_snapshot       (27 usos)
• wait_for            (18 usos)
• press_key           (12 usos)
```

---

## 🎯 Próximas Ações

### 1. Ler Documentação (15 min)
- [ ] Ler `README.md` (visão geral)
- [ ] Ler `GUIA_RAPIDO.md` (como usar)
- [ ] Ver `MAPA_VISUAL.txt` (fluxo)

### 2. Explorar Cenários (30 min)
- [ ] Abrir `@critical/FT-001.md`
- [ ] Abrir `@critical/FT-002.md`
- [ ] Entender padrão

### 3. Implementar (1-2h)
- [ ] Criar keywords Robot Framework
- [ ] Integrar Chrome DevTools MCP
- [ ] Executar testes

---

## 🚀 Executar Testes (depois de implementado)

```bash
# Smoke test (only critical)
robot --include @critical tests/scenarios/

# Regression (critical + important)
robot --include critical,important tests/scenarios/

# Full suite
robot --include critical,important,medium tests/scenarios/

# Específico
robot --include FT-001 tests/scenarios/
```

---

## 📚 Leia Próximo

### Se tem 5 minutos: 
👉 `GUIA_RAPIDO.md`

### Se tem 30 minutos:
👉 `README.md`

### Se tem tempo para explorar:
👉 `@critical/FT-001.md` (primeiro cenário)

### Se quer ver o fluxo visual:
👉 `MAPA_VISUAL.txt`

### Se quer buscar algo:
👉 `INDEX.md` (índice rápido)

---

## 💡 Dicas

### 1. Começar pelos CRITICAL
Não comece pelo `@medium/`. Os testes **críticos** são bloqueadores.

### 2. Respeitar Dependências
Alguns cenários dependem de outros. Ver fluxo em `README.md`.

### 3. Uma Ferramenta por Vez
Se não entende `evaluate_script`, procure em `INDEX.md`:
```
grep "evaluate_script" INDEX.md
```

### 4. Usar Git
```bash
git log -1 --oneline tests/scenarios/
git diff tests/scenarios/
```

---

## ❓ Perguntas Frequentes

**P: Por onde começo?**
R: Abra `@critical/FT-001.md` e siga o padrão.

**P: O que significa @critical?**
R: Testes bloqueadores. Devem passar SEMPRE.

**P: Como encontro um cenário específico?**
R: Use `find`:
```bash
find . -name "*FT-010*"
```

**P: Quanto tempo leva?**
R: Critical = 10 min, Todos = 50 min (após implementação)

**P: Posso adicionar novos cenários?**
R: Sim! Siga o padrão e coloque na pasta correta (@critical/@important/@medium)

---

## 🆘 Suporte

### Arquivos de Ajuda
- `README.md` - Documentação completa
- `INDEX.md` - Busca por ferramenta
- `GUIA_RAPIDO.md` - How-to rápido
- `MAPA_VISUAL.txt` - Fluxo visual

### Referências Externas
- Chrome DevTools MCP: https://github.com/ChromeDevTools/chrome-devtools-mcp
- Robot Framework: https://robotframework.org/
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/

---

## ✅ Checklist

- [ ] Li este documento (00_COMECE_AQUI.md)
- [ ] Li o GUIA_RAPIDO.md (rápido)
- [ ] Li o README.md (completo)
- [ ] Explorei um cenário crítico (@critical/FT-001.md)
- [ ] Entendi a estrutura de um cenário
- [ ] Conheço os 14 tipos de ferramentas
- [ ] Pronto para implementar!

---

## 🎉 Você Está Pronto!

**Próximo**: Abra `@critical/FT-001.md` e comece!

```
┌─────────────────────────────┐
│  1. Ler FT-001              │
│  2. Entender padrão         │
│  3. Implementar keywords    │
│  4. Rodar testes            │
│  5. 🎉 Sucesso!             │
└─────────────────────────────┘
```

---

*Gerado em: 2025-11-16T21:23:24.347Z*
*Versão: 1.0.0*
*Status: ✅ Pronto para uso*
