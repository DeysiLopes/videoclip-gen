# 🎯 CT-001: Navegação por Teclado

**Categoria:** Accessibility - Critical  
**Tags:** `keyboard`, `accessibility`, `critical`  
**Cenário BDD:** accessibility.robot CT-001

---

## 📋 Descrição

Verificar se todos elementos interativos são acessíveis usando apenas TAB e o focus é sempre visível.

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

### 3. Tirar snapshot inicial
```
chrome-devtools-take_snapshot
  verbose: true
```

### 4. Testar navegação por TAB
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const results = [];
      const interactiveElements = document.querySelectorAll(
        'button, a, input, textarea, select, [tabindex]:not([tabindex="-1"])'
      );
      
      let focusableCount = 0;
      let withoutVisibleFocus = 0;
      
      for (const el of interactiveElements) {
        // Simular focus
        el.focus();
        
        const styles = window.getComputedStyle(el);
        const hasFocusOutline = 
          styles.outline !== 'none' && 
          styles.outline !== '0px' && 
          styles.outlineWidth !== '0px';
        
        const hasFocusRing = 
          styles.boxShadow !== 'none' || 
          styles.border !== el.getAttribute('data-original-border');
        
        const isVisible = 
          el.offsetWidth > 0 && 
          el.offsetHeight > 0 && 
          styles.visibility !== 'hidden' && 
          styles.display !== 'none';
        
        if (isVisible) {
          focusableCount++;
          
          if (!hasFocusOutline && !hasFocusRing) {
            withoutVisibleFocus++;
            results.push({
              element: el.tagName,
              text: el.textContent?.substring(0, 30),
              id: el.id || '(no id)',
              hasFocus: false
            });
          }
        }
      }
      
      return {
        total: focusableCount,
        withVisibleFocus: focusableCount - withoutVisibleFocus,
        withoutVisibleFocus: withoutVisibleFocus,
        passes: withoutVisibleFocus === 0,
        issues: results
      };
    }
```

### 5. Navegar com TAB sequencialmente
```
chrome-devtools-press_key
  key: "Tab"
```

### 6. Repetir TAB para mapear ordem
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const focusOrder = [];
      const firstElement = document.activeElement;
      
      // Simular 20 TABs
      for (let i = 0; i < 20; i++) {
        const focused = document.activeElement;
        
        if (focused) {
          focusOrder.push({
            index: i,
            tag: focused.tagName,
            id: focused.id || '(no id)',
            text: focused.textContent?.substring(0, 20),
            tabIndex: focused.tabIndex
          });
        }
        
        // Simular próximo TAB
        const event = new KeyboardEvent('keydown', { 
          key: 'Tab', 
          code: 'Tab', 
          keyCode: 9, 
          bubbles: true 
        });
        document.activeElement?.dispatchEvent(event);
      }
      
      return {
        focusOrder: focusOrder,
        hasLogicalOrder: true, // Precisa análise manual
        totalFocusable: focusOrder.length
      };
    }
```

### 7. Testar Shift+TAB (voltar)
```
chrome-devtools-press_key
  key: "Shift+Tab"
```

### 8. Verificar keyboard traps
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Testar se há elementos que prendem o focus
      let trapDetected = false;
      const visited = new Set();
      
      for (let i = 0; i < 50; i++) {
        const current = document.activeElement;
        const key = `${current.tagName}-${current.id}`;
        
        if (visited.has(key) && visited.size < 10) {
          trapDetected = true;
          break;
        }
        
        visited.add(key);
        
        // Simular TAB
        const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
        document.activeElement?.dispatchEvent(event);
      }
      
      return {
        keyboardTrapDetected: trapDetected,
        uniqueElementsVisited: visited.size,
        passes: !trapDetected
      };
    }
```

### 9. Testar ENTER em botões
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const buttons = document.querySelectorAll('button');
      let workingButtons = 0;
      let failingButtons = 0;
      
      for (const btn of buttons) {
        if (btn.offsetWidth > 0) {
          btn.focus();
          
          // Verificar se pode ser ativado com ENTER
          const hasClickHandler = 
            btn.onclick !== null || 
            btn.hasAttribute('onclick') ||
            btn.type === 'submit';
          
          if (hasClickHandler) {
            workingButtons++;
          } else {
            failingButtons++;
          }
        }
      }
      
      return {
        total: buttons.length,
        workingWithEnter: workingButtons,
        failing: failingButtons,
        passes: failingButtons === 0
      };
    }
```

### 10. Tirar screenshot do focus ativo
```
chrome-devtools-take_screenshot
  fullPage: false
  format: "png"
```

---

## ✅ Critérios de Sucesso

- [ ] Todos elementos interativos devem ser acessíveis via TAB
- [ ] Focus deve ser sempre visível (outline ou box-shadow)
- [ ] Ordem de focus deve ser lógica (L→R, T→B)
- [ ] Shift+TAB deve voltar corretamente
- [ ] ENTER deve ativar botões
- [ ] SPACE deve ativar checkboxes
- [ ] Sem keyboard traps

---

## 🐛 Cenários de Falha Comuns

- **Outline removido:** `outline: none` sem alternativa
- **Ordem errada:** tabIndex manual quebrando ordem lógica
- **Modal sem trap:** Focus escapa do modal
- **Elementos não focáveis:** Links sem href, divs com onClick

---

## 📊 Resultado Esperado

```json
{
  "test": "CT-001",
  "status": "PASS",
  "totalInteractive": 32,
  "withVisibleFocus": 32,
  "keyboardTraps": 0,
  "focusOrderLogical": true,
  "enterWorks": true
}
```
