# 🎯 CT-007: Contraste de Cores >= 4.5:1

**Categoria:** Accessibility - Critical  
**Tags:** `contrast`, `accessibility`, `critical`  
**Cenário BDD:** accessibility.robot CT-007

---

## 📋 Descrição

Verificar que todos os textos têm contraste mínimo de 4.5:1 conforme WCAG AA.

## 🎬 Passos para Executar com chrome-devtools MCP

### 1. Abrir a aplicação
```
chrome-devtools-new_page
  url: http://localhost:3000
```

### 2. Aguardar carregamento completo
```
chrome-devtools-wait_for
  text: "DreamDirector AI"
  timeout: 10000
```

### 3. Calcular contraste de todos os textos
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Função para calcular luminância relativa
      function getLuminance(r, g, b) {
        const [rs, gs, bs] = [r, g, b].map(val => {
          val = val / 255;
          return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
      }
      
      // Função para calcular contrast ratio
      function getContrastRatio(color1, color2) {
        const lum1 = getLuminance(color1.r, color1.g, color1.b);
        const lum2 = getLuminance(color2.r, color2.g, color2.b);
        const lighter = Math.max(lum1, lum2);
        const darker = Math.min(lum1, lum2);
        return (lighter + 0.05) / (darker + 0.05);
      }
      
      // Parsear cor RGB de string
      function parseColor(colorStr) {
        const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return match ? { r: +match[1], g: +match[2], b: +match[3] } : null;
      }
      
      // Analisar todos elementos com texto
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6, a, button, label, li');
      const results = [];
      
      for (const el of textElements) {
        const text = el.textContent.trim();
        if (!text || text.length === 0) continue;
        
        const style = window.getComputedStyle(el);
        const color = parseColor(style.color);
        const bgColor = parseColor(style.backgroundColor);
        
        if (color && bgColor && bgColor.r !== null) {
          const ratio = getContrastRatio(color, bgColor);
          
          results.push({
            text: text.substring(0, 50),
            color: style.color,
            backgroundColor: style.backgroundColor,
            ratio: ratio.toFixed(2),
            passes: ratio >= 4.5,
            element: el.tagName
          });
        }
      }
      
      return {
        total: results.length,
        passing: results.filter(r => r.passes).length,
        failing: results.filter(r => !r.passes).length,
        results: results.slice(0, 10) // Primeiros 10
      };
    }
```

### 4. Tirar screenshot para análise visual
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
```

### 5. Validar dark mode (se existir)
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Ativar dark mode
      document.documentElement.classList.add('dark');
      return { darkModeActivated: true };
    }
```

### 6. Re-calcular contraste em dark mode
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Mesmo código de cálculo acima, mas agora em dark mode
      // ... (repetir lógica)
      return {
        darkMode: true,
        passing: /* resultados */
      };
    }
```

---

## ✅ Critérios de Sucesso

- [ ] 100% dos textos devem ter contraste >= 4.5:1
- [ ] Dark mode deve manter contraste >= 4.5:1
- [ ] Botões e links devem ter contraste adequado
- [ ] Placeholders e hints devem ter >= 3:1

---

## 🐛 Cenários de Falha Comuns

- **Cinza claro em branco:** Ratio < 3:1
- **Dark mode não testado:** Contraste quebra ao trocar tema
- **Texto sobre imagens:** Sem sombra ou overlay
- **Estados hover/focus:** Contraste inadequado

---

## 📊 Resultado Esperado

```json
{
  "test": "CT-007",
  "status": "PASS",
  "totalElements": 45,
  "passing": 45,
  "failing": 0,
  "minRatio": 4.8,
  "avgRatio": 12.3,
  "darkModePass": true
}
```
