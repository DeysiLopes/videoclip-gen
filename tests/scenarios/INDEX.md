# 📑 Índice Rápido de Cenários

## ⛔ CRITICAL (8 cenários)

### Funcionais - Configuração do Projeto

**FT-001: Acessar página inicial** 
- Ferramentas: `navigate_page`, `wait_for`, `take_snapshot`
- 🔗 [Ler](/@critical/FT-001.md)

**FT-002: Preencher nome do projeto**
- Ferramentas: `fill`, `evaluate_script`
- 🔗 [Ler](/@critical/FT-002.md)

**FT-005: Upload de arquivo de áudio**
- Ferramentas: `upload_file`, `wait_for`, `take_snapshot`
- 🔗 [Ler](/@critical/FT-005.md)

**FT-007: Prosseguir para storyboard**
- Ferramentas: `click`, `wait_for`
- 🔗 [Ler](/@critical/FT-007.md)

### Funcionais - Geração de Cenas

**FT-010: Gerar cenas com Gemini AI**
- Ferramentas: `click`, `wait_for`, `list_network_requests`, `evaluate_script`
- 🔗 [Ler](/@critical/FT-010.md)

### Funcionais - Renderização

**FT-016: Renderizar vídeo**
- Ferramentas: `click`, `wait_for`, `performance_start_trace`, `performance_stop_trace`, `list_network_requests`
- 🔗 [Ler](/@critical/FT-016.md)

### Acessibilidade - Teclado

**CT-001: Navegar pela aplicação usando apenas TAB**
- Ferramentas: `press_key`, `take_snapshot`, `evaluate_script`
- 🔗 [Ler](/@critical/CT-001.md)

### Acessibilidade - Cores

**CT-007: Contraste de cores >= 4.5:1 em textos**
- Ferramentas: `evaluate_script`, `take_snapshot`
- 🔗 [Ler](/@critical/CT-007.md)

---

## ⚠️ IMPORTANT (11 cenários)

### Funcionais - Configuração

**FT-003: Desabilitar campo de nome se vazio**
- Ferramentas: `evaluate_script`, `take_snapshot`
- 🔗 [Ler](/@important/FT-003.md)

**FT-004: Habilitar botão próximo quando nome preenchido**
- Ferramentas: `fill`, `evaluate_script`, `take_screenshot`
- 🔗 [Ler](/@important/FT-004.md)

**FT-006: Validar tipo de arquivo de áudio**
- Ferramentas: `evaluate_script`, `take_snapshot`
- 🔗 [Ler](/@important/FT-006.md)

### Funcionais - Geração

**FT-008: Preencher descrição do projeto**
- Ferramentas: `fill`, `evaluate_script`
- 🔗 [Ler](/@important/FT-008.md)

**FT-011: Visualizar cena gerada**
- Ferramentas: `click`, `wait_for`, `take_snapshot`
- 🔗 [Ler](/@important/FT-011.md)

**FT-012: Editar prompt da cena**
- Ferramentas: `click`, `fill`, `evaluate_script`
- 🔗 [Ler](/@important/FT-012.md)

### Funcionais - Renderização

**FT-018: Baixar vídeo renderizado**
- Ferramentas: `list_network_requests`, `click`, `evaluate_script`
- 🔗 [Ler](/@important/FT-018.md)

### Acessibilidade - Teclado

**CT-002: Retornar com Shift+TAB**
- Ferramentas: `press_key`, `evaluate_script`
- 🔗 [Ler](/@important/CT-002.md)

**CT-003: Ativar botão com ENTER**
- Ferramentas: `press_key`, `evaluate_script`
- 🔗 [Ler](/@important/CT-003.md)

**CT-005: Fechar modal com ESCAPE**
- Ferramentas: `click`, `wait_for`, `press_key`
- 🔗 [Ler](/@important/CT-005.md)

### Acessibilidade - Formulários

**CT-011: Todos inputs têm labels visíveis**
- Ferramentas: `take_snapshot`, `evaluate_script`
- 🔗 [Ler](/@important/CT-011.md)

---

## ℹ️ MEDIUM (11 cenários)

### Funcionais - Validações

**FT-009: Validar descrição mínima**
- Ferramentas: `fill`, `wait_for`, `take_snapshot`
- 🔗 [Ler](/@medium/FT-009.md)

### Funcionais - Edição de Cenas

**FT-013: Regenerar cena individual**
- Ferramentas: `click`, `wait_for`, `list_network_requests`, `evaluate_script`
- 🔗 [Ler](/@medium/FT-013.md)

