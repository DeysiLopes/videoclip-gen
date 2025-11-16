# CT-010: Dark mode funciona corretamente

## Descrição
Verifica se o modo escuro da aplicação mantém acessibilidade e contraste adequados.

## Prioridade
Média

## Categoria
Accessibility

## Pré-condições
- Aplicação rodando em http://localhost:3000
- Aplicação com suporte a dark mode

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

### 3. Captura modo claro
**Tool:** chrome-devtools-take_screenshot
**Params:**
```json
{
  "filePath": "tests/mcp-automation/3-medium/screenshots/CT-010-light-mode.png",
  "fullPage": true
}
```

### 4. Ativar dark mode
**Tool:** chrome-devtools-evaluate_script
**Params:**
```json
{
  "function": "() => { document.documentElement.classList.add('dark'); localStorage.setItem('theme', 'dark'); }"
}
```

### 5. Aguardar aplicação do tema
**Tool:** chrome-devtools-evaluate_script
**Params:**
```json
{
  "function": "() => new Promise(resolve => setTimeout(resolve, 500))"
}
```

### 6. Captura dark mode
**Tool:** chrome-devtools-take_screenshot
**Params:**
```json
{
  "filePath": "tests/mcp-automation/3-medium/screenshots/CT-010-dark-mode.png",
  "fullPage": true
}
```

### 7. Verificar contraste no dark mode
**Tool:** chrome-devtools-evaluate_script
**Params:**
```json
{
  "function": "() => { const texts = Array.from(document.querySelectorAll('p, h1, h2, h3, button, a, label')); return texts.map(el => { const style = window.getComputedStyle(el); return { tag: el.tagName, color: style.color, background: style.backgroundColor }; }); }"
}
```

## Resultado Esperado
- Dark mode é aplicado corretamente
- Contraste mantém >= 4.5:1 no modo escuro
- Todos os elementos são legíveis
- Preferência é persistida no localStorage

## Tags
`accessibility` `dark-mode` `theme` `contrast` `medium-priority`
