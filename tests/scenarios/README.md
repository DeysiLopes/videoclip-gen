# 🎯 Cenários de Teste - Chrome DevTools MCP

## 📋 Índice Geral

Este diretório contém todos os cenários de teste mapeados para automação com **Chrome DevTools MCP**, organizados por **nível de criticidade**.

---

## 🏗️ Estrutura de Diretórios

```
scenarios/
├── @critical/          ⛔ Testes críticos (bloqueadores)
├── @important/         ⚠️  Testes importantes (alta prioridade)
├── @medium/            ℹ️  Testes médios (prioridade normal)
└── README.md           (este arquivo)
```

---

## ⛔ CRITICAL (8 cenários)

Testes que **bloqueiam o fluxo principal**. Devem passar antes de qualquer outro teste.

### Funcionais (FT)

| ID | Título | Módulo | Status |
|-----|--------|--------|--------|
| **FT-001** | Acessar página inicial | Configuração | [📄](/@critical/FT-001.md) |
| **FT-002** | Preencher nome do projeto | Configuração | [📄](/@critical/FT-002.md) |
| **FT-005** | Upload de arquivo de áudio | Configuração | [📄](/@critical/FT-005.md) |
| **FT-007** | Prosseguir para storyboard | Configuração | [📄](/@critical/FT-007.md) |
| **FT-010** | Gerar cenas com Gemini AI | Geração | [📄](/@critical/FT-010.md) |
| **FT-016** | Renderizar vídeo | Renderização | [📄](/@critical/FT-016.md) |

### Acessibilidade (CT)

| ID | Título | Módulo | Status |
|-----|--------|--------|--------|
| **CT-001** | Navegar com TAB | Teclado | [📄](/@critical/CT-001.md) |
| **CT-007** | Contraste >= 4.5:1 | Cores | [📄](/@critical/CT-007.md) |

---

## ⚠️ IMPORTANT (11 cenários)

Testes **importantes** com alta prioridade. Dependem dos testes críticos.

### Funcionais (FT)

| ID | Título | Módulo | Status |
|-----|--------|--------|--------|
| **FT-003** | Desabilitar campo vazio | Configuração | [📄](/@important/FT-003.md) |
| **FT-004** | Habilitar botão preenchido | Configuração | [📄](/@important/FT-004.md) |
| **FT-006** | Validar tipo de áudio | Configuração | [📄](/@important/FT-006.md) |
| **FT-008** | Preencher descrição | Geração | [📄](/@important/FT-008.md) |
| **FT-011** | Visualizar cena | Geração | [📄](/@important/FT-011.md) |
| **FT-012** | Editar prompt | Geração | [📄](/@important/FT-012.md) |
| **FT-018** | Baixar vídeo | Renderização | [📄](/@important/FT-018.md) |

### Acessibilidade (CT)

| ID | Título | Módulo | Status |
|-----|--------|--------|--------|
| **CT-002** | Retornar com Shift+TAB | Teclado | [📄](/@important/CT-002.md) |
| **CT-003** | Ativar botão com ENTER | Teclado | [📄](/@important/CT-003.md) |
| **CT-005** | Fechar modal com ESC | Teclado | [📄](/@important/CT-005.md) |
| **CT-011** | Inputs com labels | Formulários | [📄](/@important/CT-011.md) |

---

## ℹ️ MEDIUM (11 cenários)

Testes **secundários** com prioridade normal. Melhoram cobertura de casos extremos.

### Funcionais (FT)

| ID | Título | Módulo | Status |
|-----|--------|--------|--------|
| **FT-009** | Validar descrição mínima | Geração | [📄](/@medium/FT-009.md) |
| **FT-013** | Regenerar cena | Geração | [📄](/@medium/FT-013.md) |
| **FT-014** | Deletar cena | Geração | [📄](/@medium/FT-014.md) |
| **FT-015** | Reordenar cenas | Geração | [📄](/@medium/FT-015.md) |
| **FT-017** | Monitorar progresso | Renderização | [📄](/@medium/FT-017.md) |
| **FT-019** | Monitorar armazenamento | Armazenamento | [📄](/@medium/FT-019.md) |
| **FT-024** | Salvar dados na sessão | Persistência | [📄](/@medium/FT-024.md) |

### Acessibilidade (CT)

| ID | Título | Módulo | Status |
|-----|--------|--------|--------|
| **CT-004** | Ativar com SPACE | Teclado | [📄](/@medium/CT-004.md) |
| **CT-008** | Grayscale funciona | Cores | [📄](/@medium/CT-008.md) |
| **CT-009** | Não depender de cor | Cores | [📄](/@medium/CT-009.md) |
| **CT-012** | Labels com htmlFor | Formulários | [📄](/@medium/CT-012.md) |

