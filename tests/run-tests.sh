#!/bin/bash

# Chrome DevTools MCP Test Runner
# Automação de Cenários BDD com Chrome DevTools

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configurações
SCENARIOS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/scenarios"
RESULTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/results"
FRONTEND_URL="http://localhost:3000"
DEBUG_PORT=9222

# ============================================================================
# FUNÇÕES
# ============================================================================

print_header() {
  echo -e "${BLUE}"
  echo "╔════════════════════════════════════════════════════════════════╗"
  echo "║         Chrome DevTools MCP Test Runner                       ║"
  echo "║         Automação de Cenários BDD                             ║"
  echo "╚════════════════════════════════════════════════════════════════╝"
  echo -e "${NC}"
}

print_usage() {
  cat << EOF
${YELLOW}Uso:${NC}
  ./run-tests.sh -l <criticidade> -f <cenario>
  ./run-tests.sh -l <criticidade> --list
  ./run-tests.sh --help

${YELLOW}Flags:${NC}
  -l <criticidade>    Nível do cenário (critical|important|medium)
  -f <cenario>        Nome do arquivo sem extensão (ex: FT-001)
  --list              Listar cenários disponíveis
  --keep-chrome       Manter Chrome rodando em background
  --help              Mostrar esta ajuda

${YELLOW}Criticidades:${NC}
  critical   ⛔ Cenários críticos
  important  ⚠️  Cenários importantes
  medium     ℹ️  Cenários médios

${YELLOW}Exemplos:${NC}
  ./run-tests.sh -l critical -f FT-001
  ./run-tests.sh -l critical -f FT-001 --keep-chrome
  ./run-tests.sh -l important -f FT-002
  ./run-tests.sh -l critical --list
  ./run-tests.sh --help

${YELLOW}Notas:${NC}
  - Por padrão, o Chrome aguarda você pressionar ENTER antes de finalizar
  - Use --keep-chrome para manter Chrome rodando em background
  - Para finalizar Chrome manualmente: pkill chrome

EOF
}

list_scenarios() {
  local level=$1

  if [ -z "$level" ]; then
    echo -e "${YELLOW}Cenários Disponíveis:${NC}\n"

    echo -e "${RED}CRITICAL (⛔):${NC}"
    ls -1 "$SCENARIOS_DIR/@critical/"*.md 2>/dev/null | xargs -n1 basename | sed 's/.md//' || echo "  Nenhum"

    echo ""
    echo -e "${YELLOW}IMPORTANT (⚠️):${NC}"
    ls -1 "$SCENARIOS_DIR/@important/"*.md 2>/dev/null | xargs -n1 basename | sed 's/.md//' || echo "  Nenhum"

    echo ""
    echo -e "${BLUE}MEDIUM (ℹ️):${NC}"
    ls -1 "$SCENARIOS_DIR/@medium/"*.md 2>/dev/null | xargs -n1 basename | sed 's/.md//' || echo "  Nenhum"
  else
    echo -e "${YELLOW}Cenários ${level} (disponíveis):${NC}\n"
    ls -1 "$SCENARIOS_DIR/@${level}/"*.md 2>/dev/null | xargs -n1 basename | sed 's/.md//' || echo "  Nenhum cenário encontrado"
  fi
}

check_dependencies() {
  local all_ok=true

  if ! command -v google-chrome &> /dev/null; then
    echo -e "${RED}❌ Google Chrome não encontrado${NC}"
    echo "   Instale com: sudo apt-get install google-chrome-stable"
    all_ok=false
  else
    echo -e "${GREEN}✅ Google Chrome encontrado${NC}"
  fi

  if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado${NC}"
    echo "   Instale com: sudo apt-get install nodejs"
    all_ok=false
  else
    echo -e "${GREEN}✅ Node.js encontrado: $(node --version)${NC}"
  fi

  if [ "$all_ok" = false ]; then
    exit 1
  fi
}

