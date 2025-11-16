# 🔗 Integração com mcp-devtools (Próximo Passo)

## Overview

Este documento descreve como integrar os **cenários BDD** com **mcp-devtools da Google** para automatizar testes de acessibilidade.

**Status:** 📋 Planejamento (não implementado ainda)

**Quando:** Após validar BDD cenários com Robot Framework

---

## 🎯 O que é mcp-devtools?

**mcp-devtools** é uma ferramenta da Google que permite:
- Controlar Chrome Headless via API
- Rodar Lighthouse automaticamente
- Integrar com WAVE, axe, etc
- Gerar relatórios consolidados
- CI/CD automatizado

**Link:** https://github.com/GoogleChromeLabs/mcp-devtools

---

## 📊 Fluxo Proposto

```
Robot Framework (BDD)
        ↓
    PASSA? Sim ✅
        ↓
mcp-devtools (Automação)
    ├── Lighthouse
    ├── WAVE
    ├── axe DevTools
    └── CSS Validator
        ↓
Relatório Consolidado
        ↓
    PASSA? Sim ✅
        ↓
    Deploy ✅
```

---

## 📋 Cenários Mapeados para mcp-devtools

| BDD Test | Tool | Função |
|----------|------|--------|
| CT-007 (Contraste) | WAVE | Validar 4.5:1 |
| CT-040 (Lighthouse) | Lighthouse | Score >= 85 |
| CT-041 (Erros críticos) | axe DevTools | Verificar issues |
| CT-042 (Color contrast) | WAVE | Color check |
| CT-043 (Form labels) | Lighthouse | Form audit |
| CT-044 (WAVE errors) | WAVE | Scan full page |
| CT-045 (axe DevTools) | axe | Full scan |

---

## 🔧 Implementação Futura

### Step 1: Instalar mcp-devtools

```bash
npm install --save-dev mcp-devtools
# ou
pip install mcp-devtools
```

### Step 2: Criar arquivo de integração

**`tests/integrations/mcp-devtools.ts`** (pseudocódigo):

```typescript
import { MCPDevTools } from 'mcp-devtools';

export class AccessibilityTester {
  private mcp: MCPDevTools;

  async runFullAudit(): Promise<AuditResult> {
    // 1. Lighthouse
    const lighthouseScore = await this.mcp.lighthouse.run({
      url: 'http://localhost:5173',
      categories: ['accessibility']
    });

    // 2. WAVE
    const waveResult = await this.mcp.wave.scan({
      url: 'http://localhost:5173'
    });

    // 3. axe DevTools
    const axeResult = await this.mcp.axe.scan({
      url: 'http://localhost:5173'
    });

    // 4. Consolidar
    return {
      lighthouse: lighthouseScore,
      wave: waveResult,
      axe: axeResult,
      pass: lighthouseScore >= 85 && 
            waveResult.errors === 0 && 
            axeResult.violations === 0
    };
  }
}
```

### Step 3: Integrar com Robot Framework

**`tests/bdd/accessibility_with_tools.robot`** (pseudocódigo):

```robot
*** Settings ***
Library    mcp_devtools_bridge
Library    SeleniumLibrary

*** Test Cases ***
CT-040: Lighthouse Score >= 85
    [Tags]    lighthouse    critical
    Given    Abro a aplicação
    When     Rodo Lighthouse
    Then     Score deve ser >= 85

*** Keywords ***
Rodo Lighthouse
    ${score}=    mcp_devtools.lighthouse    http://localhost:5173
    Set Suite Variable    ${LIGHTHOUSE_SCORE}    ${score}

Score deve ser >= 85
    Should Be True    ${LIGHTHOUSE_SCORE} >= 85
```

### Step 4: CI/CD Integration

**`.github/workflows/accessibility-test-as-code.yml`** (pseudocódigo):

```yaml
name: Accessibility - Test as Code

on: [push, pull_request]

jobs:
  a11y-taac:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      # Step 1: BDD Tests
      - name: Run BDD Tests
        run: robot tests/bdd/accessibility.robot
      
      # Step 2: mcp-devtools
      - name: Run mcp-devtools Audit
        run: npm run test:a11y:tools
      
      # Step 3: Report
      - name: Generate Report
        run: npm run test:a11y:report
      
      # Step 4: Upload
      - uses: actions/upload-artifact@v3
        with:
          name: a11y-reports
          path: tests/results/
      
      # Step 5: Pass/Fail
      - name: Check Results
        run: npm run test:a11y:check
```

