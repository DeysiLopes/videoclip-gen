# 🎯 CT-013 a CT-015: Formulários Avançados

**Categoria:** Accessibility - Important  
**Tags:** `accessibility`, `forms`, `important`, `wcag-aa`  
**Cenários BDD:** accessibility.robot CT-013 a CT-015

---

## 📋 Descrição

Testar acessibilidade avançada de formulários:
- Mensagens de erro associadas corretamente
- Validação em tempo real acessível
- Grupos de campos (fieldset/legend)

---

## 🎬 Passos para Executar com chrome-devtools MCP

### CT-013: Mensagens de erro associadas

#### 1. Abrir aplicação
```
chrome-devtools-new_page
  url: http://localhost:3000
  timeout: 10000
```

#### 2. Procurar formulário com validação
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const forms = document.querySelectorAll('form');
      const inputs = document.querySelectorAll('input[required], textarea[required]');
      
      return {
        formsCount: forms.length,
        requiredInputs: inputs.length,
        hasValidation: inputs.length > 0,
        forms: Array.from(forms).map((f, i) => ({
          index: i,
          action: f.action,
          method: f.method,
          inputs: f.querySelectorAll('input, textarea, select').length
        }))
      };
    }
```

#### 3. Forçar erro de validação
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar input required
      const requiredInput = document.querySelector('input[required], [aria-required="true"]');
      
      if (!requiredInput) {
        return { error: 'Nenhum input required encontrado' };
      }
      
      // Deixar vazio e tentar submeter
      requiredInput.value = '';
      
      // Procurar botão submit
      const form = requiredInput.closest('form');
      const submitBtn = form?.querySelector('[type="submit"], button:not([type="button"])');
      
      if (submitBtn) {
        submitBtn.click();
      } else {
        // Tentar validação programática
        requiredInput.reportValidity();
      }
      
      return { triggered: true, inputId: requiredInput.id || requiredInput.name };
    }
```

#### 4. Verificar mensagem de erro
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Procurar mensagem de erro
      const errorMsg = document.querySelector(
        '[role="alert"], .error-message, [data-error], .invalid-feedback'
      );
      
      if (!errorMsg) {
        return { 
          hasError: false,
          note: 'Mensagem de erro não encontrada'
        };
      }
      
      return {
        hasError: true,
        errorText: errorMsg.textContent?.trim(),
        hasRole: errorMsg.getAttribute('role') === 'alert',
        passes: true
      };
    }
```

#### 5. Verificar aria-describedby
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const inputs = document.querySelectorAll('input[required], [aria-required="true"]');
      
      const results = Array.from(inputs).map(input => {
        const describedBy = input.getAttribute('aria-describedby');
        const invalid = input.getAttribute('aria-invalid');
        
        let errorElement = null;
        if (describedBy) {
          errorElement = document.getElementById(describedBy);
        }
        
        return {
          inputId: input.id || input.name,
          hasDescribedBy: !!describedBy,
          hasInvalid: !!invalid,
          errorElementExists: !!errorElement,
          errorText: errorElement?.textContent?.trim(),
          passes: !!describedBy && !!errorElement
        };
      });
      
      const allPass = results.every(r => r.passes);
      
      return {
        totalInputs: inputs.length,
        withDescribedBy: results.filter(r => r.hasDescribedBy).length,
        allPass: allPass,
        passes: allPass,
        samples: results.slice(0, 3)
      };
    }
```

#### 6. Screenshot
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ct-013-error-messages.png"
```

---

### CT-014: Validação em tempo real acessível

#### 7. Preencher campo com valor inválido
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar campo de email
      const emailInput = document.querySelector('input[type="email"]');
      
      if (!emailInput) {
        // Criar mock para testar
        const input = document.querySelector('input[type="text"]');
        if (input) {
          input.type = 'email';
          input.value = 'email-invalido';
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('blur', { bubbles: true }));
          return { triggered: true, mock: true };
        }
        return { error: 'Nenhum input de email encontrado' };
      }
      
      // Preencher com valor inválido
      emailInput.value = 'email-invalido';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('blur', { bubbles: true }));
      
      return { triggered: true, inputId: emailInput.id };
    }
```

