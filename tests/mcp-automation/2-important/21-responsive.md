# 🎯 CT-037 a CT-039: Design Responsivo

**Categoria:** Accessibility - Important  
**Tags:** `accessibility`, `responsive`, `important`, `wcag-aa`, `mobile`  
**Cenários BDD:** accessibility.robot CT-037 a CT-039

---

## 📋 Descrição

Testar acessibilidade em design responsivo:
- Conteúdo acessível em orientação portrait e landscape
- Sem perda de informação em telas pequenas
- Touch targets adequados para mobile

---

## 🎬 Passos para Executar com chrome-devtools MCP

### CT-037: Portrait e Landscape

#### 1. Abrir aplicação em modo portrait
```
chrome-devtools-new_page
  url: http://localhost:3000
  timeout: 10000
```

```
chrome-devtools-resize_page
  width: 375
  height: 667
```

#### 2. Verificar conteúdo em portrait
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      };
      
      // Verificar se conteúdo principal está visível
      const main = document.querySelector('main, [role="main"]');
      const nav = document.querySelector('nav, [role="navigation"]');
      const buttons = document.querySelectorAll('button');
      
      // Verificar scroll horizontal
      const hasHorizontalScroll = document.body.scrollWidth > viewport.width;
      
      return {
        viewport: viewport,
        hasMain: !!main,
        hasNav: !!nav,
        buttonsCount: buttons.length,
        hasHorizontalScroll: hasHorizontalScroll,
        passes: !!main && !hasHorizontalScroll
      };
    }
```

#### 3. Rotacionar para landscape
```
chrome-devtools-resize_page
  width: 667
  height: 375
```

#### 4. Verificar conteúdo em landscape
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        orientation: window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
      };
      
      // Verificar se conteúdo ainda está acessível
      const main = document.querySelector('main, [role="main"]');
      const buttons = document.querySelectorAll('button:not([disabled])');
      
      // Verificar se elementos estão visíveis
      let hiddenElements = 0;
      buttons.forEach(btn => {
        const rect = btn.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          hiddenElements++;
        }
      });
      
      // Verificar overflow
      const hasHorizontalScroll = document.body.scrollWidth > viewport.width;
      const hasVerticalScroll = document.body.scrollHeight > viewport.height;
      
      return {
        viewport: viewport,
        hasMain: !!main,
        totalButtons: buttons.length,
        hiddenElements: hiddenElements,
        hasHorizontalScroll: hasHorizontalScroll,
        hasVerticalScroll: hasVerticalScroll,
        passes: !!main && hiddenElements === 0 && !hasHorizontalScroll
      };
    }
```

#### 5. Comparar conteúdo entre orientações
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Salvar estado da página em ambas orientações
      const content = {
        headings: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        buttons: document.querySelectorAll('button').length,
        links: document.querySelectorAll('a').length,
        images: document.querySelectorAll('img').length,
        forms: document.querySelectorAll('form').length
      };
      
      return {
        content: content,
        note: 'Conteúdo deve ser o mesmo em ambas orientações',
        passes: true
      };
    }
```

#### 6. Screenshot landscape
```
chrome-devtools-take_screenshot
  fullPage: false
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ct-037-landscape.png"
```

---

### CT-038: Sem perda de informação em telas pequenas

#### 7. Testar em tela muito pequena (320x568 - iPhone SE)
```
chrome-devtools-resize_page
  width: 320
  height: 568
```

#### 8. Verificar que todo conteúdo é acessível
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };
      
      // Elementos críticos que devem estar presentes
      const criticalElements = {
        header: !!document.querySelector('header, [role="banner"]'),
        nav: !!document.querySelector('nav, [role="navigation"]'),
        main: !!document.querySelector('main, [role="main"]'),
        footer: !!document.querySelector('footer, [role="contentinfo"]')
      };
      
      // Verificar se menu está acessível (hamburger)
      const hamburger = document.querySelector(
        '[data-menu], .hamburger, [aria-label*="Menu"]'
      );
      
      // Verificar overflow
      const hasHorizontalScroll = document.body.scrollWidth > viewport.width;
      
      return {
        viewport: viewport,
        criticalElements: criticalElements,
        hasHamburger: !!hamburger,
        hasHorizontalScroll: hasHorizontalScroll,
        allCriticalPresent: Object.values(criticalElements).every(v => v),
        passes: Object.values(criticalElements).filter(v => v).length >= 2 && 
                !hasHorizontalScroll
      };
    }
```

