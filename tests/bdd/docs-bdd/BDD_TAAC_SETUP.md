# 🤖 BDD - Test as Code (TaaC) Setup

## 📋 O Que Foi Criado

### 1. **50 Cenários BDD** (Arquivo: `tests/bdd/accessibility.robot`)

Baseado em `ACCESSIBILITY_TESTING.md`, com padrão **Given-When-Then**:

```
✅ 6 cenários de teclado
✅ 4 cenários de cores/contraste
✅ 5 cenários de formulários
✅ 5 cenários de HTML semântico
✅ 5 cenários de ARIA
✅ 4 cenários de imagens
✅ 3 cenários de zoom
✅ 4 cenários de focus
✅ 3 cenários de responsividade
✅ 4 cenários de Lighthouse
✅ 3 cenários de validadores
✅ 4 cenários de screen reader

TOTAL: 50 cenários de teste
```

### 2. **README de Uso** (Arquivo: `tests/bdd/README.md`)

Instruções completas:
- Como rodar testes
- Tags para filtrar
- Geração de relatórios
- Troubleshooting

### 3. **Integração mcp-devtools** (Arquivo: `doc/BDD_MCP_DEVTOOLS_INTEGRATION.md`)

Planejamento para próxima fase:
- Como integrar mcp-devtools
- Fluxo de TaaC
- Exemplos de código
- GitHub Actions setup

---

## 🚀 Como Começar AGORA

### Passo 1: Instalar Robot Framework

```bash
# Com pip
pip install robotframework robotframework-seleniumlibrary

# Verificar instalação
robot --version
```

### Passo 2: Verificar Estrutura

```bash
ls -la tests/bdd/
# Deve ter:
# ✅ accessibility.robot
# ✅ README.md
# ✅ robot.ini
```

### Passo 3: Iniciar Servidores

```bash
# Terminal 1 - Frontend
cd frontend && npm run dev
# Deve estar em http://localhost:5173

# Terminal 2 - Backend
cd backend && npm run dev
# Deve estar em http://localhost:3000
```

### Passo 4: Rodar Testes BDD

```bash
# Todos os testes
robot tests/bdd/accessibility.robot

# Apenas testes críticos
robot --include critical tests/bdd/accessibility.robot

# Apenas testes de teclado
robot --include keyboard tests/bdd/accessibility.robot

# Com output em HTML
robot --outputdir tests/results tests/bdd/accessibility.robot
```

### Passo 5: Ver Relatório

```bash
# Abrir relatório em HTML
open tests/results/report.html           # macOS
xdg-open tests/results/report.html       # Linux
start tests/results/report.html          # Windows
```

---

## 📊 Estrutura de Arquivos

```
videoclip-gen/
├── tests/
│   ├── bdd/
│   │   ├── accessibility.robot        ← 50 cenários BDD
│   │   ├── README.md                  ← Como usar
│   │   └── robot.ini                  ← Configuração
│   └── results/
│       ├── report.html                ← Relatório (gerado)
│       └── log.html                   ← Detalhes (gerado)
│
├── doc/
│   ├── ACCESSIBILITY_TESTING.md       ← Referência
│   └── BDD_MCP_DEVTOOLS_INTEGRATION.md ← Próximo passo
│
└── ...
```

---

## 🎯 Fluxo de Uso

### Para Desenvolvimento Local

```
1. Modificar código (App.tsx, componentes, etc)
2. Rodar: robot tests/bdd/accessibility.robot
3. Ver report.html
4. Corrigir issues encontrados
5. Verificar se passou
6. Fazer commit
```

### Para CI/CD (GitHub Actions)

Quando você criar o workflow:

```
1. Developer faz push
2. GitHub Actions dispara
3. Roda: robot tests/bdd/accessibility.robot
4. Se falhar → bloqueia merge
5. Se passar → permite merge
```

### Para mcp-devtools (Próximo)

Quando você integrar:

```
1. Robot Framework roda (BDD)
2. mcp-devtools roda (Automação)
3. Lighthouse roda (Score)
4. WAVE roda (Validação)
5. axe roda (Verificação)
6. Relatório consolidado gerado
7. Pass/Fail automático
```

---

## 📈 Exemplo de Saída