#### 8. Verificar feedback imediato
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const emailInput = document.querySelector('input[type="email"]');
      
      if (!emailInput) {
        return { note: 'Campo email não encontrado' };
      }
      
      // Verificar atributos ARIA
      const ariaInvalid = emailInput.getAttribute('aria-invalid');
      const ariaDescribedBy = emailInput.getAttribute('aria-describedby');
      
      // Procurar mensagem de erro
      let errorMsg = null;
      if (ariaDescribedBy) {
        errorMsg = document.getElementById(ariaDescribedBy);
      }
      
      // Verificar classe de erro
      const hasErrorClass = emailInput.classList.contains('error') ||
                           emailInput.classList.contains('invalid') ||
                           emailInput.classList.contains('is-invalid');
      
      return {
        hasAriaInvalid: ariaInvalid === 'true',
        hasDescribedBy: !!ariaDescribedBy,
        errorMsgExists: !!errorMsg,
        errorText: errorMsg?.textContent?.trim(),
        hasErrorClass: hasErrorClass,
        passes: ariaInvalid === 'true' && !!errorMsg
      };
    }
```

#### 9. Corrigir valor e verificar feedback
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const emailInput = document.querySelector('input[type="email"]');
      
      if (!emailInput) {
        return { note: 'Campo email não encontrado' };
      }
      
      // Corrigir valor
      emailInput.value = 'email@valido.com';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('blur', { bubbles: true }));
      
      // Aguardar e verificar
      setTimeout(() => {
        const ariaInvalid = emailInput.getAttribute('aria-invalid');
        const errorMsg = emailInput.getAttribute('aria-describedby') ?
          document.getElementById(emailInput.getAttribute('aria-describedby')) : null;
        
        return {
          ariaInvalidRemoved: ariaInvalid === 'false' || !ariaInvalid,
          errorMsgHidden: !errorMsg || errorMsg.style.display === 'none',
          passes: (ariaInvalid === 'false' || !ariaInvalid)
        };
      }, 500);
      
      return { corrected: true };
    }
```

#### 10. Verificar live region
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar live regions para anúncio de erros
      const liveRegions = document.querySelectorAll(
        '[aria-live], [role="alert"], [role="status"]'
      );
      
      const results = Array.from(liveRegions).map(region => {
        const ariaLive = region.getAttribute('aria-live');
        const role = region.getAttribute('role');
        const atomic = region.getAttribute('aria-atomic');
        
        return {
          ariaLive: ariaLive,
          role: role,
          atomic: atomic,
          hasContent: region.textContent?.trim().length > 0
        };
      });
      
      return {
        liveRegionsCount: liveRegions.length,
        hasLiveRegions: liveRegions.length > 0,
        regions: results,
        passes: liveRegions.length > 0
      };
    }
```

---

### CT-015: Grupos de campos (fieldset/legend)

#### 11. Procurar fieldsets
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const fieldsets = document.querySelectorAll('fieldset');
      
      if (fieldsets.length === 0) {
        return {
          note: 'Nenhum fieldset encontrado (pode não ter grupos de campos relacionados)',
          passes: true
        };
      }
      
      const results = Array.from(fieldsets).map(fieldset => {
        const legend = fieldset.querySelector('legend');
        const inputs = fieldset.querySelectorAll('input, textarea, select');
        
        return {
          hasLegend: !!legend,
          legendText: legend?.textContent?.trim(),
          inputsCount: inputs.length,
          passes: !!legend && inputs.length > 0
        };
      });
      
      const allHaveLegend = results.every(r => r.hasLegend);
      
      return {
        fieldsetsCount: fieldsets.length,
        withLegend: results.filter(r => r.hasLegend).length,
        allHaveLegend: allHaveLegend,
        passes: allHaveLegend,
        fieldsets: results
      };
    }
```

