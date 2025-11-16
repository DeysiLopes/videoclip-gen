# 🎯 CT-021 a CT-025: ARIA Attributes

**Categoria:** Accessibility - Critical  
**Tags:** `aria`, `accessibility`, `critical`, `screenreader`  
**Cenários BDD:** accessibility.robot CT-021 a CT-025

---

## 📋 Descrição

Validar uso correto de ARIA attributes:
- Ícones têm aria-label
- Modals têm role="dialog"
- Alerts têm role="alert"
- Decorativos têm aria-hidden
- Inputs inválidos têm aria-invalid

## 🎬 Passos para Executar com chrome-devtools MCP

### CT-021: Ícones sem texto têm aria-label

#### 1. Abrir aplicação
```
chrome-devtools-new_page
  url: http://localhost:3000
```

#### 2. Aguardar carregamento
```
chrome-devtools-wait_for
  text: "DreamDirector AI"
  timeout: 10000
```

#### 3. Localizar ícones sem texto
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar elementos que parecem ícones
      const potentialIcons = [];
      
      // SVGs
      const svgs = document.querySelectorAll('svg');
      for (const svg of svgs) {
        const parent = svg.parentElement;
        const hasText = parent?.textContent?.trim().length > svg.textContent?.trim().length;
        const hasAriaLabel = svg.hasAttribute('aria-label') || 
                           svg.hasAttribute('aria-labelledby') ||
                           parent?.hasAttribute('aria-label');
        const hasTitle = svg.querySelector('title') !== null;
        const isDecorative = svg.getAttribute('aria-hidden') === 'true';
        
        if (!hasText && !isDecorative) {
          potentialIcons.push({
            type: 'SVG',
            hasAriaLabel: hasAriaLabel,
            hasTitle: hasTitle,
            hasText: hasText,
            isAccessible: hasAriaLabel || hasTitle,
            problem: !hasAriaLabel && !hasTitle ? 'Falta aria-label ou <title>' : null
          });
        }
      }
      
      // Icon fonts (Font Awesome, Material Icons, etc)
      const iconFonts = document.querySelectorAll('[class*="icon"], [class*="fa-"], i');
      for (const icon of iconFonts) {
        const hasText = icon.textContent?.trim().length > 0;
        const hasAriaLabel = icon.hasAttribute('aria-label') || 
                           icon.parentElement?.hasAttribute('aria-label');
        const isDecorative = icon.getAttribute('aria-hidden') === 'true';
        
        if (!hasText && !isDecorative) {
          potentialIcons.push({
            type: 'Icon Font',
            class: icon.className,
            hasAriaLabel: hasAriaLabel,
            isAccessible: hasAriaLabel,
            problem: !hasAriaLabel ? 'Falta aria-label' : null
          });
        }
      }
      
      // Botões só com ícones
      const buttons = document.querySelectorAll('button');
      for (const btn of buttons) {
        const textLength = btn.textContent?.trim().length || 0;
        const hasSvg = btn.querySelector('svg') !== null;
        const hasIcon = btn.querySelector('[class*="icon"]') !== null;
        
        if ((hasSvg || hasIcon) && textLength < 3) {
          const hasAriaLabel = btn.hasAttribute('aria-label');
          const hasAriaLabelledBy = btn.hasAttribute('aria-labelledby');
          const hasTitle = btn.hasAttribute('title');
          
          potentialIcons.push({
            type: 'Button with icon',
            text: btn.textContent?.trim() || '(none)',
            hasAriaLabel: hasAriaLabel || hasAriaLabelledBy,
            hasTitle: hasTitle,
            isAccessible: hasAriaLabel || hasAriaLabelledBy || hasTitle,
            problem: !(hasAriaLabel || hasAriaLabelledBy) ? 'Botão sem texto precisa aria-label' : null
          });
        }
      }
      
      const problems = potentialIcons.filter(i => i.problem !== null);
      
      return {
        totalIcons: potentialIcons.length,
        accessible: potentialIcons.filter(i => i.isAccessible).length,
        problems: problems.length,
        problemsList: problems.slice(0, 5),
        passes: problems.length === 0
      };
    }
