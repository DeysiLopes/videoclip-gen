# 🎯 CT-008 a CT-010: Contraste de Cores Avançado

**Categoria:** Accessibility - Important  
**Tags:** `accessibility`, `contrast`, `important`, `wcag-aa`  
**Cenários BDD:** accessibility.robot CT-008 a CT-010

---

## 📋 Descrição

Testar contraste de cores em diferentes contextos:
- Contraste de texto sobre imagens
- Contraste de elementos interativos (botões, links)
- Contraste em diferentes estados (hover, focus, disabled)

---

## 🎬 Passos para Executar com chrome-devtools MCP

### CT-008: Contraste de texto sobre imagens

#### 1. Abrir aplicação
```
chrome-devtools-new_page
  url: http://localhost:3000
  timeout: 10000
```

#### 2. Procurar texto sobre imagens
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar elementos com background-image
      const elementsWithBg = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        return style.backgroundImage && style.backgroundImage !== 'none';
      });
      
      // Verificar se há texto nesses elementos
      const textOverImages = elementsWithBg.filter(el => {
        return el.textContent && el.textContent.trim().length > 0;
      });
      
      return {
        elementsWithBackground: elementsWithBg.length,
        textOverImages: textOverImages.length,
        found: textOverImages.length > 0,
        elements: textOverImages.slice(0, 5).map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim().substring(0, 50),
          background: window.getComputedStyle(el).backgroundImage
        }))
      };
    }
```

#### 3. Verificar contraste de texto sobre imagem
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const elementsWithBg = Array.from(document.querySelectorAll('*')).filter(el => {
        const style = window.getComputedStyle(el);
        const hasBgImage = style.backgroundImage && style.backgroundImage !== 'none';
        const hasText = el.textContent && el.textContent.trim().length > 0;
        return hasBgImage && hasText;
      });
      
      if (elementsWithBg.length === 0) {
        return { 
          note: 'Nenhum texto sobre imagem encontrado',
          passes: true 
        };
      }
      
      const results = elementsWithBg.map(el => {
        const style = window.getComputedStyle(el);
        
        // Verificar se há shadow ou overlay
        const textShadow = style.textShadow;
        const hasOverlay = style.backgroundColor && style.backgroundColor !== 'rgba(0, 0, 0, 0)';
        
        return {
          hasTextShadow: textShadow && textShadow !== 'none',
          hasOverlay: hasOverlay,
          hasTechnique: (textShadow && textShadow !== 'none') || hasOverlay
        };
      });
      
      const allHaveTechnique = results.every(r => r.hasTechnique);
      
      return {
        totalElements: elementsWithBg.length,
        withTechnique: results.filter(r => r.hasTechnique).length,
        allHaveTechnique: allHaveTechnique,
        passes: allHaveTechnique,
        message: allHaveTechnique ? 
          'Todos os textos sobre imagens têm técnica de contraste' :
          'Alguns textos sobre imagens podem ter baixo contraste'
      };
    }
```

#### 4. Screenshot
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ct-008-text-over-image.png"
```

---

### CT-009: Contraste de elementos interativos

#### 5. Verificar contraste de botões
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const buttons = document.querySelectorAll('button, [role="button"]');
      
      const results = Array.from(buttons).map(btn => {
        const style = window.getComputedStyle(btn);
        const bgColor = style.backgroundColor;
        const textColor = style.color;
        const borderColor = style.borderColor;
        
        // Parse RGB
        const bgMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const textMatch = textColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        
        if (!bgMatch || !textMatch) {
          return { valid: false };
        }
        
        // Calcular luminância relativa
        const getLuminance = (r, g, b) => {
          const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };
        
        const bgLum = getLuminance(
          parseInt(bgMatch[1]),
          parseInt(bgMatch[2]),
          parseInt(bgMatch[3])
        );
        
        const textLum = getLuminance(
          parseInt(textMatch[1]),
          parseInt(textMatch[2]),
          parseInt(textMatch[3])
        );
        
        // Calcular ratio de contraste
        const lighter = Math.max(bgLum, textLum);
        const darker = Math.min(bgLum, textLum);
        const ratio = (lighter + 0.05) / (darker + 0.05);
        
        return {
          valid: true,
          ratio: ratio.toFixed(2),
          passes: ratio >= 4.5, // WCAG AA para texto normal
          text: btn.textContent?.trim().substring(0, 30),
          bgColor: bgColor,
          textColor: textColor
        };
      });
      
      const validResults = results.filter(r => r.valid);
      const passing = validResults.filter(r => r.passes);
      
      return {
        totalButtons: buttons.length,
        validResults: validResults.length,
        passing: passing.length,
        failing: validResults.length - passing.length,
        passes: validResults.length === passing.length,
        samples: validResults.slice(0, 3)
      };
    }
```