---

## 📊 Estatísticas Gerais

### Por Tipo
- **Testes Funcionais (FT)**: 22 cenários
- **Testes Acessibilidade (CT)**: 8 cenários
- **Total**: 30 cenários

### Por Criticidade
- **CRITICAL**: 8 cenários (26,7%)
- **IMPORTANT**: 11 cenários (36,7%)
- **MEDIUM**: 11 cenários (36,7%)

### Cobertura por Módulo
- **Configuração do Projeto**: 6 testes
- **Geração de Cenas com IA**: 9 testes
- **Renderização e Exportação**: 4 testes
- **Gerenciamento de Armazenamento**: 1 teste
- **Persistência de Dados**: 1 teste
- **Navegação por Teclado**: 6 testes
- **Contraste e Cores**: 5 testes
- **Labels e Formulários**: 3 testes

---

## 🚀 Como Usar

### Executar Testes Críticos (Smoke Test)
```bash
robot --include critical tests/scenarios/@critical/
```

### Executar Todos os Funcionais
```bash
robot --include FT tests/scenarios/
```

### Executar Todos os Acessibilidade
```bash
robot --include CT tests/scenarios/
```

### Executar por Criticidade
```bash
# Critical
robot --include critical tests/scenarios/

# Important
robot --include important tests/scenarios/

# Medium
robot --include medium tests/scenarios/
```

---

## 🔗 Fluxo de Dependências

```
FT-001 (página inicial)
    ↓
FT-002 (preencher nome) → FT-003 (desabilitar)
    ↓                        ↓
FT-004 (habilitar)      Validação
    ↓
FT-005 (upload áudio)
    ↓
FT-006 (validar tipo)
    ↓
FT-007 (próximo)
    ↓
FT-008 (descrição) → FT-009 (validação)
    ↓
FT-010 (gerar cenas com IA)
    ↓
FT-011 (visualizar) → FT-012 (editar) → FT-013 (regenerar)
    ↓
FT-014 (deletar) → FT-015 (reordenar)
    ↓
FT-016 (renderizar)
    ↓
FT-017 (progresso)
    ↓
FT-018 (baixar)
    ↓
FT-024 (persistência)
```

---

## 🔧 Ferramentas Chrome DevTools MCP Utilizadas

### Top 5 Ferramentas
1. **`chrome-devtools-evaluate_script`** (31 usos) - Validações customizadas
2. **`chrome-devtools-click`** (28 usos) - Interações com elementos
3. **`chrome-devtools-take_snapshot`** (27 usos) - Validação visual/a11y
4. **`chrome-devtools-press_key`** (12 usos) - Testes de teclado
5. **`chrome-devtools-fill`** (11 usos) - Preenchimento de formulários

### Todas as Ferramentas
- `chrome-devtools-navigate_page` - Navegação
- `chrome-devtools-wait_for` - Aguardar elementos
- `chrome-devtools-upload_file` - Upload de arquivos
- `chrome-devtools-list_network_requests` - Rastreamento de requisições
- `chrome-devtools-handle_dialog` - Tratamento de modais
- `chrome-devtools-resize_page` - Responsividade
- `chrome-devtools-drag` - Drag and drop
- `chrome-devtools-take_screenshot` - Captura visual
- `chrome-devtools-performance_start_trace` - Profiling de performance
- `chrome-devtools-performance_stop_trace` - Parar profiling

---

## 📝 Estrutura de Arquivo de Cenário

Cada arquivo segue o padrão:

```markdown
# [ID]: [Título]

## 📌 Informações Gerais
- Cenário
- Tipo (Funcional/Acessibilidade)
- Descrição
- Módulo
- Criticidade

## 🎯 Objetivo

## 🔧 Ferramentas Chrome DevTools MCP

## ✅ Critérios de Aceitação

## 🔗 Relacionados
```

---

## ✏️ Contribuindo

Ao criar novo cenário:

1. Identifique a criticidade (critical, important, medium)
2. Crie arquivo `[ID].md` no diretório correspondente
3. Siga o template padrão acima
4. Atualize este README
5. Vincule aos cenários relacionados

---

## 📌 Notas Importantes

- **Ordem de Execução**: Respectar dependências (critical → important → medium)
- **Tags Robot**: Use `@critical`, `@important`, `@medium` para filtrar
- **Sincronização**: Este índice é atualizado automaticamente
- **Versão**: Chrome DevTools MCP v1.0+

---

*Última atualização: 2025-11-16T21:23:24.347Z*
*Total de cenários: 30*