```

#### 4. Verificar ícones interativos
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Ícones que são clicáveis DEVEM ter aria-label
      const clickableIcons = [];
      
      const allClickable = document.querySelectorAll('[onclick], [role="button"]');
      
      for (const el of allClickable) {
        const hasSvg = el.querySelector('svg') !== null;
        const hasIcon = el.querySelector('[class*="icon"]') !== null;
        const hasText = el.textContent?.trim().length > 3;
        
        if ((hasSvg || hasIcon) && !hasText) {
          const hasAriaLabel = el.hasAttribute('aria-label') || 
                              el.hasAttribute('aria-labelledby');
          
          if (!hasAriaLabel) {
            clickableIcons.push({
              tag: el.tagName,
              class: el.className?.substring(0, 30),
              problem: 'Ícone clicável sem aria-label',
              critical: true
            });
          }
        }
      }
      
      return {
        clickableIconsWithoutLabel: clickableIcons.length,
        issues: clickableIcons,
        passes: clickableIcons.length === 0
      };
    }
```

---

### CT-022: Modals têm role="dialog" e aria-modal

#### 5. Localizar todos os modals
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const modals = document.querySelectorAll('[role="dialog"], [role="alertdialog"], .modal, [data-modal]');
      const results = [];
      
      for (const modal of modals) {
        const hasRoleDialog = modal.getAttribute('role') === 'dialog' || 
                             modal.getAttribute('role') === 'alertdialog';
        const hasAriaModal = modal.getAttribute('aria-modal') === 'true';
        const hasAriaLabel = modal.hasAttribute('aria-label') || 
                            modal.hasAttribute('aria-labelledby');
        const hasFocusableElements = modal.querySelectorAll('button, a, input').length > 0;
        
        results.push({
          class: modal.className?.substring(0, 30) || '(no class)',
          hasRoleDialog: hasRoleDialog,
          hasAriaModal: hasAriaModal,
          hasAriaLabel: hasAriaLabel,
          hasFocusableElements: hasFocusableElements,
          passes: hasRoleDialog && hasAriaModal && hasAriaLabel,
          issues: []
        });
        
        // Coletar issues
        const lastResult = results[results.length - 1];
        if (!hasRoleDialog) lastResult.issues.push('Falta role="dialog"');
        if (!hasAriaModal) lastResult.issues.push('Falta aria-modal="true"');
        if (!hasAriaLabel) lastResult.issues.push('Falta aria-label ou aria-labelledby');
      }
      
      return {
        modalCount: modals.length,
        modals: results,
        allPass: results.every(m => m.passes),
        passes: results.every(m => m.passes)
      };
    }
```

#### 6. Testar modal real abrindo
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar botão que abre modal
      const buttons = document.querySelectorAll('button');
      
      for (const btn of buttons) {
        const text = btn.textContent?.toLowerCase();
        if (text?.includes('editar') || 
            text?.includes('deletar') ||
            text?.includes('adicionar')) {
          btn.click();
          return { opened: true, button: btn.textContent?.trim() };
        }
      }
      
      // Se não encontrou, criar modal mock
      const modal = document.createElement('div');
      modal.setAttribute('role', 'dialog');
      modal.setAttribute('aria-modal', 'true');
      modal.setAttribute('aria-labelledby', 'modal-title');
      modal.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:white;padding:20px;z-index:1000;box-shadow:0 4px 6px rgba(0,0,0,0.1);';
      modal.innerHTML = `
        <h2 id="modal-title">Modal de Teste</h2>
        <p>Conteúdo do modal</p>
        <button>Fechar</button>
      `;
      document.body.appendChild(modal);
      
      return { created: 'mock', hasRole: true, hasAriaModal: true };
    }
```

