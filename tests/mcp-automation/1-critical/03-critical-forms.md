# 🎯 CT-011 + CT-012: Formulários com Labels Corretos

**Categoria:** Accessibility - Critical  
**Tags:** `forms`, `accessibility`, `critical`  
**Cenários BDD:** accessibility.robot CT-011, CT-012

---

## 📋 Descrição

Verificar que todos os inputs têm labels visíveis e corretamente associados com `htmlFor`.

## 🎬 Passos para Executar com chrome-devtools MCP

### 1. Abrir a aplicação
```
chrome-devtools-new_page
  url: http://localhost:3000
```

### 2. Aguardar carregamento
```
chrome-devtools-wait_for
  text: "DreamDirector AI"
  timeout: 10000
```

### 3. Tirar snapshot para visualizar estrutura
```
chrome-devtools-take_snapshot
  verbose: true
```

### 4. Validar labels de formulários
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const inputs = document.querySelectorAll('input, textarea, select');
      const results = [];
      
      for (const input of inputs) {
        const id = input.id;
        const type = input.type || input.tagName.toLowerCase();
        
        // Procurar label associado
        let label = null;
        let labelText = '';
        let hasFor = false;
        
        if (id) {
          label = document.querySelector(`label[for="${id}"]`);
          if (label) {
            labelText = label.textContent.trim();
            hasFor = true;
          }
        }
        
        // Se não tem label com for, verificar se está dentro de <label>
        if (!label) {
          label = input.closest('label');
          if (label) {
            labelText = label.textContent.trim();
          }
        }
        
        // Verificar aria-label ou aria-labelledby
        const ariaLabel = input.getAttribute('aria-label');
        const ariaLabelledBy = input.getAttribute('aria-labelledby');
        
        results.push({
          id: id || '(no id)',
          type: type,
          hasVisibleLabel: !!label,
          labelText: labelText || ariaLabel || '(no label)',
          hasHtmlFor: hasFor,
          hasAriaLabel: !!ariaLabel,
          hasAriaLabelledBy: !!ariaLabelledBy,
          isAccessible: !!(label || ariaLabel || ariaLabelledBy)
        });
      }
      
      return {
        total: results.length,
        withLabels: results.filter(r => r.isAccessible).length,
        withoutLabels: results.filter(r => !r.isAccessible).length,
        withHtmlFor: results.filter(r => r.hasHtmlFor).length,
        results: results
      };
    }
```

### 5. Validar inputs obrigatórios
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const requiredInputs = document.querySelectorAll('input[required], textarea[required], select[required]');
      const results = [];
      
      for (const input of requiredInputs) {
        const ariaRequired = input.getAttribute('aria-required');
        const hasAsterisk = input.labels?.[0]?.textContent.includes('*');
        
        results.push({
          id: input.id,
          type: input.type || input.tagName,
          required: true,
          hasAriaRequired: ariaRequired === 'true',
          hasVisualIndicator: hasAsterisk
        });
      }
      
      return {
        total: requiredInputs.length,
        withAriaRequired: results.filter(r => r.hasAriaRequired).length,
        results: results
      };
    }
```

### 6. Testar erro de validação
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Simular envio de formulário inválido
      const form = document.querySelector('form');
      if (form) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.click();
        }
      }
      
      // Aguardar e verificar mensagens de erro
      setTimeout(() => {
        const alerts = document.querySelectorAll('[role="alert"]');
        return {
          hasErrors: alerts.length > 0,
          errorCount: alerts.length,
          errors: Array.from(alerts).map(a => a.textContent)
        };
      }, 500);
    }
```

### 7. Tirar screenshot dos erros
```
chrome-devtools-take_screenshot
  fullPage: false
  format: "png"
```

---

## ✅ Critérios de Sucesso

- [ ] 100% dos inputs devem ter labels visíveis
- [ ] Labels devem usar `htmlFor` apontando para input correto
- [ ] Inputs obrigatórios devem ter `aria-required="true"`
- [ ] Mensagens de erro devem ter `role="alert"`
- [ ] Erros devem ter `aria-invalid="true"` no input

---

## 🐛 Cenários de Falha Comuns

- **Label sem for:** `<label>` não tem atributo `for`
- **Input sem id:** Input não tem `id` para associar com label
- **Placeholder como label:** Placeholder não substitui label
- **Erro silencioso:** Erro não tem `role="alert"`
- **Falta aria-required:** Input obrigatório sem aria-required

---

## 📊 Resultado Esperado

```json
{
  "test": "CT-011-012",
  "status": "PASS",
  "totalInputs": 8,
  "withLabels": 8,
  "withHtmlFor": 8,
  "requiredInputs": 3,
  "withAriaRequired": 3,
  "errorHandling": "PASS"
}
```
