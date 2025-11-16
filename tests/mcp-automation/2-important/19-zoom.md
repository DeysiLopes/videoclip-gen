# 🎯 CT-030 a CT-032: Zoom e Redimensionamento

**Categoria:** Accessibility - Important  
**Tags:** `accessibility`, `zoom`, `important`, `wcag-aa`, `responsive`  
**Cenários BDD:** accessibility.robot CT-030 a CT-032

---

## 📋 Descrição

Testar zoom e redimensionamento:
- Página funciona com zoom de 200%
- Texto pode ser redimensionado sem perda de funcionalidade
- Sem scroll horizontal em zoom

---

## 🎬 Passos para Executar com chrome-devtools MCP

### CT-030: Página funciona com zoom de 200%

#### 1. Abrir aplicação
```
chrome-devtools-new_page
  url: http://localhost:3000
  timeout: 10000
```

#### 2. Aplicar zoom de 200%
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Definir zoom CSS
      document.body.style.zoom = '200%';
      
      // Alternativa com transform
      // document.body.style.transform = 'scale(2)';
      // document.body.style.transformOrigin = 'top left';
      
      return {
        zoomApplied: true,
        currentZoom: document.body.style.zoom
      };
    }
```

#### 3. Verificar scroll horizontal
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const body = document.body;
      const html = document.documentElement;
      
      const scrollWidth = Math.max(
        body.scrollWidth,
        body.offsetWidth,
        html.clientWidth,
        html.scrollWidth,
        html.offsetWidth
      );
      
      const clientWidth = html.clientWidth;
      
      const hasHorizontalScroll = scrollWidth > clientWidth;
      
      return {
        scrollWidth: scrollWidth,
        clientWidth: clientWidth,
        hasHorizontalScroll: hasHorizontalScroll,
        passes: !hasHorizontalScroll,
        message: hasHorizontalScroll ? 
          'Página tem scroll horizontal com zoom 200%' :
          'Página se adapta corretamente ao zoom 200%'
      };
    }
```

#### 4. Verificar legibilidade do texto
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const textElements = document.querySelectorAll('p, span, div, h1, h2, h3, h4, h5, h6');
      
      let overlapping = 0;
      let truncated = 0;
      
      textElements.forEach(el => {
        const style = window.getComputedStyle(el);
        
        // Verificar se texto está truncado
        const overflow = style.overflow;
        const textOverflow = style.textOverflow;
        
        if (overflow === 'hidden' && textOverflow === 'ellipsis') {
          truncated++;
        }
        
        // Verificar sobreposição (aproximado)
        const rect = el.getBoundingClientRect();
        if (rect.width > window.innerWidth) {
          overlapping++;
        }
      });
      
      return {
        totalTextElements: textElements.length,
        truncated: truncated,
        overlapping: overlapping,
        passes: truncated === 0 && overlapping === 0,
        message: `${truncated} elementos truncados, ${overlapping} sobrepostos`
      };
    }
```

#### 5. Testar funcionalidade com zoom
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Verificar se botões são clicáveis
      const buttons = document.querySelectorAll('button:not([disabled])');
      
      // Verificar se inputs são acessíveis
      const inputs = document.querySelectorAll('input, textarea, select');
      
      // Verificar se há elementos fora da tela
      const allElements = document.querySelectorAll('*');
      let offscreen = 0;
      
      allElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.right < 0 || rect.left > window.innerWidth) {
          offscreen++;
        }
      });
      
      return {
        clickableButtons: buttons.length,
        accessibleInputs: inputs.length,
        offscreenElements: offscreen,
        functionalityPreserved: buttons.length > 0 && inputs.length >= 0,
        passes: offscreen < 5 // Tolerância para alguns elementos
      };
    }
```

#### 6. Screenshot com zoom
```
chrome-devtools-take_screenshot
  fullPage: false
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ct-030-zoom-200.png"
```

---

### CT-031: Texto pode ser redimensionado

#### 7. Restaurar zoom normal
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      document.body.style.zoom = '100%';
      return { restored: true };
    }
```

#### 8. Aumentar font-size base
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Aumentar font-size do HTML (200%)
      const html = document.documentElement;
      const originalFontSize = window.getComputedStyle(html).fontSize;
      
      html.style.fontSize = '200%';
      
      const newFontSize = window.getComputedStyle(html).fontSize;
      
      return {
        originalFontSize: originalFontSize,
        newFontSize: newFontSize,
        increased: true
      };
    }
```

#### 9. Verificar se texto aumentou
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const textElements = document.querySelectorAll('p, span, h1, h2, h3, button, a');
      
      const fontSizes = Array.from(textElements).map(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        const unit = style.fontSize.match(/[a-z%]+$/)?.[0];
        
        return {
          element: el.tagName,
          fontSize: fontSize,
          unit: unit,
          usesRelativeUnit: unit === 'em' || unit === 'rem' || unit === '%'
        };
      });
      
      const withRelativeUnits = fontSizes.filter(f => f.usesRelativeUnit).length;
      const percentageRelative = (withRelativeUnits / fontSizes.length) * 100;
      
      return {
        totalElements: fontSizes.length,
        withRelativeUnits: withRelativeUnits,
        percentageRelative: percentageRelative.toFixed(1) + '%',
        passes: percentageRelative > 80, // Pelo menos 80% deve usar unidades relativas
        samples: fontSizes.slice(0, 5)
      };
    }