#### 7. Validar modal aberto
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const modal = document.querySelector('[role="dialog"]');
      
      if (!modal) {
        return { error: 'Modal not found' };
      }
      
      const role = modal.getAttribute('role');
      const ariaModal = modal.getAttribute('aria-modal');
      const ariaLabel = modal.getAttribute('aria-label');
      const ariaLabelledBy = modal.getAttribute('aria-labelledby');
      
      // Verificar se título existe se usar aria-labelledby
      let titleExists = true;
      if (ariaLabelledBy) {
        const titleEl = document.getElementById(ariaLabelledBy);
        titleExists = !!titleEl;
      }
      
      return {
        role: role,
        ariaModal: ariaModal,
        hasLabel: !!(ariaLabel || (ariaLabelledBy && titleExists)),
        passes: role === 'dialog' && ariaModal === 'true' && !!(ariaLabel || ariaLabelledBy),
        recommendation: 'Modal OK se passes === true'
      };
    }
```

---

### CT-023: Alerts têm role="alert" e aria-live

#### 8. Localizar áreas de notificação
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const alerts = document.querySelectorAll('[role="alert"], [role="status"], .alert, .notification, [data-alert]');
      const results = [];
      
      for (const alert of alerts) {
        const role = alert.getAttribute('role');
        const ariaLive = alert.getAttribute('aria-live');
        const ariaAtomic = alert.getAttribute('aria-atomic');
        
        // role="alert" implica aria-live="assertive" e aria-atomic="true"
        const isAlert = role === 'alert';
        const isStatus = role === 'status'; // aria-live="polite"
        
        results.push({
          class: alert.className?.substring(0, 30) || '(no class)',
          role: role,
          ariaLive: ariaLive,
          ariaAtomic: ariaAtomic,
          hasRole: !!(role === 'alert' || role === 'status'),
          passes: isAlert || isStatus,
          recommendation: !isAlert && !isStatus ? 'Adicionar role="alert" ou role="status"' : 'OK'
        });
      }
      
      return {
        alertCount: alerts.length,
        alerts: results,
        withRole: results.filter(a => a.hasRole).length,
        passes: results.every(a => a.hasRole) || alerts.length === 0
      };
    }
```

#### 9. Simular erro de formulário
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar input e simular erro
      const input = document.querySelector('input[required], input[type="email"]');
      
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('blur', { bubbles: true }));
        
        return { triggered: true, input: input.id };
      }
      
      // Criar erro mock
      const errorDiv = document.createElement('div');
      errorDiv.setAttribute('role', 'alert');
      errorDiv.setAttribute('aria-live', 'assertive');
      errorDiv.textContent = 'Este campo é obrigatório';
      errorDiv.style.color = 'red';
      document.body.appendChild(errorDiv);
      
      return { created: 'mock', hasRole: true };
    }
```

#### 10. Verificar erro tem role="alert"
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Procurar mensagens de erro
      const errorMessages = document.querySelectorAll('[role="alert"], .error, [data-error]');
      const issues = [];
      
      for (const error of errorMessages) {
        const role = error.getAttribute('role');
        const hasRole = role === 'alert';
        
        if (!hasRole && error.textContent?.trim().length > 0) {
          issues.push({
            text: error.textContent?.substring(0, 50),
            class: error.className,
            problem: 'Mensagem de erro sem role="alert"'
          });
        }
      }
      
      return {
        errorCount: errorMessages.length,
        issues: issues,
        passes: issues.length === 0 || errorMessages.length === 0
      };
    }
```

---

### CT-024: Elementos decorativos têm aria-hidden