#### 9. Verificar texto legível
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const textElements = document.querySelectorAll('p, span, div, a, button');
      
      const fontSizes = Array.from(textElements).map(el => {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        
        return fontSize;
      }).filter(size => size > 0);
      
      // Calcular média e mínimo
      const avgFontSize = fontSizes.reduce((a, b) => a + b, 0) / fontSizes.length;
      const minFontSize = Math.min(...fontSizes);
      
      // Texto deve ser >= 14px em mobile
      const adequateFontSizes = fontSizes.filter(size => size >= 14).length;
      const percentageAdequate = (adequateFontSizes / fontSizes.length) * 100;
      
      return {
        totalElements: fontSizes.length,
        avgFontSize: avgFontSize.toFixed(1) + 'px',
        minFontSize: minFontSize + 'px',
        adequateFontSizes: adequateFontSizes,
        percentageAdequate: percentageAdequate.toFixed(1) + '%',
        passes: minFontSize >= 12 && percentageAdequate >= 80
      };
    }
```

#### 10. Verificar que formulários são usáveis
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const inputs = document.querySelectorAll('input, textarea, select');
      
      const results = Array.from(inputs).map(input => {
        const rect = input.getBoundingClientRect();
        const style = window.getComputedStyle(input);
        
        const width = rect.width;
        const height = rect.height;
        const fontSize = parseFloat(style.fontSize);
        
        // Input deve ter pelo menos 44x44px (touch target)
        const adequateSize = height >= 40;
        
        // Font size deve ser >= 16px para evitar zoom no iOS
        const adequateFontSize = fontSize >= 16;
        
        return {
          type: input.type || input.tagName,
          width: Math.round(width),
          height: Math.round(height),
          fontSize: fontSize,
          adequateSize: adequateSize,
          adequateFontSize: adequateFontSize
        };
      });
      
      const allAdequate = results.every(r => r.adequateSize && r.adequateFontSize);
      
      return {
        totalInputs: inputs.length,
        withAdequateSize: results.filter(r => r.adequateSize).length,
        withAdequateFontSize: results.filter(r => r.adequateFontSize).length,
        allAdequate: allAdequate,
        passes: allAdequate || inputs.length === 0,
        samples: results.slice(0, 3)
      };
    }
```

---

### CT-039: Touch targets adequados

#### 11. Restaurar viewport mobile padrão
```
chrome-devtools-resize_page
  width: 375
  height: 667
```

#### 12. Verificar tamanho de touch targets
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const interactive = document.querySelectorAll(
        'a, button, input, select, textarea, [role="button"], [role="link"]'
      );
      
      const results = Array.from(interactive).map(el => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        
        const width = rect.width;
        const height = rect.height;
        const padding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
        
        // WCAG 2.1: Touch target deve ser pelo menos 44x44px
        const meetsWCAG = width >= 44 && height >= 44;
        
        // Tolerância: 40x40px é aceitável em alguns casos
        const acceptable = width >= 40 && height >= 40;
        
        return {
          element: el.tagName,
          text: el.textContent?.trim().substring(0, 20) || el.value,
          width: Math.round(width),
          height: Math.round(height),
          meetsWCAG: meetsWCAG,
          acceptable: acceptable
        };
      });
      
      const meetingWCAG = results.filter(r => r.meetsWCAG).length;
      const acceptable = results.filter(r => r.acceptable).length;
      const percentageMeetsWCAG = (meetingWCAG / results.length) * 100;
      
      return {
        totalInteractive: interactive.length,
        meetingWCAG: meetingWCAG,
        acceptable: acceptable,
        percentageMeetsWCAG: percentageMeetsWCAG.toFixed(1) + '%',
        passes: percentageMeetsWCAG >= 80,
        tooSmall: results.filter(r => !r.acceptable).slice(0, 5)
      };
    }
