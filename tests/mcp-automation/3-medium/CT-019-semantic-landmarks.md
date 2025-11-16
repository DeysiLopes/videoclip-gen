# CT-019: Usa landmarks semânticos

## Descrição
Verifica se a página usa elementos semânticos HTML5 como nav, main, section, article.

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

### 3. Identificar landmarks
**Tool:** chrome-devtools-evaluate_script
**Params:**
```json
{
  "function": "() => { const landmarks = { nav: document.querySelectorAll('nav').length, main: document.querySelectorAll('main').length, header: document.querySelectorAll('header').length, footer: document.querySelectorAll('footer').length, section: document.querySelectorAll('section').length, article: document.querySelectorAll('article').length, aside: document.querySelectorAll('aside').length }; return landmarks; }"
}
```

### 4. Validar estrutura mínima
**Tool:** chrome-devtools-evaluate_script
**Params:**
```json
{
  "function": "() => { const hasMain = document.querySelector('main') !== null; const hasNav = document.querySelector('nav') !== null; const errors = []; if (!hasMain) errors.push('Elemento <main> não encontrado'); if (!hasNav) errors.push('Elemento <nav> não encontrado'); const divsWithRoleMain = document.querySelectorAll('div[role=\"main\"]').length; if (divsWithRoleMain > 0) errors.push('Usando div com role=main ao invés de <main>'); return { valid: errors.length === 0, errors, hasMain, hasNav }; }"
}
```

### 5. Captura estrutura
**Tool:** chrome-devtools-take_screenshot
**Params:**
```json
{
  "filePath": "tests/mcp-automation/3-medium/screenshots/CT-019-landmarks.png",
  "fullPage": true
}
```

## Resultado Esperado
- Página tem elemento `<main>`
- Página tem elemento `<nav>`
- Usa elementos semânticos ao invés de divs genéricas
- Landmarks facilitam navegação por screen readers

## Tags
`accessibility` `semantic-html` `landmarks` `html5` `medium-priority`
