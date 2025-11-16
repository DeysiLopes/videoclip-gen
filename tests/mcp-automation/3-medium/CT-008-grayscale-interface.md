# CT-008: Interface funciona em escala de cinza

## Descrição
Verifica se a interface continua usável quando visualizada em escala de cinza, garantindo que informações não dependem apenas de cores.

## Prioridade
Média

## Categoria
Accessibility

## Pré-condições
- Aplicação rodando em http://localhost:3000
- Chrome DevTools com suporte a emulação de visão

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

### 3. Captura normal
**Tool:** chrome-devtools-take_screenshot
**Params:**
```json
{
  "filePath": "tests/mcp-automation/3-medium/screenshots/CT-008-normal.png",
  "fullPage": true
}
```

### 4. Aplicar filtro grayscale
**Tool:** chrome-devtools-evaluate_script
**Params:**
```json
{
  "function": "() => { document.documentElement.style.filter = 'grayscale(100%)'; }"
}
```

### 5. Captura em grayscale
**Tool:** chrome-devtools-take_screenshot
**Params:**
```json
{
  "filePath": "tests/mcp-automation/3-medium/screenshots/CT-008-grayscale.png",
  "fullPage": true
}
```

### 6. Verificar elementos ainda visíveis
**Tool:** chrome-devtools-take_snapshot
**Params:**
```json
{
  "verbose": true
}
```

## Resultado Esperado
- Interface mantém usabilidade em grayscale
- Botões e controles são distinguíveis
- Estados visuais são perceptíveis sem cor
- Informações críticas não dependem apenas de cor

## Tags
`accessibility` `color` `grayscale` `wcag` `medium-priority`
