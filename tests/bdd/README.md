# 🤖 BDD - Behavior Driven Development
**Data:** 2025-11-16

**Próximo:** mcp-devtools integration

**Cenários:** 50 (críticos + importantes)

**Framework:** Robot Framework

**Status:** ✅ BDD Cenários Prontos

---

- Test as Code: https://en.wikipedia.org/wiki/Behavior-driven_development
- BDD Pattern: https://cucumber.io/docs/bdd/
- SeleniumLibrary: https://github.com/robotframework/SeleniumLibrary
- Robot Framework: https://robotframework.org/

## 🎓 Recursos

---

4. **Depois:** Automatizar em CI/CD
3. **Depois:** Criar workflow TaaC
2. **Depois:** Integrar com mcp-devtools
1. **Agora:** Rodar `robot tests/bdd/accessibility.robot`

## 📞 Próximos Passos

---

```
open tests/results/report.html
robot --outputdir tests/results tests/bdd/accessibility.robot
# Gerar manualmente
```bash
### Problema: "Testes passando mas relatório não abre"

```
# Backend: http://localhost:3000
# Frontend: http://localhost:5173
# Certifique-se que rodando:
```bash
### Problema: "Application not running"

```
pip install robotframework-seleniumlibrary
```bash
### Problema: "SeleniumLibrary not found"

```
webdrivermanager chrome
pip install webdrivermanager
# Instalar webdrivermanager
```bash
### Problema: "Chrome driver not found"

## 🚨 Troubleshooting

---

| ⏳ CI/CD | CONTÍNUO | GitHub Actions |
| ⏳ Test as Code | DEPOIS | Após mcp-devtools |
| ⏳ mcp-devtools | PRÓXIMO | Integrar com Google MCP |
| ✅ BDD Cenários | PRONTO | Você está aqui |
|------|--------|---------------|
| Fase | Status | Próximo Passo |

## 📈 Progresso Esperado

---

```
6. Pass/Fail automático
5. Gerar relatório consolidado
4. Escanear com axe DevTools
3. Validar com WAVE
2. Analisar com Lighthouse
1. Executar robot tests
# mcp-devtools irá:
```python

Quando implementar mcp-devtools:

## 🎯 Integração com mcp-devtools (Próximo)

---

- [ ] Criar tickets
- [ ] Documentar issues
- [ ] Testes importantes: 90%+?
- [ ] Testes críticos: 100%?
- [ ] % de testes passados
### Análise de Resultados

- [ ] Re-executar
- [ ] Corrigir issues
- [ ] Analisar falhas
- [ ] Verificar `tests/results/report.html`
- [ ] `robot tests/bdd/accessibility.robot`
### Executar Testes

- [ ] Chrome/ChromeDriver disponível
- [ ] SeleniumLibrary instalado
- [ ] Robot Framework instalado
- [ ] Backend rodando em http://localhost:3000
- [ ] Frontend rodando em http://localhost:5173
### Antes de Executar

## ✅ Checklist de Execução

---

```
Report HTML mostra resultado
     ↓
Valida que Tab funciona
     ↓
Testa navegação por teclado
     ↓
CT-001 (Robot) → App.tsx (Component)
```

Cada cenário mapeia para implementação real:

## 🔗 Mapeamento para Código

---

```
    E o focus deve ser sempre visível      (And)
    Então devo acessar todos elementos     (Then)
    Quando pressiono TAB 20 vezes          (When)
    Dado que abro a aplicação              (Given)
Cenário: Navegar pela aplicação usando apenas TAB
```gherkin

Cada teste segue padrão BDD:

## 📝 Formato BDD (Given-When-Then)

---

```
--include accessibility   # Todos os testes de a11y
--include screenreader    # Testes screen reader
--include eslint          # Testes ESLint
--include axe             # Testes axe
--include wave            # Testes WAVE
--include lighthouse      # Testes Lighthouse
--include responsive      # Testes responsivos
--include focus           # Testes de focus
--include zoom            # Testes de zoom
--include images          # Testes de imagens
--include aria            # Testes ARIA
--include semantic        # Testes HTML semântico
--include forms           # Testes de formulários
--include contrast         # Testes de cores
--include keyboard         # Testes de teclado
--include important        # Testes importantes
--include critical         # Testes críticos
```

## 📊 Tags (para filtrar testes)

---

```
4. Rastreabilidade completa
3. BDD garante documentação
2. Cada test case = user story
1. Testes viram requisitos
```
### Fase 4: Test as Code (TaaC)

```
5. Pass/Fail automático
4. Gera score final
3. Integra com WAVE/axe
2. Integra com Lighthouse
1. mcp-devtools analisa automaticamente
```
### Fase 3: mcp-devtools Integration (Você fará)

```
4. Bloqueia merge se falhar
3. Reporta resultados
2. Rodoo robot tests
1. Push trigger workflow
```
### Fase 2: CI/CD (GitHub Actions)

```
5. Push para GitHub
4. Corrige issues
3. Vê report HTML
2. Roda: robot tests/bdd/accessibility.robot
1. Developer escreve código
```
### Fase 1: Desenvolvimento (Local)

## 🔄 Mapa de Execução (Workflow)

---

```
start tests/results/report.html  # Windows
xdg-open tests/results/report.html  # Linux
open tests/results/report.html  # macOS
# Abrir no navegador

# Detalhes em: tests/results/log.html
# Verificar em: tests/results/report.html
# Robot gera automaticamente
```bash