start_chrome_debug() {
  echo -e "${YELLOW}🔧 Iniciando Chrome em modo debug...${NC}"
  
  # Fechar Chrome anterior se existir
  pkill chrome 2>/dev/null || true
  sleep 1
  
  # Iniciar Chrome com remote debugging
  google-chrome \
    --headless \
    --disable-gpu \
    --disable-dev-shm-usage \
    --remote-debugging-port=$DEBUG_PORT \
    --no-sandbox \
    > /dev/null 2>&1 &
  
  CHROME_PID=$!
  echo -e "${GREEN}✅ Chrome iniciado (PID: $CHROME_PID)${NC}"
  
  # Aguardar Chrome iniciar
  sleep 3
  
  # Verificar se Chrome está respondendo
  if ! nc -z localhost $DEBUG_PORT 2>/dev/null; then
    echo -e "${RED}❌ Chrome não respondendo na porta $DEBUG_PORT${NC}"
    kill $CHROME_PID 2>/dev/null || true
    exit 1
  fi
  
  echo -e "${GREEN}✅ Chrome respondendo em localhost:$DEBUG_PORT${NC}"
}

stop_chrome() {
  echo -e "${YELLOW}🛑 Finalizando Chrome...${NC}"
  pkill chrome 2>/dev/null || true
  sleep 1
  echo -e "${GREEN}✅ Chrome finalizado${NC}"
}

run_scenario_with_mcp() {
  local level=$1
  local scenario=$2
  local keep_chrome=${3:-false}

  # Validar que o cenário foi fornecido
  if [ -z "$scenario" ]; then
    echo -e "${RED}❌ Cenário não especificado${NC}"
    exit 1
  fi

  # Construir path do arquivo
  local scenario_path="$SCENARIOS_DIR/@${level}/${scenario}.md"

  # Verificar se arquivo existe
  if [ ! -f "$scenario_path" ]; then
    echo -e "${RED}❌ Cenário não encontrado: $scenario_path${NC}"
    exit 1
  fi

  # Ler conteúdo do cenário
  local scenario_content=$(cat "$scenario_path")

  # Gerar prompt MCP para executar cenário
  local prompt=$(cat <<'PROMPT_EOF'
Você é um agente conectado ao servidor MCP chamado "chrome-devtools".
Execute o cenário BDD abaixo usando as tools MCP, não apenas descrevendo em texto.

CONTEXTO:
- URL da Aplicação: http://localhost:3000
- Chrome Debug Port: localhost:9222
- Executor: Chrome DevTools Protocol

REGRAS IMPORTANTES:
- Interprete o Markdown como um cenário BDD (Given/When/Then).
- Execute os passos na ORDEM EXATA especificada.
- Cada passo deve virar uma chamada MCP apropriada:
  - "navigate" / "ir para" → use navigate_page(url)
  - "preencher" / "fill" → use fill_form(selector, valor)
  - "clicar" / "click" → use click(selector)
  - "aguardar" / "wait" → use wait_for(selector, timeout)
  - "verificar" / "assert" → use verify(selector, condition)

INSTRUÇÕES DE EXECUÇÃO:
1. Conectar ao Chrome Debug em localhost:9222
2. Abrir aba em http://localhost:3000
3. Executar cada passo do cenário BDD
4. Registrar resultado de cada passo
5. Ao final, gerar relatório

SE UM PASSO FALHAR:
- Explique qual foi o erro
- Indique o selector ou ação que falhou
- Marque o cenário como "failed"

FORMATO DE RETORNO:
Retorne um objeto JSON com:
{
  "scenario": "PROMPT_SCENARIO_NAME",
  "url_base": "http://localhost:3000",
  "status": "passed" ou "failed",
  "duration_ms": número,
  "steps_executed": número,
  "steps_passed": número,
  "steps_failed": número,
  "final_url": "url_final",
  "errors": ["erro1", "erro2"],
  "screenshots": ["caminho1", "caminho2"],
  "details": "resumo detalhado"
}

CENÁRIO BDD A EXECUTAR:
PROMPT_CONTENT


Agora EXECUTE esse cenário com chrome-devtools.
PROMPT_EOF
  )

  # Substituir placeholders
  prompt="${prompt//PROMPT_SCENARIO_NAME/$scenario}"
  prompt="${prompt//PROMPT_CONTENT/$scenario_content}"

  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${CYAN}📋 Cenário: ${YELLOW}$scenario${CYAN} (${YELLOW}$level${CYAN})${NC}"
  echo -e "${CYAN}═══════════════════════════════════════════════════════════════${NC}\n"

  # Exibir prompt MCP
  echo -e "${BLUE}🤖 Prompt MCP Gerado:${NC}\n"
  echo "$prompt"

  echo -e "\n${CYAN}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${YELLOW}⏳ Chrome está ativo e aguardando execução no chrome-devtools...${NC}\n"

  echo -e "${GREEN}╔═══════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${GREEN}║  Chrome Debug está ATIVO em localhost:${DEBUG_PORT}                 ║${NC}"
  echo -e "${GREEN}║  Aplicação disponível em ${FRONTEND_URL}             ║${NC}"
  echo -e "${GREEN}║                                                               ║${NC}"
  echo -e "${GREEN}║  Use o prompt MCP acima com chrome-devtools                   ║${NC}"

  if [ "$keep_chrome" = true ]; then
    echo -e "${GREEN}║  Chrome continuará rodando após este script                  ║${NC}"
  else
    echo -e "${GREEN}║  Quando terminar, pressione ENTER para finalizar o Chrome    ║${NC}"
  fi

  echo -e "${GREEN}╚═════════���═════════════════════════════════════════════════════╝${NC}\n"

  # Aguardar input do usuário antes de finalizar (apenas se não for --keep-chrome)
  if [ "$keep_chrome" = false ]; then
    read -p "Pressione ENTER para finalizar o Chrome e sair... " -r
    echo ""
    echo -e "${YELLOW}Finalizando...${NC}"
  fi
}