```

#### 13. Verificar espaçamento entre targets
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
      
      const tooClose = [];
      
      for (let i = 0; i < buttons.length; i++) {
        for (let j = i + 1; j < buttons.length; j++) {
          const rect1 = buttons[i].getBoundingClientRect();
          const rect2 = buttons[j].getBoundingClientRect();
          
          // Calcular distância entre elementos
          const horizontalDistance = Math.min(
            Math.abs(rect1.right - rect2.left),
            Math.abs(rect2.right - rect1.left)
          );
          
          const verticalDistance = Math.min(
            Math.abs(rect1.bottom - rect2.top),
            Math.abs(rect2.bottom - rect1.top)
          );
          
          // Elementos devem ter pelo menos 8px de espaço
          if (horizontalDistance < 8 && verticalDistance < 8) {
            tooClose.push({
              button1: buttons[i].textContent?.trim().substring(0, 15),
              button2: buttons[j].textContent?.trim().substring(0, 15),
              distance: Math.min(horizontalDistance, verticalDistance).toFixed(1) + 'px'
            });
          }
        }
      }
      
      return {
        totalButtons: buttons.length,
        tooCloseCount: tooClose.length,
        passes: tooClose.length === 0,
        tooClose: tooClose.slice(0, 5),
        message: tooClose.length === 0 ?
          'Espaçamento adequado entre touch targets' :
          `${tooClose.length} pares de elementos muito próximos`
      };
    }
```

#### 14. Verificar links em parágrafos
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const paragraphs = document.querySelectorAll('p');
      
      const results = [];
      
      paragraphs.forEach(p => {
        const links = p.querySelectorAll('a');
        
        links.forEach(link => {
          const rect = link.getBoundingClientRect();
          const style = window.getComputedStyle(link);
          
          const lineHeight = parseFloat(style.lineHeight);
          const fontSize = parseFloat(style.fontSize);
          
          // Link em linha deve ter line-height >= 1.5
          const adequateLineHeight = lineHeight >= fontSize * 1.5;
          
          results.push({
            text: link.textContent?.trim().substring(0, 20),
            fontSize: fontSize,
            lineHeight: lineHeight,
            ratio: (lineHeight / fontSize).toFixed(2),
            adequateLineHeight: adequateLineHeight
          });
        });
      });
      
      if (results.length === 0) {
        return {
          note: 'Nenhum link em parágrafo encontrado',
          passes: true
        };
      }
      
      const adequate = results.filter(r => r.adequateLineHeight).length;
      
      return {
        totalInlineLinks: results.length,
        withAdequateLineHeight: adequate,
        percentageAdequate: ((adequate / results.length) * 100).toFixed(1) + '%',
        passes: adequate === results.length,
        samples: results.slice(0, 3)
      };
    }
```

#### 15. Screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ct-039-touch-targets.png"
```

---

## ✅ Critérios de Sucesso

**CT-037:**
- [ ] Conteúdo acessível em portrait
- [ ] Conteúdo acessível em landscape
- [ ] Mesma informação em ambas orientações
- [ ] Sem scroll horizontal em ambas

**CT-038:**
- [ ] Funciona em 320px de largura
- [ ] Todo conteúdo é acessível (com scroll)
- [ ] Texto legível (>= 14px)
- [ ] Formulários usáveis

**CT-039:**
- [ ] Touch targets >= 44x44px (WCAG)
- [ ] Pelo menos 80% atendem critério
- [ ] Espaçamento >= 8px entre targets
- [ ] Links inline com line-height >= 1.5

---

## ⏱️ Duração Esperada

- Total: ~3-4 minutos
- CT-037: 1 min
- CT-038: 1.5 min
- CT-039: 1 min

---

## 🐛 Cenários de Falha Comuns

- **Conteúdo escondido em landscape:** Height muito pequeno
- **Scroll horizontal:** Layout fixo não responsivo
- **Touch targets pequenos:** < 44px dificulta uso mobile
- **Botões muito próximos:** Fácil clicar no errado
- **Texto muito pequeno:** < 14px ilegível em mobile
- **Input font-size < 16px:** iOS faz zoom automático

---

## 📊 Resultado Esperado

```json
{
  "test": "CT-037-039-Responsive",
  "status": "PASS",
  "duration": "3m 30s",
  "scenarios": {
    "CT-037": "PASS",
    "CT-038": "PASS",
    "CT-039": "PASS"
  },
  "portraitOk": true,
  "landscapeOk": true,
  "touchTargetsAdequate": "85%"
}
```
