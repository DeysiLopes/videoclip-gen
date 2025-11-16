# 🧪 MCP Chrome DevTools Tests

Testes automatizados usando GitHub Copilot CLI com MCP chrome-devtools integrado.

## 📁 Estrutura

```
mcp-automation/
├── 1-critical/          # 12 testes críticos (P0)
├── 2-important/         # Testes importantes (P1)
├── 3-medium/            # Testes médios (P2)
├── results/             # Resultados com timestamp
├── execute-test.sh      # Executor de teste individual
└── README.md
```

## 🚀 Como Usar

### Executar Teste Específico

```bash
./execute-test.sh 1-critical 02-critical-contrast.json
```

### Listar Testes Disponíveis

```bash
./execute-test.sh 1-critical
```

## 📋 Formato dos Testes

Cada teste é um arquivo JSON seguindo o padrão MCP chrome-devtools:

```json
{
  "id": "CT-007",
  "title": "Verificar contraste de cores",
  "priority": "critical",
  "steps": [
    {
      "action": "navigate",
      "url": "http://localhost:3000"
    },
    {
      "action": "take_snapshot"
    }
  ]
}
```

## 📊 Resultados

Os resultados são salvos em `results/YYYYMMDD_HHMMSS/`:
- `{test-name}-result.json` - Resultado de cada teste
- `summary.json` - Resumo geral da execução
- Screenshots (quando aplicável)

## 🔧 Pré-requisitos

- GitHub Copilot CLI instalado
- MCP chrome-devtools habilitado no CLI
- jq instalado (`sudo apt install jq`)
