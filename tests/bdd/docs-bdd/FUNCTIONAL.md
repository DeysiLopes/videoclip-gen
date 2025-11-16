# 🎬 BDD Funcional - Testes de Funcionalidades

## 📋 Visão Geral

Este arquivo contém **49 cenários BDD funcionais** que testam as **funcionalidades principais da aplicação DreamDirector AI**.

**Arquivo:** `tests/bdd/functional.robot`

---

## 🎯 Cenários por Categoria

### 1. **Setup e Configuração Inicial** (7 cenários)
- FT-001: Acessar página inicial
- FT-002: Preencher nome do projeto
- FT-003: Validar campo obrigatório
- FT-004: Habilitar botão próximo
- FT-005: Upload de arquivo de áudio
- FT-006: Validar tipo de arquivo
- FT-007: Prosseguir para storyboard

### 2. **Geração de Cenas com IA** (8 cenários)
- FT-008: Preencher descrição
- FT-009: Validar descrição mínima
- FT-010: Gerar cenas com Gemini AI
- FT-011: Visualizar cena gerada
- FT-012: Editar prompt da cena
- FT-013: Regenerar cena individual
- FT-014: Deletar cena
- FT-015: Aprovação de cena

### 3. **Renderização de Vídeo** (4 cenários)
- FT-016: Renderizar vídeo da cena
- FT-017: Visualizar vídeo gerado
- FT-018: Controles do player
- FT-019: Timing automático de cenas
- FT-020: Download de vídeo

### 4. **Corte Final e Síntese** (6 cenários)
- FT-021: Acessar página de corte final
- FT-022: Reprodução sincronizada
- FT-023: Navegação na timeline
- FT-024: Renderizar vídeo final
- FT-025: Download de vídeo final
- FT-026: Ver amostra rápida

### 5. **Fluxo End-to-End** (4 cenários)
- FT-027: Fluxo completo
- FT-028: Histórico de projetos
- FT-029: Salvar projeto em andamento
- FT-030: Retomar projeto salvo

### 6. **Tratamento de Erros** (4 cenários)
- FT-031: Erro ao conectar com IA
- FT-032: Erro ao renderizar
- FT-033: Arquivo de áudio inválido
- FT-034: Timeout em operação longa

### 7. **Performance e UX** (6 cenários)
- FT-035: Página carrega rápido
- FT-036: Operações não travam UI
- FT-037: Responsivo em mobile
- FT-038: Dark mode funcional
- FT-039: Confirmação antes de deletar
- FT-040: Feedback visual para ações

### 8. **Armazenamento e Cota** (3 cenários)
- FT-041: Monitorar uso
- FT-042: Alerta de limite
- FT-043: Deletar libera espaço

### 9. **Integrações** (3 cenários)
- FT-044: Integração com Gemini API
- FT-045: Integração com FFmpeg
- FT-046: Cache de vídeos

### 10. **Dados e Backup** (3 cenários)
- FT-047: Persistência de dados
- FT-048: Exportar projeto
- FT-049: Importar projeto

**TOTAL: 49 cenários funcionais**

---

## 🚀 Como Rodar

### Rodar Todos os Testes
```bash
robot tests/bdd/functional.robot
```

### Rodar Testes Específicos por Tag
```bash
# Apenas testes críticos
robot --include critical tests/bdd/functional.robot

# Apenas smoke tests
robot --include smoke tests/bdd/functional.robot

# Apenas testes E2E
robot --include e2e tests/bdd/functional.robot

# Apenas testes de setup
robot --include setup tests/bdd/functional.robot

# Apenas testes de AI
robot --include ai tests/bdd/functional.robot

# Apenas testes de rendering
robot --include rendering tests/bdd/functional.robot

# Apenas testes de erro
robot --include error tests/bdd/functional.robot

# Apenas testes de performance
robot --include performance tests/bdd/functional.robot
```

### Rodar Teste Individual
```bash
robot --test "FT-027: Fluxo completo de criação de vídeo" tests/bdd/functional.robot
```

### Gerar Relatório
```bash
robot --outputdir tests/results tests/bdd/functional.robot
open tests/results/report.html
```

---

## 📊 Tags Disponíveis

```
setup           - Testes de configuração inicial
storyboard      - Testes de storyboard e cenas
rendering       - Testes de renderização
finalcut        - Testes de corte final
e2e             - Testes end-to-end completos
error           - Testes de tratamento de erro
performance     - Testes de performance
responsive      - Testes de responsividade
storage         - Testes de armazenamento
integration     - Testes de integração
persistence     - Testes de persistência de dados
export          - Testes de exportação
import          - Testes de importação
workflow        - Testes de fluxo de trabalho
ai              - Testes de integrações com IA
forms           - Testes de formulários
validation      - Testes de validação
download        - Testes de download
preview         - Testes de preview
upload          - Testes de upload
editing         - Testes de edição
destruction     - Testes de deleção
controls        - Testes de controles
timing          - Testes de timing
playback        - Testes de reprodução
timeline        - Testes de timeline
history         - Testes de histórico
resilience      - Testes de resiliência
ux              - Testes de experiência do usuário
smoke           - Smoke tests (teste rápido)
critical        - Testes críticos
important       - Testes importantes
```