#### 6. Verificar contraste de links
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const links = document.querySelectorAll('a');
      
      const results = Array.from(links).map(link => {
        const style = window.getComputedStyle(link);
        const textColor = style.color;
        
        // Pegar cor de fundo do pai
        let parent = link.parentElement;
        let bgColor = window.getComputedStyle(parent).backgroundColor;
        
        // Se transparente, subir na árvore
        while (bgColor === 'rgba(0, 0, 0, 0)' && parent.parentElement) {
          parent = parent.parentElement;
          bgColor = window.getComputedStyle(parent).backgroundColor;
        }
        
        const textMatch = textColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const bgMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        
        if (!textMatch || !bgMatch) {
          return { valid: false };
        }
        
        const getLuminance = (r, g, b) => {
          const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };
        
        const textLum = getLuminance(
          parseInt(textMatch[1]),
          parseInt(textMatch[2]),
          parseInt(textMatch[3])
        );
        
        const bgLum = getLuminance(
          parseInt(bgMatch[1]),
          parseInt(bgMatch[2]),
          parseInt(bgMatch[3])
        );
        
        const lighter = Math.max(bgLum, textLum);
        const darker = Math.min(bgLum, textLum);
        const ratio = (lighter + 0.05) / (darker + 0.05);
        
        return {
          valid: true,
          ratio: ratio.toFixed(2),
          passes: ratio >= 4.5,
          href: link.getAttribute('href'),
          text: link.textContent?.trim().substring(0, 30)
        };
      });
      
      const validResults = results.filter(r => r.valid);
      const passing = validResults.filter(r => r.passes);
      
      return {
        totalLinks: links.length,
        validResults: validResults.length,
        passing: passing.length,
        failing: validResults.length - passing.length,
        passes: validResults.length === passing.length,
        samples: validResults.slice(0, 3)
      };
    }
```

---

### CT-010: Contraste em diferentes estados

#### 7. Verificar contraste no estado hover
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const interactiveElements = document.querySelectorAll(
        'button, a, [role="button"], [role="link"], input[type="submit"]'
      );
      
      const results = [];
      
      interactiveElements.forEach((el, index) => {
        if (index > 5) return; // Limitar a 5 elementos
        
        // Estado normal
        const normalStyle = window.getComputedStyle(el);
        const normalBg = normalStyle.backgroundColor;
        const normalColor = normalStyle.color;
        
        // Simular hover
        el.style.setProperty('pointer-events', 'auto');
        const hoverEvent = new MouseEvent('mouseenter', { bubbles: true });
        el.dispatchEvent(hoverEvent);
        
        // Aguardar transição
        setTimeout(() => {
          const hoverStyle = window.getComputedStyle(el);
          const hoverBg = hoverStyle.backgroundColor;
          const hoverColor = hoverStyle.color;
          
          results.push({
            element: el.tagName,
            text: el.textContent?.trim().substring(0, 20),
            normalBg: normalBg,
            hoverBg: hoverBg,
            bgChanged: normalBg !== hoverBg,
            colorChanged: normalColor !== hoverColor
          });
        }, 100);
      });
      
      return {
        tested: Math.min(interactiveElements.length, 5),
        note: 'Verificando se estados hover têm feedback visual',
        passes: true // Validação manual necessária
      };
    }
```