**FT-014: Deletar cena**
- Ferramentas: `click`, `wait_for`, `handle_dialog`, `evaluate_script`
- 🔗 [Ler](/@medium/FT-014.md)

**FT-015: Reordenar cenas**
- Ferramentas: `drag`, `evaluate_script`, `take_screenshot`
- 🔗 [Ler](/@medium/FT-015.md)

### Funcionais - Monitoramento

**FT-017: Monitorar progresso de renderização**
- Ferramentas: `wait_for`, `evaluate_script`, `performance_start_trace`
- 🔗 [Ler](/@medium/FT-017.md)

**FT-019: Monitorar armazenamento**
- Ferramentas: `take_snapshot`, `evaluate_script`, `wait_for`
- 🔗 [Ler](/@medium/FT-019.md)

### Funcionais - Persistência

**FT-024: Salvar dados na sessão**
- Ferramentas: `evaluate_script`, `take_snapshot`
- 🔗 [Ler](/@medium/FT-024.md)

### Acessibilidade - Teclado

**CT-004: Ativar checkbox com SPACE**
- Ferramentas: `press_key`, `evaluate_script`
- 🔗 [Ler](/@medium/CT-004.md)

### Acessibilidade - Cores

**CT-008: Interface funciona em escala de cinza**
- Ferramentas: `evaluate_script`, `take_screenshot`, `take_snapshot`
- 🔗 [Ler](/@medium/CT-008.md)

**CT-009: Não depender apenas de cor para informações**
- Ferramentas: `take_snapshot`, `evaluate_script`
- 🔗 [Ler](/@medium/CT-009.md)

### Acessibilidade - Formulários

**CT-012: Labels estão corretamente associados com htmlFor**
- Ferramentas: `evaluate_script`, `take_snapshot`
- 🔗 [Ler](/@medium/CT-012.md)

---

## 🔍 Buscar por Ferramenta

### navigate_page (5 usos)
- FT-001

### click (28 usos)
- FT-007, FT-010, FT-011, FT-012, FT-014, FT-018, CT-003, CT-005, FT-013

### fill (11 usos)
- FT-002, FT-004, FT-008, FT-009, FT-012

### wait_for (18 usos)
- FT-001, FT-005, FT-007, FT-010, FT-011, FT-009, FT-013, FT-017, FT-019, CT-005

### evaluate_script (31 usos)
- TODOS cenários

### take_snapshot (27 usos)
- FT-001, FT-002, FT-003, FT-004, FT-005, FT-006, FT-007, FT-008, FT-009, FT-019, CT-001, CT-007, CT-008, CT-009, CT-011, CT-012

### take_screenshot (8 usos)
- FT-004, FT-015, FT-017, CT-008

### upload_file (4 usos)
- FT-005

### press_key (12 usos)
- CT-001, CT-002, CT-003, CT-004, CT-005

### list_network_requests (6 usos)
- FT-010, FT-013, FT-016, FT-018, FT-022

### handle_dialog (3 usos)
- FT-014, FT-021

### drag (1 uso)
- FT-015

### performance_start_trace (3 usos)
- FT-016, FT-017, FT-023

### performance_stop_trace (2 usos)
- FT-016, FT-023

### performance_analyze_insight (1 uso)
- FT-023

### resize_page (3 usos)
- CT-016, CT-017, CT-018

### get_network_request (2 usos)
- FT-022

---

## 🔍 Buscar por Módulo

### Configuração do Projeto (6 testes)
- FT-001, FT-002, FT-003, FT-004, FT-005, FT-006, FT-007

### Geração de Cenas (9 testes)
- FT-008, FT-009, FT-010, FT-011, FT-012, FT-013, FT-014, FT-015

### Renderização e Exportação (4 testes)
- FT-016, FT-017, FT-018

### Gerenciamento de Armazenamento (1 teste)
- FT-019

### Persistência de Dados (1 teste)
- FT-024

### Navegação por Teclado (6 testes)
- CT-001, CT-002, CT-003, CT-004, CT-005, CT-006

### Contraste e Cores (5 testes)
- CT-007, CT-008, CT-009, CT-010

### Labels e Formulários (3 testes)
- CT-011, CT-012, CT-013

---

## 📊 Estatísticas Rápidas

- **Total**: 30 cenários
- **Críticos**: 8 (26,7%)
- **Importantes**: 11 (36,7%)
- **Médios**: 11 (36,7%)
- **Funcionais**: 22 (73,3%)
- **Acessibilidade**: 8 (26,7%)

---

*Última atualização: 2025-11-16T21:23:24.347Z*