# ============================================================================
# MAIN
# ============================================================================

print_header

# Variáveis para armazenar flags
LEVEL=""
FILE=""
LIST_FLAG=false
KEEP_CHROME=false

# Parse das flags
while getopts "l:f:-:" opt; do
  case "$opt" in
    l) LEVEL="$OPTARG" ;;
    f) FILE="$OPTARG" ;;
    -)
      case "${OPTARG}" in
        list) LIST_FLAG=true ;;
        keep-chrome) KEEP_CHROME=true ;;
        help) print_usage; exit 0 ;;
        *)
          echo -e "${RED}❌ Flag desconhecida: --${OPTARG}${NC}"
          print_usage
          exit 1
          ;;
      esac
      ;;
    *)
      echo -e "${RED}❌ Opção inválida: -${OPTARG}${NC}"
      print_usage
      exit 1
      ;;
  esac
done

# Validações
if [ $# -eq 0 ]; then
  print_usage
  exit 1
fi

if [ -z "$LEVEL" ]; then
  echo -e "${RED}❌ Especifique o nível: -l critical|important|medium${NC}"
  print_usage
  exit 1
fi

# Validar nível
case "$LEVEL" in
  critical|important|medium) ;;
  *)
    echo -e "${RED}❌ Nível inválido: $LEVEL${NC}"
    echo "Use: critical, important ou medium"
    exit 1
    ;;
esac

# Se --list foi usado
if [ "$LIST_FLAG" = true ]; then
  list_scenarios "$LEVEL"
  exit 0
fi

# Se -f não foi fornecido
if [ -z "$FILE" ]; then
  echo -e "${RED}❌ Especifique o cenário: -f <nome>${NC}"
  echo -e "\n${YELLOW}Cenários disponíveis para $LEVEL:${NC}"
  list_scenarios "$LEVEL"
  exit 1
fi

# Validar arquivo
if [ ! -f "$SCENARIOS_DIR/@${LEVEL}/${FILE}.md" ]; then
  echo -e "${RED}❌ Cenário não encontrado: @${LEVEL}/${FILE}.md${NC}"
  exit 1
fi

# Executar cenário
echo -e "\n${GREEN}✅ Iniciando teste...${NC}\n"
check_dependencies
start_chrome_debug

# Se não for para manter Chrome, registrar trap para finalização
if [ "$KEEP_CHROME" = false ]; then
  trap stop_chrome EXIT
fi

run_scenario_with_mcp "$LEVEL" "$FILE" "$KEEP_CHROME"

# Se for para manter Chrome, informar ao usuário
if [ "$KEEP_CHROME" = true ]; then
  echo -e "\n${GREEN}═══════════════════════════════════════════════════════════════${NC}"
  echo -e "${GREEN}✅ Chrome continua rodando em background (PID: $CHROME_PID)${NC}"
  echo -e "${GREEN}✅ Debug Port: localhost:${DEBUG_PORT}${NC}"
  echo -e "${GREEN}✅ Para finalizar: pkill chrome${NC}"
  echo -e "${GREEN}═══════════════════════════════════════════════════════════════${NC}\n"
fi

