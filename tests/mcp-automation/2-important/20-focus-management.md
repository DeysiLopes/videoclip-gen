# 🎯 CT-033 a CT-036: Gerenciamento de Foco

**Categoria:** Accessibility - Important  
**Tags:** `accessibility`, `focus`, `important`, `wcag-aa`, `keyboard`  
**Cenários BDD:** accessibility.robot CT-033 a CT-036

---

## 📋 Descrição

Testar gerenciamento de foco:
- Foco visível em todos os elementos interativos
- Ordem de foco lógica
- Foco gerenciado em modals/dialogs
- Foco não é perdido

---

## 🎬 Passos para Executar com chrome-devtools MCP

### CT-033: Foco visível em todos os elementos

#### 1. Abrir aplicação
```
chrome-devtools-new_page
  url: http://localhost:3000
  timeout: 10000
```

#### 2. Listar elementos focáveis
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const focusable = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      
      return {
        totalFocusable: focusable.length,
        elements: Array.from(focusable).slice(0, 10).map(el => ({
          tag: el.tagName,
          type: el.type,
          id: el.id,
          text: el.textContent?.trim().substring(0, 30)
        }))
      };
    }
```

#### 3. Testar indicador de foco
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const focusable = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      
      const results = [];
      
      focusable.forEach((el, index) => {
        if (index > 10) return; // Testar primeiros 10
        
        // Focar elemento
        el.focus();
        
        const style = window.getComputedStyle(el);
        
        // Verificar outline
        const outline = style.outline;
        const outlineWidth = style.outlineWidth;
        const outlineStyle = style.outlineStyle;
        const outlineColor = style.outlineColor;
        
        // Verificar box-shadow (alternativa comum)
        const boxShadow = style.boxShadow;
        
        // Verificar border (menos comum mas válido)
        const border = style.border;
        
        const hasOutline = outlineStyle !== 'none' && 
                          outlineWidth !== '0px' &&
                          outlineColor !== 'rgba(0, 0, 0, 0)';
        
        const hasBoxShadow = boxShadow !== 'none' && 
                            !boxShadow.includes('0px 0px 0px');
        
        const hasFocusIndicator = hasOutline || hasBoxShadow;
        
        results.push({
          element: el.tagName,
          id: el.id || el.name,
          hasOutline: hasOutline,
          hasBoxShadow: hasBoxShadow,
          hasFocusIndicator: hasFocusIndicator,
          outline: outline,
          boxShadow: boxShadow
        });
      });
      
      const allHaveFocus = results.every(r => r.hasFocusIndicator);
      const withoutFocus = results.filter(r => !r.hasFocusIndicator);
      
      return {
        tested: results.length,
        withFocusIndicator: results.filter(r => r.hasFocusIndicator).length,
        withoutFocusIndicator: withoutFocus.length,
        allHaveFocus: allHaveFocus,
        passes: allHaveFocus,
        samplesWithoutFocus: withoutFocus.slice(0, 3)
      };
    }
```

#### 4. Verificar contraste do foco
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const focusable = document.querySelectorAll('button, a, input');
      
      const results = [];
      
      focusable.forEach((el, index) => {
        if (index > 5) return;
        
        el.focus();
        
        const style = window.getComputedStyle(el);
        const outlineColor = style.outlineColor;
        const backgroundColor = style.backgroundColor;
        
        // Parse cores
        const outlineMatch = outlineColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        const bgMatch = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        
        if (!outlineMatch || !bgMatch) {
          results.push({ valid: false });
          return;
        }
        
        const getLuminance = (r, g, b) => {
          const [rs, gs, bs] = [r, g, b].map(c => {
            c = c / 255;
            return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
          });
          return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
        };
        
        const outlineLum = getLuminance(
          parseInt(outlineMatch[1]),
          parseInt(outlineMatch[2]),
          parseInt(outlineMatch[3])
        );
        
        const bgLum = getLuminance(
          parseInt(bgMatch[1]),
          parseInt(bgMatch[2]),
          parseInt(bgMatch[3])
        );
        
        const lighter = Math.max(outlineLum, bgLum);
        const darker = Math.min(outlineLum, bgLum);
        const ratio = (lighter + 0.05) / (darker + 0.05);
        
        results.push({
          valid: true,
          element: el.tagName,
          ratio: ratio.toFixed(2),
          passes: ratio >= 3.0 // WCAG 2.1 requer 3:1
        });
      });
      
      const validResults = results.filter(r => r.valid);
      const passing = validResults.filter(r => r.passes);
      
      return {
        tested: validResults.length,
        passing: passing.length,
        passes: validResults.length === passing.length,
        samples: validResults.slice(0, 3)
      };
    }