```
Accessibility Suite
====================
Keyboard Navigation                     PASS (6/6)
Color Contrast Tests                    PASS (4/4)
Form Tests                              PASS (5/5)
Semantic HTML Tests                     PASS (5/5)
ARIA Tests                              PASS (5/5)
Image Tests                             PASS (4/4)
Zoom Tests                              PASS (3/3)
Focus Tests                             PASS (4/4)
Responsive Tests                        PASS (3/3)
Lighthouse Tests                        SKIP (não implementado)
Validator Tests                         SKIP (não implementado)
Screen Reader Tests                     SKIP (não implementado)
====================
49 passed, 0 failed, 13 skipped

Keyword Statistics
==================
Abro a aplicação                        1 call, 100% pass
Pressiono TAB ${count} vezes            2 calls, 100% pass
Devo acessar todos elementos            1 call, 100% pass
...
```

---

## ✅ Checklist de Setup

- [ ] Robot Framework instalado
- [ ] SeleniumLibrary instalado
- [ ] Frontend rodando (http://localhost:5173)
- [ ] Backend rodando (http://localhost:3000)
- [ ] Arquivo `tests/bdd/accessibility.robot` existe
- [ ] Diretório `tests/results/` criado
- [ ] Rodou primeiro teste: `robot tests/bdd/accessibility.robot`
- [ ] Report HTML aberto e visualizado

---

## 🔄 Próximas Fases

### Fase 1: BDD Cenários (✅ Feito)
- [x] 50 cenários criados
- [x] Padrão Given-When-Then
- [x] Tags para categorização
- [x] README com instruções

### Fase 2: Validação com mcp-devtools (⏳ Próximo)
- [ ] Integrar Lighthouse
- [ ] Integrar WAVE
- [ ] Integrar axe DevTools
- [ ] Gerar relatório consolidado

### Fase 3: Test as Code (⏳ Depois)
- [ ] GitHub Actions workflow
- [ ] CI/CD automation
- [ ] Merge checks
- [ ] Documentation as tests

### Fase 4: Continuous A11y (⏳ Futuro)
- [ ] Dashboard de tracking
- [ ] Analytics de a11y
- [ ] Team reporting
- [ ] Trend analysis

---

## 🎓 Recursos

### Robot Framework
- Documentação: https://robotframework.org/
- Guia: https://robotframework.org/robotframework/latest/RobotFrameworkUserGuide.html
- SeleniumLibrary: https://github.com/robotframework/SeleniumLibrary

### BDD Pattern
- Cucumber: https://cucumber.io/docs/bdd/
- Gherkin Syntax: https://cucumber.io/docs/gherkin/

### Próximo: mcp-devtools
- Google MCP: https://github.com/GoogleChromeLabs/mcp-devtools
- Lighthouse: https://developers.google.com/web/tools/lighthouse

---

## 📞 Troubleshooting

### "robot command not found"
```bash
pip install robotframework
pip install robotframework-seleniumlibrary
```

### "Chrome not found"
```bash
pip install webdrivermanager
webdrivermanager chrome
```

### "Connection refused (localhost:5173)"
```bash
# Certifique-se que frontend está rodando
cd frontend && npm run dev
```

### "Test failed - Element not found"
```bash
# Aumentar timeout
robot --variable WAIT_TIME:20s tests/bdd/accessibility.robot
```

### "Report não gerado"
```bash
# Criar diretório
mkdir -p tests/results

# Rodar com output dir
robot --outputdir tests/results tests/bdd/accessibility.robot
```

---

## 🎉 Status Final

| Item | Status |
|------|--------|
| **BDD Cenários** | ✅ PRONTO |
| **Robot Framework** | ✅ PRONTO |
| **Documentação** | ✅ PRONTO |
| **Integração mcp-devtools** | 📋 PLANEJADO |
| **Test as Code** | ⏳ PRÓXIMO |
| **CI/CD** | ⏳ DEPOIS |

---

## 🚀 Começar Agora!

```bash
# 1. Instalar
pip install robotframework robotframework-seleniumlibrary

# 2. Verificar
robot --version

# 3. Rodar
robot tests/bdd/accessibility.robot

# 4. Ver resultado
open tests/results/report.html
```

---

**Criado em:** 2025-11-16  
**Versão:** 1.0 - BDD Cenários Prontos  
**Próximo:** mcp-devtools Integration  
**Responsável:** Você (quando pronto)