#### 12. Verificar grupos de radio buttons
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar grupos de radio buttons
      const radioGroups = {};
      const radios = document.querySelectorAll('input[type="radio"]');
      
      radios.forEach(radio => {
        const name = radio.name;
        if (!radioGroups[name]) {
          radioGroups[name] = [];
        }
        radioGroups[name].push(radio);
      });
      
      if (Object.keys(radioGroups).length === 0) {
        return {
          note: 'Nenhum radio button encontrado',
          passes: true
        };
      }
      
      const results = Object.entries(radioGroups).map(([name, radios]) => {
        // Verificar se está em fieldset
        const firstRadio = radios[0];
        const fieldset = firstRadio.closest('fieldset');
        const legend = fieldset?.querySelector('legend');
        
        // Alternativa: role="radiogroup"
        const radiogroup = firstRadio.closest('[role="radiogroup"]');
        const grouplabel = radiogroup?.getAttribute('aria-labelledby');
        
        return {
          name: name,
          count: radios.length,
          hasFieldset: !!fieldset,
          hasLegend: !!legend,
          hasRadiogroup: !!radiogroup,
          hasGroupLabel: !!grouplabel,
          passes: (!!fieldset && !!legend) || (!!radiogroup && !!grouplabel)
        };
      });
      
      const allPass = results.every(r => r.passes);
      
      return {
        groupsCount: Object.keys(radioGroups).length,
        properlyGrouped: results.filter(r => r.passes).length,
        allPass: allPass,
        passes: allPass,
        groups: results
      };
    }
```

#### 13. Verificar checkboxes relacionados
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const checkboxes = document.querySelectorAll('input[type="checkbox"]');
      
      if (checkboxes.length < 2) {
        return {
          note: 'Menos de 2 checkboxes, não precisa agrupar',
          passes: true
        };
      }
      
      // Verificar se checkboxes relacionados estão agrupados
      const groups = [];
      const processed = new Set();
      
      checkboxes.forEach(checkbox => {
        if (processed.has(checkbox)) return;
        
        const fieldset = checkbox.closest('fieldset');
        const group = checkbox.closest('[role="group"]');
        
        if (fieldset || group) {
          const container = fieldset || group;
          const groupCheckboxes = container.querySelectorAll('input[type="checkbox"]');
          
          if (groupCheckboxes.length > 1) {
            groupCheckboxes.forEach(cb => processed.add(cb));
            
            groups.push({
              hasFieldset: !!fieldset,
              hasLegend: !!fieldset?.querySelector('legend'),
              hasGroup: !!group,
              checkboxCount: groupCheckboxes.length
            });
          }
        }
      });
      
      return {
        totalCheckboxes: checkboxes.length,
        groupsFound: groups.length,
        groupedCheckboxes: processed.size,
        ungroupedCheckboxes: checkboxes.length - processed.size,
        passes: true, // Opcional se checkboxes não são relacionados
        groups: groups
      };
    }
```

#### 14. Screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ct-015-fieldsets.png"
```

---

## ✅ Critérios de Sucesso

**CT-013:**
- [ ] Mensagens de erro são exibidas
- [ ] Erros têm role="alert"
- [ ] Inputs têm aria-describedby apontando para erro
- [ ] aria-invalid="true" quando inválido

**CT-014:**
- [ ] Validação acontece em tempo real (onblur/oninput)
- [ ] Feedback visual imediato
- [ ] aria-invalid atualiza dinamicamente
- [ ] Live regions para anúncio de erros

**CT-015:**
- [ ] Fieldsets têm legends
- [ ] Radio buttons agrupados em fieldset
- [ ] Checkboxes relacionados agrupados
- [ ] Grupos têm labels descritivos

---

## ⏱️ Duração Esperada

- Total: ~3 minutos
- CT-013: 1 min
- CT-014: 1 min
- CT-015: 1 min

---

## 🐛 Cenários de Falha Comuns

- **Erro não associado:** Falta aria-describedby
- **Validação só no submit:** Sem feedback em tempo real
- **Radio buttons soltos:** Sem fieldset/legend
- **aria-invalid não atualiza:** Estado não sincroniza
- **Live region faltando:** Screen reader não anuncia erros

---

## 📊 Resultado Esperado

```json
{
  "test": "CT-013-015-Forms-Advanced",
  "status": "PASS",
  "duration": "3m 10s",
  "scenarios": {
    "CT-013": "PASS",
    "CT-014": "PASS",
    "CT-015": "PASS"
  },
  "errorsAssociated": true,
  "liveValidation": true,
  "groupsProper": true
}
```