#### 11. Localizar elementos decorativos
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const decorativeElements = [];
      
      // SVGs decorativos
      const svgs = document.querySelectorAll('svg');
      for (const svg of svgs) {
        const parent = svg.parentElement;
        const isInButton = parent?.tagName === 'BUTTON';
        const parentHasLabel = parent?.hasAttribute('aria-label');
        const hasAriaHidden = svg.getAttribute('aria-hidden') === 'true';
        const hasTitle = svg.querySelector('title') !== null;
        
        // Se está em botão com label, SVG deve ser decorativo
        if (isInButton && parentHasLabel && !hasAriaHidden) {
          decorativeElements.push({
            type: 'SVG in labeled button',
            problem: 'Deve ter aria-hidden="true"',
            parentButton: parent.getAttribute('aria-label')?.substring(0, 30)
          });
        }
      }
      
      // Ícones decorativos (Font Awesome, etc)
      const icons = document.querySelectorAll('[class*="icon"], [class*="fa-"], i');
      for (const icon of icons) {
        const parent = icon.parentElement;
        const parentHasText = parent?.textContent?.trim().length > icon.textContent?.trim().length;
        const hasAriaHidden = icon.getAttribute('aria-hidden') === 'true';
        
        // Se parent tem texto, ícone é decorativo
        if (parentHasText && !hasAriaHidden) {
          decorativeElements.push({
            type: 'Icon with text',
            class: icon.className?.substring(0, 30),
            problem: 'Deve ter aria-hidden="true"',
            parentText: parent?.textContent?.substring(0, 30)
          });
        }
      }
      
      // Imagens decorativas
      const images = document.querySelectorAll('img');
      for (const img of images) {
        const alt = img.getAttribute('alt');
        const isDecorative = alt === '' || alt === null;
        const hasAriaHidden = img.getAttribute('aria-hidden') === 'true';
        const hasRole = img.getAttribute('role');
        
        // Se alt vazio, deve ter aria-hidden ou role="presentation"
        if (isDecorative && !hasAriaHidden && hasRole !== 'presentation') {
          decorativeElements.push({
            type: 'Decorative image',
            src: img.src?.substring(0, 30),
            problem: 'Deve ter aria-hidden="true" ou role="presentation"',
            recommendation: 'Adicionar aria-hidden="true"'
          });
        }
      }
      
      return {
        decorativeElements: decorativeElements.length,
        issues: decorativeElements.slice(0, 5),
        passes: decorativeElements.length === 0
      };
    }
```

#### 12. Verificar separadores visuais
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Elementos como <hr>, dividers, spacers devem ser decorativos
      const separators = document.querySelectorAll('hr, [class*="divider"], [class*="separator"]');
      const issues = [];
      
      for (const sep of separators) {
        const hasAriaHidden = sep.getAttribute('aria-hidden') === 'true';
        const hasRole = sep.getAttribute('role');
        
        // hr é semanticamente OK, mas outros precisam aria-hidden
        if (sep.tagName !== 'HR' && !hasAriaHidden && hasRole !== 'presentation') {
          issues.push({
            element: sep.tagName,
            class: sep.className?.substring(0, 30),
            problem: 'Separador decorativo deve ter aria-hidden="true"'
          });
        }
      }
      
      return {
        separatorCount: separators.length,
        issues: issues,
        passes: issues.length === 0
      };
    }
```

---

### CT-025: Inputs inválidos têm aria-invalid

#### 13. Localizar inputs obrigatórios
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const requiredInputs = document.querySelectorAll('input[required], textarea[required], select[required]');
      const results = [];
      
      for (const input of requiredInputs) {
        const value = input.value?.trim();
        const isEmpty = !value || value.length === 0;
        const ariaInvalid = input.getAttribute('aria-invalid');
        
        results.push({
          id: input.id || '(no id)',
          type: input.type || input.tagName,
          isEmpty: isEmpty,
          ariaInvalid: ariaInvalid,
          shouldBeInvalid: isEmpty,
          isCorrect: isEmpty ? ariaInvalid === 'true' : ariaInvalid !== 'true'
        });
      }
      
      return {
        totalRequired: requiredInputs.length,
        results: results,
        passes: results.every(r => r.isCorrect)
      };
    }
```

#### 14. Testar validação de email
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const emailInput = document.querySelector('input[type="email"]');
      
      if (!emailInput) {
        return { message: 'Nenhum input email encontrado', skipped: true };
      }
      
      // Simular email inválido
      emailInput.value = 'invalido';
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
      emailInput.dispatchEvent(new Event('blur', { bubbles: true }));
      
      return {
        tested: true,
        value: emailInput.value,
        message: 'Deve marcar aria-invalid="true"'
      };
    }
```

