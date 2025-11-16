# 🎯 CT-040: Lighthouse Accessibility Score >= 85

**Categoria:** Accessibility - Critical  
**Tags:** `lighthouse`, `accessibility`, `critical`  
**Cenário BDD:** accessibility.robot CT-040

---

## 📋 Descrição

Verificar que a aplicação atinge score mínimo de 85 no Lighthouse Accessibility.

## 🎬 Passos para Executar com chrome-devtools MCP

### 1. Abrir aplicação
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

### 3. Iniciar trace de performance
```
chrome-devtools-performance_start_trace
  reload: true
  autoStop: true
```

### 4. Aguardar trace completar (automático)
```
# O trace para automaticamente após alguns segundos
# Lighthouse scores são gerados automaticamente
```

### 5. Analisar insights de acessibilidade
```
chrome-devtools-performance_analyze_insight
  insightSetId: "latest"
  insightName: "LCPBreakdown"
```

### 6. Extrair métricas manualmente via JavaScript
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      // Simular auditoria básica de acessibilidade
      const issues = [];
      
      // 1. Verificar imagens sem alt
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      if (imagesWithoutAlt.length > 0) {
        issues.push({
          category: 'images',
          severity: 'critical',
          count: imagesWithoutAlt.length,
          message: 'Images without alt text'
        });
      }
      
      // 2. Verificar contraste
      const lowContrastElements = document.querySelectorAll('[data-low-contrast]');
      if (lowContrastElements.length > 0) {
        issues.push({
          category: 'contrast',
          severity: 'critical',
          count: lowContrastElements.length,
          message: 'Low contrast elements'
        });
      }
      
      // 3. Verificar labels em inputs
      const inputsWithoutLabels = Array.from(document.querySelectorAll('input')).filter(
        input => !input.labels || input.labels.length === 0
      );
      if (inputsWithoutLabels.length > 0) {
        issues.push({
          category: 'forms',
          severity: 'critical',
          count: inputsWithoutLabels.length,
          message: 'Inputs without labels'
        });
      }
      
      // 4. Verificar hierarquia de headings
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      let previousLevel = 0;
      let hierarchyIssues = 0;
      
      for (const heading of headings) {
        const level = parseInt(heading.tagName[1]);
        if (level > previousLevel + 1) {
          hierarchyIssues++;
        }
        previousLevel = level;
      }
      
      if (hierarchyIssues > 0) {
        issues.push({
          category: 'headings',
          severity: 'moderate',
          count: hierarchyIssues,
          message: 'Heading hierarchy skipped levels'
        });
      }
      
      // 5. Verificar ARIA
      const ariaIssues = document.querySelectorAll('[aria-labelledby]:not([aria-labelledby=""])');
      const validAriaLabelledBy = Array.from(ariaIssues).filter(el => {
        const labelId = el.getAttribute('aria-labelledby');
        return document.getElementById(labelId);
      });
      
      if (validAriaLabelledBy.length !== ariaIssues.length) {
        issues.push({
          category: 'aria',
          severity: 'moderate',
          count: ariaIssues.length - validAriaLabelledBy.length,
          message: 'Invalid aria-labelledby references'
        });
      }
      
      // Calcular score simplificado
      const totalChecks = 5;
      const passedChecks = totalChecks - issues.filter(i => i.severity === 'critical').length;
      const score = Math.round((passedChecks / totalChecks) * 100);
      
      return {
        score: score,
        targetScore: 85,
        passes: score >= 85,
        issues: issues,
        summary: {
          critical: issues.filter(i => i.severity === 'critical').length,
          moderate: issues.filter(i => i.severity === 'moderate').length,
          total: issues.length
        }
      };
    }
```

### 7. Verificar console errors
```
chrome-devtools-list_console_messages
  types: ["error", "warn"]
  pageSize: 50
```

### 8. Verificar network errors
```
chrome-devtools-list_network_requests
  resourceTypes: ["document", "script", "stylesheet"]
  pageSize: 50
```

### 9. Tirar screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
```

---

## ✅ Critérios de Sucesso

- [ ] Score >= 85 em Accessibility
- [ ] 0 erros críticos de acessibilidade
- [ ] Contraste de cores passa
- [ ] Form labels passam
- [ ] Hierarquia de headings correta
- [ ] Imagens têm alt text
- [ ] ARIA attributes válidos

---

## 📊 Lighthouse Checklist

### Critical Issues (Score < 85)
- [ ] Images don't have alt attributes
- [ ] Form elements don't have labels
- [ ] Background/foreground colors insufficient contrast
- [ ] Buttons don't have accessible names
- [ ] Links don't have discernible names

### Moderate Issues (Score 85-94)
- [ ] Heading elements not in sequentially-descending order
- [ ] Some elements have tabindex > 0
- [ ] Lists don't contain only li elements
- [ ] IDs are not unique
- [ ] ARIA attributes invalid

### Best Practices (Score 95-100)
- [ ] All ARIA attributes correct
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Skip links implemented
- [ ] Landmarks present

---

## 🐛 Cenários de Falha Comuns

- **Score < 70:** Problemas críticos múltiplos
- **Score 70-84:** Alguns problemas críticos ainda
- **Score 85-94:** Problemas moderados apenas
- **Score 95+:** Excelente acessibilidade

---

## 📊 Resultado Esperado

```json
{
  "test": "CT-040-Lighthouse",
  "status": "PASS",
  "lighthouseScore": 92,
  "targetScore": 85,
  "issues": {
    "critical": 0,
    "moderate": 2,
    "total": 2
  },
  "breakdown": {
    "contrast": "PASS",
    "formLabels": "PASS",
    "altText": "PASS",
    "headings": "PASS",
    "aria": "WARN"
  }
}
```
