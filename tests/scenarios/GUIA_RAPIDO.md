# 🚀 Guia Rápido

## 📂 Onde Estão os Arquivos?

```
tests/scenarios/
├── @critical/          ⛔ Executar PRIMEIRO
├── @important/         ⚠️  Depois de critical
├── @medium/            ℹ️  Depois de important
├── README.md           (Índice completo)
├── INDEX.md            (Índice rápido)
└── GUIA_RAPIDO.md      (este arquivo)
```

---

## 🎯 Como Encontrar um Cenário?

### Por ID (ex: FT-001)
```bash
find . -name "FT-001.md"
# Resultado: ./@critical/FT-001.md
```

### Por Criticidade
```bash
ls @critical/    # Ver todos críticos
ls @important/   # Ver todos importantes
ls @medium/      # Ver todos médios
```

### Por Tipo
```bash
ls @critical/*FT*.md    # Testes funcionais críticos
ls @critical/*CT*.md    # Testes acessibilidade críticos
```

---

## 📖 Ler um Cenário

```bash
cat @critical/FT-001.md
# ou
code @critical/FT-001.md   # VSCode
# ou
open @critical/FT-001.md   # macOS
```

---

## 🏃 Quick Start (5 minutos)

### 1. Ver todos os cenários
```bash
wc -l */*.md
```

### 2. Ver resumo
```bash
head -20 README.md
```

### 3. Ver críticos
```bash
ls -la @critical/
```

---

## 🔍 Entender um Cenário

Cada arquivo `.md` tem esta estrutura:

```markdown
# [ID]: [Título]
│
├─ ## 📌 Informações Gerais
│  └─ Resumo executivo
│
├─ ## 🎯 Objetivo
│  └─ O que o teste faz
│
├─ ## 🔧 Ferramentas Chrome DevTools MCP
│  └─ Quais ferramentas usar
│
├─ ## 📋 Fluxo de Execução
│  └─ Passo a passo detalhado
│
├─ ## ✅ Critérios de Aceitação
│  └─ O que significa PASSAR
│
└─ ## 🔗 Relacionados
   └─ Próximo cenário a executar
```

---

## 📊 Estatísticas em 1 Minuto

```bash
# Total de cenários
find . -name "*.md" -type f | wc -l

# Por criticidade
echo "Critical:" && ls -1 @critical/*.md | wc -l
echo "Important:" && ls -1 @important/*.md | wc -l
echo "Medium:" && ls -1 @medium/*.md | wc -l

# Funcionais vs Acessibilidade
echo "Funcionais:" && find . -name "FT-*.md" | wc -l
echo "Acessibilidade:" && find . -name "CT-*.md" | wc -l
```

---

## 🚀 Executar Testes com Robot Framework

### Todos os CRITICAL
```bash
robot --include @critical tests/
```

### Todos os IMPORTANT
```bash
robot --include @important tests/
```

### Específico
```bash
robot --include FT-001 tests/
```

### Em order (primeiro critical, depois important)
```bash
robot --include @critical tests/scenarios/@critical/
robot --include @important tests/scenarios/@important/
```

---

## 🔧 Estrutura de um Cenário

### Exemplo: FT-001

```markdown
# FT-001: Acessar página inicial

## Informações Gerais
- Cenário: FT-001
- Tipo: Funcional
- Criticidade: ⛔ CRITICAL
- Módulo: Configuração do Projeto

## Objetivo
Garantir que a aplicação inicializa corretamente

## Ferramentas
1. chrome-devtools-navigate_page
2. chrome-devtools-wait_for
3. chrome-devtools-take_snapshot

## Fluxo
1. Navegar para http://localhost:5173
2. Aguardar "DreamDirector AI" aparecer
3. Validar 3 etapas no stepper

## Critérios de Aceitação
- [ ] Página carrega < 5s
- [ ] Título visível
- [ ] 3 etapas presentes
- [ ] Sem erros JS

## Relacionados
Próximo: FT-002
```

---

## 💡 Dicas

### 1. Começar pelos CRITICAL
```bash
# Smoke test rápido (10 min)
robot --include @critical tests/
```

### 2. Acompanhar com a Documentação
- README.md → Overview geral
- INDEX.md → Lista rápida
- Arquivo específico → Detalhes completos

### 3. Buscar por Ferramenta
Todos usam `evaluate_script`, mas:
- Upload: veja `FT-005`, `FT-006`
- Teclado: veja `CT-001`, `CT-002`
- Modais: veja `FT-014`, `CT-005`

### 4. Validar Dependências
Respeitar ordem:
```
FT-001 → FT-002 → FT-003/004 → FT-005 → FT-007 → FT-010 → ...
```

---

## 🎯 Checklist de Implementação

- [ ] Ler README.md
- [ ] Entender criticidade
- [ ] Ler FT-001.md (primeiro cenário)
- [ ] Implementar ferramentas MCP
- [ ] Executar @critical
- [ ] Executar @important
- [ ] Executar @medium
- [ ] Criar relatório

---

## 📞 Suporte Rápido

### Ver estrutura completa
```bash
tree scenarios/
```

### Contar linhas de documentação
```bash
wc -l @*/*.md | tail -1
```

### Listar apenas IDs
```bash
ls -1 @critical/*.md | sed 's/.*\///;s/\.md//'
```

### Grep por palavra-chave
```bash
grep -r "Gemini" @critical/
grep -r "keyboard" @important/
```

---

## 🔗 Arquivos Importantes

| Arquivo | Propósito |
|---------|-----------|
| `README.md` | 📖 Índice completo |
| `INDEX.md` | 📑 Índice rápido |
| `GUIA_RAPIDO.md` | 🚀 Este arquivo |
| `@critical/*.md` | ⛔ Testes bloqueadores |
| `@important/*.md` | ⚠️ Testes prioritários |
| `@medium/*.md` | ℹ️ Testes secundários |

---

## ✨ Próximos Passos

1. **Implementar Keywords Robot Framework**
   ```robot
   *** Keywords ***
   Navegar Para Página Inicial
       chrome-devtools-navigate_page    type=url    url=http://localhost:5173
   ```

2. **Criar Setup.robot**
   ```robot
   *** Settings ***
   Library    ChromeDevToolsMCP
   ```

3. **Executar Testes**
   ```bash
   robot @critical/FT-001.robot
   ```

---

*Criado em: 2025-11-16T21:23:24.347Z*
*Versão: 1.0*
*Status: Pronto para uso ✅*