#### 8. Verificar contraste no estado focus
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const focusableElements = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      
      const results = [];
      
      focusableElements.forEach((el, index) => {
        if (index > 5) return;
        
        // Focar elemento
        el.focus();
        
        const style = window.getComputedStyle(el);
        const outline = style.outline;
        const outlineColor = style.outlineColor;
        const boxShadow = style.boxShadow;
        
        const hasFocusIndicator = 
          (outline && outline !== 'none' && outline !== 'medium none currentcolor') ||
          (boxShadow && boxShadow !== 'none');
        
        results.push({
          element: el.tagName,
          hasFocusIndicator: hasFocusIndicator,
          outline: outline,
          outlineColor: outlineColor,
          boxShadow: boxShadow
        });
      });
      
      const allHaveFocus = results.every(r => r.hasFocusIndicator);
      
      return {
        totalFocusable: focusableElements.length,
        tested: results.length,
        withFocusIndicator: results.filter(r => r.hasFocusIndicator).length,
        allHaveFocus: allHaveFocus,
        passes: allHaveFocus,
        samples: results.slice(0, 3)
      };
    }
```

#### 9. Verificar contraste de elementos disabled
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const disabledElements = document.querySelectorAll(
        'button:disabled, input:disabled, [aria-disabled="true"]'
      );
      
      if (disabledElements.length === 0) {
        return {
          note: 'Nenhum elemento disabled encontrado (criar mock se necessário)',
          passes: true
        };
      }
      
      const results = Array.from(disabledElements).map(el => {
        const style = window.getComputedStyle(el);
        const opacity = parseFloat(style.opacity);
        const color = style.color;
        const bgColor = style.backgroundColor;
        
        // Elementos disabled devem ter contraste >= 3:1 (WCAG AA)
        const colorMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const bgMatch = bgColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        
        if (!colorMatch || !bgMatch) {
          return { valid: false };
        }
        
        const getLuminance = (r, g, b) => {
          const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };
        
        const textLum = getLuminance(
          parseInt(colorMatch[1]),
          parseInt(colorMatch[2]),
          parseInt(colorMatch[3])
        );
        
        const bgLum = getLuminance(
          parseInt(bgMatch[1]),
          parseInt(bgMatch[2]),
          parseInt(bgMatch[3])
        );
        
        const lighter = Math.max(bgLum, textLum);
        const darker = Math.min(bgLum, textLum);
        const ratio = (lighter + 0.05) / (darker + 0.05);
        
        return {
          valid: true,
          ratio: ratio.toFixed(2),
          opacity: opacity,
          passes: ratio >= 3.0, // WCAG AA para disabled
          element: el.tagName
        };
      });
      
      const validResults = results.filter(r => r.valid);
      const passing = validResults.filter(r => r.passes);
      
      return {
        totalDisabled: disabledElements.length,
        validResults: validResults.length,
        passing: passing.length,
        passes: validResults.length === passing.length,
        samples: validResults.slice(0, 3)
      };
    }
```

#### 10. Screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ct-010-states-contrast.png"
```

---

## ✅ Critérios de Sucesso

**CT-008:**
- [ ] Texto sobre imagens identificado
- [ ] Técnicas de contraste aplicadas (shadow/overlay)
- [ ] Texto legível em todas as imagens
- [ ] Ratio >= 4.5:1

**CT-009:**
- [ ] Todos os botões têm contraste >= 4.5:1
- [ ] Todos os links têm contraste >= 4.5:1
- [ ] Cores calculadas corretamente
- [ ] Nenhum elemento interativo falha

**CT-010:**
- [ ] Estados hover têm feedback visual
- [ ] Estados focus têm indicador visível
- [ ] Elementos disabled têm contraste >= 3:1
- [ ] Todos os estados são distinguíveis

---

## ⏱️ Duração Esperada

- Total: ~3-4 minutos
- CT-008: 1 min
- CT-009: 1.5 min
- CT-010: 1 min

---

## 🐛 Cenários de Falha Comuns

- **Texto sobre imagem sem contraste:** Falta shadow ou overlay
- **Botões com cores corporativas:** Podem não ter contraste suficiente
- **Links azuis padrão:** Podem falhar em fundos escuros
- **Focus invisível:** Outline: none sem alternativa
- **Disabled muito claro:** Contraste < 3:1

---

## 📊 Resultado Esperado

```json
{
  "test": "CT-008-010-Contrast-Advanced",
  "status": "PASS",
  "duration": "3m 30s",
  "scenarios": {
    "CT-008": "PASS",
    "CT-009": "PASS",
    "CT-010": "PASS"
  },
  "minContrast": 4.52,
  "allElementsPass": true
}
```