---

## 📦 Package.json Scripts (TBD)

```json
{
  "scripts": {
    "test:a11y:bdd": "robot tests/bdd/accessibility.robot",
    "test:a11y:tools": "node tests/integrations/mcp-devtools.js",
    "test:a11y:report": "node tests/integrations/generate-report.js",
    "test:a11y:check": "node tests/integrations/check-results.js",
    "test:a11y": "npm run test:a11y:bdd && npm run test:a11y:tools && npm run test:a11y:report"
  }
}
```

---

## 🎯 Benefícios da Integração

| Benefício | Sem TaaC | Com TaaC |
|----------|----------|----------|
| **Tempo de teste** | ~1 hora manual | ~5 min automático |
| **Cobertura** | 60% | 100% |
| **Erros humanos** | Frequentes | Zero |
| **Documentação** | Manual | Automática |
| **Rastreabilidade** | Fraca | Forte |
| **CI/CD** | Impossível | Automático |

---

## 📊 Exemplo de Relatório Esperado

```
═════════════════════════════════════════════════
  ACCESSIBILITY TEST AS CODE REPORT
═════════════════════════════════════════════════

BDD Cenários (Robot Framework):
  ✅ 50/50 passed
  ⏱️  2 min 30 sec
  📊 100% pass rate

Lighthouse Audit:
  🎯 Score: 92/100
  ✅ Accessibility: PASS
  ✅ Color contrast: PASS
  ✅ Form labels: PASS

WAVE Scan:
  ✅ Errors: 0
  ⚠️  Warnings: 2 (não-críticos)
  ℹ️  Info: 5

axe DevTools:
  ✅ Violations: 0
  ✅ Best practices: PASS

═════════════════════════════════════════════════
  FINAL RESULT: ✅ PASS
═════════════════════════════════════════════════

Timestamp: 2025-11-16 14:30:00
Duration: 2 min 45 sec
Environment: GitHub Actions
Branch: main
Commit: abc123def
```

---

## 🔮 Visão Futura

### Versão 1: BDD Básico (Você fez ✅)
- Robot Framework
- 50 cenários
- Relatório HTML

### Versão 2: Com mcp-devtools (Próximo)
- Lighthouse integrado
- WAVE integrado
- axe DevTools integrado
- Relatório consolidado

### Versão 3: Full TaaC (Depois)
- Test as Code policy
- Automated enforcement
- GitHub checks
- Merge blocking

### Versão 4: Continuous A11y (Futuro)
- Real user monitoring
- Performance correlation
- A11y scoring dashboard
- Team analytics

---

## 📞 Quando Começar?

**Sequência recomendada:**

1. ✅ **BDD Cenários** (feito) 
2. ⏳ **Validar Robot Tests** (próximo - você faz)
3. ⏳ **mcp-devtools Bridge** (depois - você faz)
4. ⏳ **CI/CD Integration** (depois - você faz)
5. ⏳ **TaaC Policy** (futuro - you faz)

---

## 🚀 Começar com mcp-devtools

Quando pronto:

```bash
# 1. Instalar
npm install --save-dev mcp-devtools

# 2. Criar bridge
touch tests/integrations/mcp-devtools.ts

# 3. Configurar
# Adicionar scripts ao package.json

# 4. Testar
npm run test:a11y

# 5. Deploy
# Adicionar ao CI/CD
```

---

## 📚 Referências

- **Robot Framework:** https://robotframework.org/
- **mcp-devtools:** https://github.com/GoogleChromeLabs/mcp-devtools
- **Lighthouse:** https://developers.google.com/web/tools/lighthouse
- **WAVE:** https://wave.webaim.org/
- **axe DevTools:** https://www.deque.com/axe/devtools/
- **Test as Code:** https://en.wikipedia.org/wiki/Behavior-driven_development

---

**Status:** 📋 Planejado (não implementado)

**Quando:** Após validar BDD

**Responsável:** Você (quando pronto)

**Duração estimada:** 4-6 horas

**Impacto:** Alto (automação completa)

**Data de referência:** 2025-11-16