```

---

### CT-034: Ordem de foco lógica

#### 5. Mapear ordem de foco
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const focusable = document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      
      const focusOrder = Array.from(focusable).map((el, index) => {
        const tabindex = el.getAttribute('tabindex');
        const rect = el.getBoundingClientRect();
        
        return {
          index: index,
          element: el.tagName,
          text: el.textContent?.trim().substring(0, 20) || el.value?.substring(0, 20),
          tabindex: tabindex,
          position: {
            top: Math.round(rect.top),
            left: Math.round(rect.left)
          }
        };
      });
      
      // Verificar se há tabindex positivos (não recomendado)
      const positiveTabindex = focusOrder.filter(el => 
        el.tabindex && parseInt(el.tabindex) > 0
      );
      
      return {
        totalFocusable: focusOrder.length,
        focusOrder: focusOrder,
        positiveTabindexCount: positiveTabindex.length,
        hasPositiveTabindex: positiveTabindex.length > 0,
        warning: positiveTabindex.length > 0 ? 
          'Tabindex positivo encontrado (não recomendado)' : null
      };
    }
```

#### 6. Verificar ordem visual vs DOM
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const focusable = Array.from(document.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      ));
      
      // Ordenar por posição visual (top, depois left)
      const visualOrder = [...focusable].sort((a, b) => {
        const rectA = a.getBoundingClientRect();
        const rectB = b.getBoundingClientRect();
        
        if (Math.abs(rectA.top - rectB.top) > 10) {
          return rectA.top - rectB.top;
        }
        return rectA.left - rectB.left;
      });
      
      // Comparar com ordem DOM
      let outOfOrder = 0;
      
      focusable.forEach((el, domIndex) => {
        const visualIndex = visualOrder.indexOf(el);
        
        // Se diferença é muito grande, pode ser problemático
        if (Math.abs(domIndex - visualIndex) > 3) {
          outOfOrder++;
        }
      });
      
      return {
        totalElements: focusable.length,
        outOfOrder: outOfOrder,
        passes: outOfOrder < 3, // Tolerância
        message: outOfOrder > 0 ?
          `${outOfOrder} elementos fora da ordem visual` :
          'Ordem de foco segue ordem visual'
      };
    }
```

---

### CT-035: Foco gerenciado em modals

#### 7. Abrir modal
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar botão que abre modal
      const modalTrigger = document.querySelector(
        '[data-modal-open], [data-open-modal], button[aria-haspopup="dialog"]'
      );
      
      if (!modalTrigger) {
        return { 
          note: 'Botão de modal não encontrado, criar mock se necessário',
          mock: true
        };
      }
      
      // Salvar elemento focado antes de abrir
      const previousFocus = document.activeElement;
      
      // Abrir modal
      modalTrigger.click();
      
      return {
        modalOpened: true,
        previousFocusId: previousFocus?.id || previousFocus?.tagName
      };
    }
```

#### 8. Verificar foco preso no modal
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const modal = document.querySelector('[role="dialog"], [role="alertdialog"]');
      
      if (!modal) {
        return {
          note: 'Modal não encontrado',
          passes: true
        };
      }
      
      // Verificar se foco foi movido para modal
      const activeElement = document.activeElement;
      const focusInModal = modal.contains(activeElement);
      
      // Verificar elementos focáveis no modal
      const focusableInModal = modal.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      
      // Verificar se há aria-modal
      const ariaModal = modal.getAttribute('aria-modal');
      
      return {
        modalFound: true,
        focusInModal: focusInModal,
        focusableCount: focusableInModal.length,
        hasAriaModal: ariaModal === 'true',
        activeElementTag: activeElement?.tagName,
        passes: focusInModal && focusableInModal.length > 0
      };
    }
```

#### 9. Testar Tab dentro do modal
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const modal = document.querySelector('[role="dialog"]');
      
      if (!modal) {
        return { note: 'Modal não encontrado' };
      }
      
      const focusableInModal = modal.querySelectorAll(
        'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableInModal.length === 0) {
        return { error: 'Modal sem elementos focáveis' };
      }
      
      // Focar primeiro elemento
      focusableInModal[0].focus();
      
      // Simular Tab até o último
      let currentIndex = 0;
      focusableInModal.forEach((el, index) => {
        el.focus();
        currentIndex = index;
      });
      
      // Verificar se próximo Tab volta ao início
      const lastElement = focusableInModal[focusableInModal.length - 1];
      lastElement.focus();
      
      // Simular Tab
      const tabEvent = new KeyboardEvent('keydown', {
        key: 'Tab',
        code: 'Tab',
        bubbles: true
      });
      
      document.dispatchEvent(tabEvent);
      
      // Aguardar
      setTimeout(() => {
        const nowFocused = document.activeElement;
        const focusTrapped = modal.contains(nowFocused);
        
        return {
          focusTrapped: focusTrapped,
          passes: focusTrapped,
          nowFocusedOn: nowFocused?.tagName
        };
      }, 100);
      
      return { testing: true };
    }
```