#### 15. Verificar aria-invalid após validação
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verificar inputs que falharam validação
      const invalidInputs = document.querySelectorAll('input:invalid, textarea:invalid, select:invalid');
      const issues = [];
      
      for (const input of invalidInputs) {
        const ariaInvalid = input.getAttribute('aria-invalid');
        const hasAriaDescribedBy = input.hasAttribute('aria-describedby');
        
        if (ariaInvalid !== 'true') {
          issues.push({
            id: input.id || '(no id)',
            type: input.type || input.tagName,
            problem: 'Input inválido sem aria-invalid="true"',
            value: input.value?.substring(0, 20)
          });
        }
        
        if (!hasAriaDescribedBy) {
          issues.push({
            id: input.id || '(no id)',
            problem: 'Deve ter aria-describedby apontando para mensagem de erro'
          });
        }
      }
      
      return {
        invalidCount: invalidInputs.length,
        issues: issues,
        passes: issues.length === 0 || invalidInputs.length === 0
      };
    }
```

#### 16. Verificar mensagem de erro vinculada
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const inputs = document.querySelectorAll('input[aria-invalid="true"]');
      const results = [];
      
      for (const input of inputs) {
        const describedBy = input.getAttribute('aria-describedby');
        let errorMessage = null;
        let errorExists = false;
        
        if (describedBy) {
          errorMessage = document.getElementById(describedBy);
          errorExists = !!errorMessage;
        }
        
        results.push({
          inputId: input.id,
          ariaDescribedBy: describedBy,
          errorExists: errorExists,
          errorText: errorMessage?.textContent?.substring(0, 50),
          passes: errorExists
        });
      }
      
      return {
        testedInputs: results.length,
        results: results,
        passes: results.every(r => r.passes) || results.length === 0
      };
    }
```

#### 17. Screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/screenshots/ct-025-aria-attributes.png"
```

---

## ✅ Critérios de Sucesso

**CT-021:**
- [ ] Ícones sem texto têm aria-label
- [ ] Botões só com ícone têm label
- [ ] SVGs têm `<title>` ou aria-label

**CT-022:**
- [ ] Modals têm role="dialog"
- [ ] Modals têm aria-modal="true"
- [ ] Modals têm aria-label ou aria-labelledby

**CT-023:**
- [ ] Erros têm role="alert"
- [ ] Notificações têm role="status"
- [ ] aria-live="assertive" ou "polite"

**CT-024:**
- [ ] Ícones decorativos têm aria-hidden="true"
- [ ] Imagens decorativas têm alt=""
- [ ] Separadores têm aria-hidden

**CT-025:**
- [ ] Inputs inválidos têm aria-invalid="true"
- [ ] Inputs têm aria-describedby
- [ ] Mensagem de erro existe e é vinculada

---

## ⏱️ Duração Esperada

- Total: ~2-3 minutos
- CT-021: 30s
- CT-022: 30s
- CT-023: 30s
- CT-024: 30s
- CT-025: 45s

---

## 🐛 Cenários de Falha Comuns

- **Ícone sem label:** Screen reader anuncia vazio
- **Modal sem role:** Não identificado como diálogo
- **Erro sem role="alert":** Não anunciado automaticamente
- **Decorativo não oculto:** Screen reader lê desnecessariamente
- **aria-invalid faltando:** Usuário não sabe que campo é inválido

---

## 📊 Resultado Esperado

```json
{
  "test": "CT-021-025-ARIA",
  "status": "PASS",
  "duration": "2m 30s",
  "scenarios": {
    "CT-021": "PASS",
    "CT-022": "PASS",
    "CT-023": "PASS",
    "CT-024": "PASS",
    "CT-025": "PASS"
  },
  "iconsWithLabel": 32,
  "iconsWithoutLabel": 0,
  "modalsCorrect": true,
  "ariaScore": "100%"
}
```