### 5. Gerar Relatório

```
robot --include forms tests/bdd/accessibility.robot
robot --include contrast tests/bdd/accessibility.robot
robot --include keyboard tests/bdd/accessibility.robot
# Por categoria (tag)

robot --test "CT-001: Navegar pela aplicação usando apenas TAB" tests/bdd/accessibility.robot
# Um cenário específico
```bash

### 4. Rodar Teste Específico

```
robot --exclude lighthouse tests/bdd/accessibility.robot
# Pular testes de lighthouse (ainda não integrado)

robot --include keyboard tests/bdd/accessibility.robot
# Apenas testes de teclado

robot --include critical tests/bdd/accessibility.robot
# Apenas testes críticos

robot --outputdir tests/results tests/bdd/accessibility.robot
# Com saída em HTML

robot tests/bdd/accessibility.robot
# Executar todos os cenários
```bash

### 3. Rodar Todos os Testes

```
└── ...
│       └── (gerado após testes)
│   └── results/
│   │       └── variables.robot     ← Variáveis globais
│   │       ├── keywords.robot      ← Keywords reutilizáveis
│   │   └── resources/
│   │   ├── README.md               ← Este arquivo
│   │   ├── accessibility.robot     ← Cenários
│   ├── bdd/
├── tests/
videoclip-gen/
```

### 2. Estrutura de Diretórios

```
npm install --save-dev robotframework
# Ou com npm (frontend)

pip install robotframework robotframework-seleniumlibrary
# Instalar dependências
```bash

### 1. Instalar Robot Framework

## 🚀 Como Usar

---

**Total: 50 cenários de teste**

- ✅ CT-050: Headings com nível
- ✅ CT-049: Links anunciados
- ✅ CT-048: Botões anunciados
- ✅ CT-047: Ordem de leitura lógica
### Categoria 12: Screen Reader (4 cenários)

- ✅ CT-046: ESLint jsx-a11y sem erros
- ✅ CT-045: axe DevTools sem issues críticas
- ✅ CT-044: WAVE sem erros críticos
### Categoria 11: Validadores (3 cenários)

- ✅ CT-043: Form labels passa
- ✅ CT-042: Color contrast passa
- ✅ CT-041: Sem erros críticos
- ✅ CT-040: Score >= 85
### Categoria 10: Lighthouse (4 cenários)

- ✅ CT-039: Zoom em mobile
- ✅ CT-038: Touch targets >= 48x48px mobile
- ✅ CT-037: Funciona em mobile
### Categoria 9: Responsividade (3 cenários)

- ✅ CT-036: Focus retorna após fechar
- ✅ CT-035: Modal com focus trap
- ✅ CT-034: Focus order lógico
- ✅ CT-033: Focus visível
### Categoria 8: Focus Management (4 cenários)

- ✅ CT-032: Touch targets >= 48x48px
- ✅ CT-031: Zoom 150% sem texto cortado
- ✅ CT-030: Zoom 200% funciona
### Categoria 7: Zoom (3 cenários)

- ✅ CT-029: SVGs com <title> e <desc>
- ✅ CT-028: Imagens decorativas alt=""
- ✅ CT-027: Alt text é descritivo
- ✅ CT-026: Todas as imagens têm alt
### Categoria 6: Imagens e Alt Text (4 cenários)

- ✅ CT-025: Inputs inválidos com aria-invalid
- ✅ CT-024: Elementos decorativos com aria-hidden
- ✅ CT-023: Alerts com role="alert"
- ✅ CT-022: Modals com role="dialog"
- ✅ CT-021: Ícones com aria-label
### Categoria 5: ARIA Attributes (5 cenários)

- ✅ CT-020: Listas com <ul> ou <ol>
- ✅ CT-019: Tags semânticas (nav, main, section)
- ✅ CT-018: Links com tag <a>
- ✅ CT-017: Botões com tag <button>
- ✅ CT-016: Hierarquia de headings
### Categoria 4: HTML Semântico (5 cenários)

- ✅ CT-015: Helper text acessível
- ✅ CT-014: Erros com role="alert"
- ✅ CT-013: aria-required em obrigatórios
- ✅ CT-012: Labels com htmlFor correto
- ✅ CT-011: Labels visíveis
### Categoria 3: Labels e Formulários (5 cenários)

- ✅ CT-010: Dark mode acessível
- ✅ CT-009: Não depender apenas de cor
- ✅ CT-008: Funciona em grayscale
- ✅ CT-007: Contraste >= 4.5:1
### Categoria 2: Contraste e Cores (4 cenários)

- ✅ CT-006: Sem keyboard traps
- ✅ CT-005: Fechar modal com ESCAPE
- ✅ CT-004: Ativar checkbox com SPACE
- ✅ CT-003: Ativar botão com ENTER
- ✅ CT-002: Retornar com Shift+TAB
- ✅ CT-001: Navegar com TAB 20 vezes
### Categoria 1: Navegação por Teclado (6 cenários)

## 🎯 Cenários Implementados

---

**Arquivo:** `tests/bdd/accessibility.robot`

Este diretório contém **50 cenários BDD** baseados em `ACCESSIBILITY_TESTING.md` usando **Robot Framework**.

### 📋 Visão Geral

## Cenários de Acessibilidade com Robot Framework


