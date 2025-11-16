# FT-015: Layout responsivo em mobile

## Descrição
Verifica se a interface se adapta corretamente para dispositivos móveis.

## Prioridade
Média

## Categoria
Functional

## Pré-condições
- Aplicação rodando em http://localhost:3000

## Passos do Teste

### 1. Navegar para aplicação (Desktop)
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

### 3. Captura desktop
**Tool:** chrome-devtools-take_screenshot
**Params:**
```json
{
  "filePath": "tests/mcp-automation/3-medium/screenshots/FT-015-desktop.png",
  "fullPage": true
}
```

### 4. Redimensionar para mobile
**Tool:** chrome-devtools-resize_page
**Params:**
```json
{
  "width": 375,
  "height": 667
}
```

### 5. Aguardar adaptação
**Tool:** chrome-devtools-evaluate_script
**Params:**
```json
{
  "function": "() => new Promise(resolve => setTimeout(resolve, 500))"
}
```

### 6. Captura mobile
**Tool:** chrome-devtools-take_screenshot
**Params:**
```json
{
  "filePath": "tests/mcp-automation/3-medium/screenshots/FT-015-mobile.png",
  "fullPage": true
}
```

### 7. Verificar overflow horizontal
**Tool:** chrome-devtools-evaluate_script
**Params:**
```json
{
  "function": "() => { const body = document.body; const html = document.documentElement; const hasHorizontalScroll = Math.max(body.scrollWidth, html.scrollWidth) > window.innerWidth; const elementsOverflowing = Array.from(document.querySelectorAll('*')).filter(el => el.scrollWidth > window.innerWidth).map(el => ({ tag: el.tagName, class: el.className, width: el.scrollWidth })); return { hasHorizontalScroll, overflowCount: elementsOverflowing.length, elements: elementsOverflowing.slice(0, 5) }; }"
}
```

### 8. Testar tablet
**Tool:** chrome-devtools-resize_page
**Params:**
```json
{
  "width": 768,
  "height": 1024
}
```

### 9. Captura tablet
**Tool:** chrome-devtools-take_screenshot
**Params:**
```json
{
  "filePath": "tests/mcp-automation/3-medium/screenshots/FT-015-tablet.png",
  "fullPage": true
}
```

## Resultado Esperado
- Sem scroll horizontal em mobile
- Elementos se adaptam ao viewport
- Texto permanece legível
- Botões acessíveis no touch

## Tags
`functional` `responsive` `mobile` `tablet` `medium-priority`