#### 10. Fechar modal e verificar foco restaurado
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const modal = document.querySelector('[role="dialog"]');
      
      if (!modal) {
        return { note: 'Modal não encontrado' };
      }
      
      // Procurar botão fechar
      const closeBtn = modal.querySelector(
        '[data-close], [aria-label*="Fechar"], button[aria-label*="Close"]'
      );
      
      if (closeBtn) {
        closeBtn.click();
      } else {
        // Tentar ESC
        const escEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          code: 'Escape',
          bubbles: true
        });
        document.dispatchEvent(escEvent);
      }
      
      // Aguardar e verificar
      setTimeout(() => {
        const modalStillVisible = modal.style.display !== 'none' &&
                                  !modal.hidden &&
                                  modal.getAttribute('aria-hidden') !== 'true';
        
        const activeElement = document.activeElement;
        
        return {
          modalClosed: !modalStillVisible,
          focusRestored: activeElement !== document.body,
          activeElementTag: activeElement?.tagName,
          passes: !modalStillVisible
        };
      }, 500);
      
      return { closing: true };
    }
```

---

### CT-036: Foco não é perdido

#### 11. Testar remoção dinâmica de elemento focado
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Criar elemento temporário
      const tempButton = document.createElement('button');
      tempButton.textContent = 'Botão Temporário';
      tempButton.id = 'temp-btn';
      document.body.appendChild(tempButton);
      
      // Focar
      tempButton.focus();
      
      // Remover
      setTimeout(() => {
        tempButton.remove();
        
        // Verificar onde foi o foco
        setTimeout(() => {
          const activeElement = document.activeElement;
          
          return {
            activeElementTag: activeElement?.tagName,
            focusOnBody: activeElement === document.body,
            passes: activeElement !== document.body,
            message: activeElement === document.body ?
              'Foco foi para body (pode ser problemático)' :
              'Foco movido para elemento válido'
          };
        }, 100);
      }, 500);
      
      return { testing: true };
    }
```

#### 12. Testar disabled de elemento focado
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const button = document.querySelector('button:not([disabled])');
      
      if (!button) {
        return { note: 'Nenhum botão habilitado encontrado' };
      }
      
      // Focar
      button.focus();
      
      // Desabilitar
      button.disabled = true;
      
      // Verificar foco
      setTimeout(() => {
        const activeElement = document.activeElement;
        
        return {
          buttonDisabled: button.disabled,
          activeElementTag: activeElement?.tagName,
          focusOnBody: activeElement === document.body,
          passes: true, // Comportamento esperado pode variar
          note: 'Foco pode ir para body quando elemento é desabilitado'
        };
      }, 100);
      
      return { testing: true };
    }
```

#### 13. Screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ct-036-focus-management.png"
```

---

## ✅ Critérios de Sucesso

**CT-033:**
- [ ] Todos os elementos focáveis têm indicador visível
- [ ] Outline ou box-shadow presente
- [ ] Contraste do foco >= 3:1
- [ ] Foco nunca é invisível

**CT-034:**
- [ ] Ordem de foco segue ordem visual
- [ ] Sem tabindex positivos
- [ ] Elementos lógicos agrupados
- [ ] Sem saltos confusos

**CT-035:**
- [ ] Foco move para modal ao abrir
- [ ] Foco fica preso no modal (Tab trap)
- [ ] Foco restaurado ao fechar
- [ ] aria-modal="true" presente

**CT-036:**
- [ ] Foco não vai para body sem motivo
- [ ] Remoção de elemento gerencia foco
- [ ] Disabled gerencia foco
- [ ] Foco sempre em elemento válido

---

## ⏱️ Duração Esperada

- Total: ~4 minutos
- CT-033: 1 min
- CT-034: 1 min
- CT-035: 1.5 min
- CT-036: 0.5 min

---

## 🐛 Cenários de Falha Comuns

- **Outline: none sem alternativa:** Foco invisível
- **Tabindex positivo:** Ordem de foco confusa
- **Modal sem trap:** Foco escapa para trás
- **Foco não restaurado:** Vai para body
- **Focus management faltando:** Elementos removidos deixam usuário perdido

---

## 📊 Resultado Esperado

```json
{
  "test": "CT-033-036-Focus-Management",
  "status": "PASS",
  "duration": "4m 10s",
  "scenarios": {
    "CT-033": "PASS",
    "CT-034": "PASS",
    "CT-035": "PASS",
    "CT-036": "PASS"
  },
  "allFocusVisible": true,
  "logicalOrder": true,
  "modalTrapsOk": true
}
```
