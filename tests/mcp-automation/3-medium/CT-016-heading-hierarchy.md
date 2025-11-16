# CT-016: Hierarquia de headings está correta

## Descrição
Valida se a hierarquia de headings (h1-h6) segue ordem lógica e não pula níveis.

## Prioridade
Média

## Categoria
Accessibility

## Pré-condições
- Aplicação rodando em http://localhost:3000

## Passos do Teste

### 1. Navegar para aplicação
**Tool:** chrome-devtools-new_page
**Params:**
```json
{
  "url": "http://localhost:3000"
}
```

### 2. Aguardar carregamento
**Tool:** chrome-devtools-wait_for
**Params:**
```json
{
  "text": "DreamDirector AI",
  "timeout": 5000
}
```

### 3. Extrair hierarquia de headings
**Tool:** chrome-devtools-evaluate_script
**Params:**
```json
{
  "function": "() => { const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')); return headings.map((h, idx) => ({ index: idx, tag: h.tagName, level: parseInt(h.tagName[1]), text: h.textContent.trim().substring(0, 50) })); }"
}
```

### 4. Validar hierarquia
**Tool:** chrome-devtools-evaluate_script
**Params:**
```json
{
  "function": "() => { const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')); const levels = headings.map(h => parseInt(h.tagName[1])); const errors = []; if (levels[0] !== 1) errors.push('Primeiro heading deve ser h1'); for (let i = 1; i < levels.length; i++) { if (levels[i] - levels[i-1] > 1) errors.push(`Pulo de nível: h${levels[i-1]} para h${levels[i]}`); } const h1Count = levels.filter(l => l === 1).length; if (h1Count > 1) errors.push(`Múltiplos h1 encontrados: ${h1Count}`); return { valid: errors.length === 0, errors, hierarchy: levels }; }"
}
```

### 5. Captura para documentação
**Tool:** chrome-devtools-take_screenshot
**Params:**
```json
{
  "filePath": "tests/mcp-automation/3-medium/screenshots/CT-016-headings.png",
  "fullPage": true
}
```

## Resultado Esperado
- Página tem exatamente um h1
- Não há pulos de nível (ex: h1 -> h3)
- Hierarquia é lógica e sequencial
- Headings descrevem estrutura da página

## Tags
`accessibility` `semantic-html` `headings` `wcag` `medium-priority`