---

## 🎯 Exemplos de Uso

### Rodar Apenas Setup
```bash
robot --include setup tests/bdd/functional.robot
```

### Rodar Apenas Testes Críticos e Important
```bash
robot --include critical --include important tests/bdd/functional.robot
```

### Rodar Excluindo Erros
```bash
robot --exclude error tests/bdd/functional.robot
```

### Rodar E2E com Verbose
```bash
robot --include e2e -v HEADLESS:False tests/bdd/functional.robot
```

### Rodar com Headless (Sem UI Visual)
```bash
robot -v HEADLESS:True tests/bdd/functional.robot
```

---

## 📈 Estrutura dos Testes

Cada teste segue o padrão **Given-When-Then**:

```robot
FT-027: Fluxo completo de criação de vídeo
    [Documentation]    Testar fluxo completo da aplicação
    [Tags]    e2e    critical    workflow
    
    Given Abro a aplicação
    When Preencho nome "Meu Vídeo Teste"
    And Faço upload de áudio
    And Clico em "Próximo"
    And Preencho descrição do projeto
    And Gero cenas com IA
    And Aprovo as 5 cenas
    And Gero vídeos para todas
    And Clico em "Corte Final"
    And Clico em "Renderizar"
    Then Vídeo final deve ser criado com sucesso
    And Devo poder fazer download
```

---

## 🔄 Fluxo da Aplicação Testado

```
ETAPA 1: Setup
├─ FT-001: Carregar aplicação
├─ FT-002: Preencher nome
├─ FT-003/004: Validação
├─ FT-005/006: Upload áudio
└─ FT-007: Próximo

ETAPA 2: Storyboard
├─ FT-008/009: Descrição
├─ FT-010: Gerar cenas (Gemini)
├─ FT-011/012/013: Edição
├─ FT-014/015: Aprovação
└─ FT-016/017/018: Renderizar vídeo

ETAPA 3: Corte Final
├─ FT-021: Acessar
├─ FT-022/023: Playback
├─ FT-024/025/026: Renderizar final
└─ Download

COMPLEMENTAR
├─ FT-027: E2E Completo
├─ FT-028-030: Histórico/Persistência
├─ FT-031-034: Erros
├─ FT-035-040: UX/Performance
├─ FT-041-043: Storage
├─ FT-044-046: Integrações
└─ FT-047-049: Dados/Backup
```

---

## ✅ Checklist de Execução

- [ ] Frontend rodando (http://localhost:5173)
- [ ] Backend rodando (http://localhost:3000)
- [ ] Robot Framework instalado
- [ ] SeleniumLibrary instalado
- [ ] Arquivo `functional.robot` existe
- [ ] Diretório `tests/results/` existe
- [ ] Rodou: `robot tests/bdd/functional.robot`
- [ ] Relatório HTML aberto

---

## 🎓 Diferenças: Accessibility vs Functional

| Aspecto | Accessibility (A11y) | Functional |
|---------|-------------------| | 
| **Foco** | Usabilidade para todos | Funcionalidades principais |
| **Cenários** | 50 | 49 |
| **Arquivo** | accessibility.robot | functional.robot |
| **Tags** | keyboard, contrast, aria | setup, storyboard, e2e |
| **Tipo** | WCAG compliance | Feature testing |

---

## 🔄 Próximos Passos

### Depois de Functional:
1. ✅ Accessibility (50 cenários)
2. ✅ Functional (49 cenários)
3. ⏳ Integração com mcp-devtools
4. ⏳ Test as Code automation
5. ⏳ CI/CD pipeline

---

## 📞 Troubleshooting

### Teste falhando por elemento não encontrado
```robot
# Aumentar timeout
robot -v WAIT_TIME:20s tests/bdd/functional.robot
```

### Teste falhando por falta de delay
```robot
# Aumentar delay entre ações
robot -v DELAY:2s tests/bdd/functional.robot
```

### Rodar em headless mode (mais rápido)
```robot
robot -v HEADLESS:True tests/bdd/functional.robot
```

### Ver mais detalhes de falhas
```robot
robot --loglevel DEBUG tests/bdd/functional.robot
```

---

## 📊 Métricas Esperadas

| Métrica | Target |
|---------|--------|
| **Total de Testes** | 49 |
| **Pass Rate** | 95%+ |
| **Tempo Médio** | 30-45 min |
| **Críticos Passando** | 100% |
| **Importante Passando** | 90%+ |

---

## 🎯 Integração com Workflow

Quando integrar com mcp-devtools:

```yaml
- name: Run Functional Tests
  run: robot tests/bdd/functional.robot
  
- name: Upload Results
  run: upload_to_dashboard results.json
  
- name: Pass/Fail Check
  run: |
    if [ $? -eq 0 ]; then
      echo "✅ Testes passaram"
    else
      echo "❌ Testes falharam"
      exit 1
    fi
```

---

**Status:** ✅ 49 Cenários Funcionais Prontos

**Framework:** Robot Framework

**Padrão:** BDD (Given-When-Then)

**Próximo:** mcp-devtools Integration

**Data:** 2025-11-16