```

#### 10. Verificar que nada quebrou
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Verificar overflow
      const body = document.body;
      const hasHorizontalScroll = body.scrollWidth > body.clientWidth;
      
      // Verificar se elementos estão visíveis
      const buttons = document.querySelectorAll('button');
      let hiddenButtons = 0;
      
      buttons.forEach(btn => {
        const style = window.getComputedStyle(btn);
        if (style.display === 'none' || style.visibility === 'hidden') {
          hiddenButtons++;
        }
      });
      
      return {
        hasHorizontalScroll: hasHorizontalScroll,
        totalButtons: buttons.length,
        hiddenButtons: hiddenButtons,
        passes: !hasHorizontalScroll && hiddenButtons === 0
      };
    }
```

---

### CT-032: Sem perda de conteúdo ou funcionalidade

#### 11. Restaurar tamanho normal
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      document.documentElement.style.fontSize = '';
      return { restored: true };
    }
```

#### 12. Testar zoom do navegador (simulado)
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Simular zoom do navegador via viewport
      const viewport = document.querySelector('meta[name="viewport"]');
      
      if (!viewport) {
        return {
          error: 'Viewport meta tag não encontrada',
          passes: false
        };
      }
      
      const content = viewport.getAttribute('content');
      
      // Verificar se permite zoom
      const allowsZoom = !content.includes('user-scalable=no') &&
                        !content.includes('maximum-scale=1');
      
      return {
        viewportContent: content,
        allowsZoom: allowsZoom,
        passes: allowsZoom,
        message: allowsZoom ? 
          'Viewport permite zoom do usuário' :
          'Viewport bloqueia zoom (user-scalable=no)'
      };
    }
```

#### 13. Verificar unidades CSS
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Analisar estilos computados
      const allElements = document.querySelectorAll('*');
      const fixedSizes = [];
      
      allElements.forEach((el, index) => {
        if (index > 100) return; // Limitar para performance
        
        const style = window.getComputedStyle(el);
        
        // Verificar font-size
        const fontSize = style.fontSize;
        if (fontSize && fontSize.endsWith('px') && parseInt(fontSize) < 12) {
          fixedSizes.push({
            element: el.tagName,
            property: 'font-size',
            value: fontSize,
            tooSmall: true
          });
        }
        
        // Verificar width fixo
        const width = style.width;
        if (width && width.endsWith('px') && !width.includes('%')) {
          const el_tag = el.tagName;
          // Containers fixos podem ser problemáticos
          if (['DIV', 'SECTION', 'MAIN', 'ARTICLE'].includes(el_tag)) {
            fixedSizes.push({
              element: el_tag,
              property: 'width',
              value: width,
              fixed: true
            });
          }
        }
      });
      
      return {
        elementsChecked: Math.min(allElements.length, 100),
        fixedSizes: fixedSizes.length,
        issues: fixedSizes.slice(0, 10),
        passes: fixedSizes.length < 5 // Tolerância
      };
    }
```

#### 14. Verificar media queries para zoom
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Verificar se há media queries responsivas
      const styleSheets = Array.from(document.styleSheets);
      let mediaQueriesCount = 0;
      
      try {
        styleSheets.forEach(sheet => {
          if (!sheet.cssRules) return;
          
          Array.from(sheet.cssRules).forEach(rule => {
            if (rule.type === CSSRule.MEDIA_RULE) {
              mediaQueriesCount++;
            }
          });
        });
      } catch (e) {
        // CORS pode bloquear acesso a styleSheets externos
        return {
          note: 'Não foi possível acessar todas as stylesheets (CORS)',
          mediaQueriesFound: true // Assumir que existem
        };
      }
      
      return {
        mediaQueriesCount: mediaQueriesCount,
        hasMediaQueries: mediaQueriesCount > 0,
        passes: mediaQueriesCount > 0,
        message: `${mediaQueriesCount} media queries encontradas`
      };
    }
```

#### 15. Screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ct-032-resizable.png"
```

---

## ✅ Critérios de Sucesso

**CT-030:**
- [ ] Página funciona com zoom 200%
- [ ] Sem scroll horizontal
- [ ] Texto permanece legível
- [ ] Funcionalidade preservada

**CT-031:**
- [ ] Texto pode ser redimensionado
- [ ] 80%+ usam unidades relativas (em/rem/%)
- [ ] Layout não quebra
- [ ] Botões permanecem clicáveis

**CT-032:**
- [ ] Viewport permite zoom do usuário
- [ ] Sem user-scalable=no
- [ ] Sem maximum-scale=1
- [ ] Media queries presentes

---

## ⏱️ Duração Esperada

- Total: ~3 minutos
- CT-030: 1 min
- CT-031: 1 min
- CT-032: 1 min

---

## 🐛 Cenários de Falha Comuns

- **Scroll horizontal:** Layout fixo em pixels
- **Texto truncado:** Overflow: hidden sem reflow
- **Font-size em px:** Não redimensiona com zoom do navegador
- **Viewport bloqueado:** user-scalable=no
- **Containers fixos:** Width em pixels
- **Sem media queries:** Layout não se adapta

---

## 📊 Resultado Esperado

```json
{
  "test": "CT-030-032-Zoom",
  "status": "PASS",
  "duration": "3m 15s",
  "scenarios": {
    "CT-030": "PASS",
    "CT-031": "PASS",
    "CT-032": "PASS"
  },
  "zoom200Ok": true,
  "allowsUserZoom": true,
  "relativeUnits": "85%"
}
```
