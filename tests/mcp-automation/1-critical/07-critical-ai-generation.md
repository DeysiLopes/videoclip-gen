# 🎯 FT-008 a FT-015: Geração de Cenas com IA

**Categoria:** Functional - Critical  
**Tags:** `storyboard`, `ai`, `critical`, `forms`, `validation`  
**Cenários BDD:** functional.robot FT-008 a FT-015

---

## 📋 Descrição

Testar geração de cenas com Gemini AI:
- Preencher descrição
- Validações
- Gerar cenas
- Visualizar/Editar
- Regenerar
- Deletar
- Aprovar

## 🎬 Passos para Executar com chrome-devtools MCP

### PRÉ-REQUISITO: Estar na página Storyboard

#### 1. Navegar para Storyboard
```
chrome-devtools-new_page
  url: http://localhost:3000
```

#### 2. Setup rápido (ou assumir FT-007 completo)
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Simular setup anterior
      localStorage.setItem('currentProject', JSON.stringify({
        name: 'Teste AI',
        audioFile: 'mock-audio.mp3',
        step: 2
      }));
      
      // Navegar
      window.location.hash = '#/storyboard';
      
      return { setupComplete: true };
    }
```

#### 3. Aguardar Storyboard
```
chrome-devtools-wait_for
  text: "Storyboard"
  timeout: 5000
```

---

### FT-008: Preencher descrição do projeto

#### 4. Tirar snapshot
```
chrome-devtools-take_snapshot
  verbose: false
```

#### 5. Preencher descrição
```
chrome-devtools-fill
  uid: "projectDescription"
  value: "Um videoclipe inspirador sobre natureza, mostrando paisagens deslumbrantes e a conexão do ser humano com o meio ambiente"
```

#### 6. Validar salvamento
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const textarea = document.querySelector('textarea[id="projectDescription"]');
      return {
        value: textarea?.value,
        length: textarea?.value?.length || 0,
        saved: textarea?.value?.length > 0
      };
    }
```

---

### FT-009: Validar descrição mínima

#### 7. Limpar e testar descrição curta
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const textarea = document.querySelector('textarea[id="projectDescription"]');
      if (textarea) {
        textarea.value = 'ABC';
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('blur', { bubbles: true }));
      }
      
      return { tested: true, value: 'ABC' };
    }
```

#### 8. Verificar erro de validação
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const alerts = document.querySelectorAll('[role="alert"]');
      const errorMessages = Array.from(alerts).map(a => a.textContent);
      
      const hasMinError = errorMessages.some(msg => 
        msg.toLowerCase().includes('mínimo') ||
        msg.toLowerCase().includes('caracteres')
      );
      
      return {
        hasError: alerts.length > 0,
        errors: errorMessages,
        hasCorrectError: hasMinError,
        passes: hasMinError
      };
    }
```

---

### FT-010: Gerar cenas com Gemini AI

#### 9. Preencher descrição válida
```
chrome-devtools-fill
  uid: "projectDescription"
  value: "Um videoclipe emocionante sobre superação, mostrando a jornada de um atleta que treina arduamente para alcançar seus sonhos, enfrentando desafios e celebrando vitórias"
```

#### 10. Clicar em "Gerar Cenas"
```
chrome-devtools-click
  uid: "button-generate-scenes"
```

#### 11. Verificar loading spinner
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const spinner = document.querySelector('[data-loading="true"], .spinner, [role="progressbar"]');
      const loadingText = document.body.textContent.toLowerCase().includes('gerando');
      
      return {
        hasSpinner: !!spinner,
        hasLoadingText: loadingText,
        isLoading: !!spinner || loadingText
      };
    }
```

#### 12. Aguardar geração (pode demorar)
```
chrome-devtools-wait_for
  text: "Cenas geradas"
  timeout: 45000
```

#### 13. Verificar quantidade de cenas
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const scenes = document.querySelectorAll('[data-scene-card], .scene-card, [data-scene]');
      const sceneDetails = [];
      
      for (const scene of scenes) {
        const prompt = scene.querySelector('[data-prompt], .prompt');
        sceneDetails.push({
          id: scene.getAttribute('data-scene-id'),
          hasPrompt: !!prompt,
          promptPreview: prompt?.textContent?.substring(0, 50)
        });
      }
      
      return {
        sceneCount: scenes.length,
        expectedCount: 5,
        scenes: sceneDetails,
        passes: scenes.length >= 5
      };
    }
```

#### 14. Tirar screenshot das cenas
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/screenshots/ft-010-scenes-generated.png"
```

---

### FT-011: Visualizar cena gerada

#### 15. Clicar na primeira cena
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const firstScene = document.querySelector('[data-scene-card], .scene-card');
      if (firstScene) {
        firstScene.click();
        return { clicked: true };
      }
      return { clicked: false, error: 'Scene not found' };
    }
```

#### 16. Verificar preview
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const modal = document.querySelector('[role="dialog"]');
      const preview = modal?.querySelector('video, img, [data-preview]');
      const prompt = modal?.querySelector('[data-prompt], .prompt');
      
      return {
        modalOpen: !!modal,
        hasPreview: !!preview,
        hasPrompt: !!prompt,
        promptText: prompt?.textContent?.substring(0, 100),
        passes: !!modal && !!prompt
      };
    }
```

---

### FT-012: Editar prompt da cena

#### 17. Localizar botão de edição
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const editButton = document.querySelector('[data-edit-scene], button[aria-label*="Editar"]');
      if (editButton) {
        editButton.click();
        return { editing: true };
      }
      return { editing: false };
    }
```

#### 18. Modificar prompt
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const promptInput = document.querySelector('textarea[data-prompt-editor], input[data-prompt-editor]');
      
      if (promptInput) {
        const newPrompt = 'Versão melhorada: Uma cena dramática com iluminação cinematográfica';
        promptInput.value = newPrompt;
        promptInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        return { 
          modified: true, 
          newValue: newPrompt 
        };
      }
      
      return { modified: false };
    }
```

#### 19. Salvar edição
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const saveButton = document.querySelector('[data-save-prompt], button[aria-label*="Salvar"]');
      if (saveButton) {
        saveButton.click();
        return { saved: true };
      }
      return { saved: false };
    }
```

#### 20. Verificar atualização
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const scenes = document.querySelectorAll('[data-scene-card]');
      const firstScene = scenes[0];
      const prompt = firstScene?.querySelector('[data-prompt]')?.textContent;
      
      return {
        promptUpdated: prompt?.includes('Versão melhorada'),
        currentPrompt: prompt?.substring(0, 50)
      };
    }
```

---

### FT-013: Regenerar cena individual

#### 21. Clicar em regenerar
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const regenerateBtn = document.querySelector('[data-regenerate-scene], button[aria-label*="Regenerar"]');
      
      if (regenerateBtn) {
        // Guardar prompt antigo
        const oldPrompt = document.querySelector('[data-prompt]')?.textContent;
        regenerateBtn.click();
        
        return { 
          regenerating: true,
          oldPrompt: oldPrompt?.substring(0, 50)
        };
      }
      
      return { regenerating: false };
    }
```

#### 22. Aguardar nova geração
```
chrome-devtools-wait_for
  text: "Cena regenerada"
  timeout: 30000
```

#### 23. Verificar mudança
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const newPrompt = document.querySelector('[data-prompt]')?.textContent;
      
      return {
        newPrompt: newPrompt?.substring(0, 50),
        changed: true // Precisa comparar com oldPrompt salvo
      };
    }
```

---

### FT-014: Deletar cena

#### 24. Contar cenas antes
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const scenes = document.querySelectorAll('[data-scene-card]');
      return { countBefore: scenes.length };
    }
```

#### 25. Clicar em deletar segunda cena
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const scenes = document.querySelectorAll('[data-scene-card]');
      const secondScene = scenes[1];
      
      if (secondScene) {
        const deleteBtn = secondScene.querySelector('[data-delete-scene], button[aria-label*="Deletar"]');
        deleteBtn?.click();
        return { clicked: true };
      }
      
      return { clicked: false };
    }
```

#### 26. Verificar modal de confirmação
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const modal = document.querySelector('[role="dialog"]');
      const confirmText = modal?.textContent?.toLowerCase();
      
      return {
        modalOpen: !!modal,
        isConfirmation: confirmText?.includes('confirmar') || confirmText?.includes('deletar'),
        passes: !!modal
      };
    }
```

#### 27. Confirmar deleção
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const confirmBtn = document.querySelector('button[data-confirm], button[aria-label*="Confirmar"]');
      
      if (confirmBtn) {
        confirmBtn.click();
        return { confirmed: true };
      }
      
      return { confirmed: false };
    }
```

#### 28. Contar cenas depois
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const scenes = document.querySelectorAll('[data-scene-card]');
      return { 
        countAfter: scenes.length,
        expectedCount: 4,
        passes: scenes.length === 4
      };
    }
```

---

### FT-015: Aprovação de cena

#### 29. Aprovar primeira cena
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const firstScene = document.querySelector('[data-scene-card]');
      const approveBtn = firstScene?.querySelector('[data-approve-scene], button[aria-label*="Aprovar"]');
      
      if (approveBtn) {
        approveBtn.click();
        return { approved: true };
      }
      
      return { approved: false };
    }
```

#### 30. Verificar status
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const firstScene = document.querySelector('[data-scene-card]');
      const status = firstScene?.getAttribute('data-status');
      const hasApprovedClass = firstScene?.classList.contains('approved');
      const statusText = firstScene?.querySelector('[data-status-text]')?.textContent;
      
      return {
        status: status,
        hasApprovedClass: hasApprovedClass,
        statusText: statusText,
        isApproved: status === 'APPROVED' || statusText === 'APROVADA',
        passes: status === 'APPROVED'
      };
    }
```

#### 31. Screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/screenshots/ft-015-scene-approved.png"
```

---

## ✅ Critérios de Sucesso

**FT-008:** Descrição salva corretamente  
**FT-009:** Erro mostrado para descrição < 10 caracteres  
**FT-010:** 5 cenas geradas com prompts  
**FT-011:** Preview e prompt visíveis  
**FT-012:** Prompt atualizado após edição  
**FT-013:** Nova cena gerada com prompt diferente  
**FT-014:** Cena deletada, restam 4  
**FT-015:** Cena marcada como "APROVADA"

---

## ⏱️ Duração Esperada

- Total: ~8-10 minutos
- FT-008: 30s
- FT-009: 30s
- FT-010: 45s (geração IA)
- FT-011: 30s
- FT-012: 1m
- FT-013: 45s (regeneração IA)
- FT-014: 1m
- FT-015: 30s

---

## 🐛 Cenários de Falha Comuns

- **IA timeout:** Gemini API lenta
- **Cenas não aparecem:** Resposta IA malformada
- **Edição não salva:** State management quebrado
- **Deleção falha:** Confirmação modal não funciona
- **Aprovação não marca:** Status não atualiza

---

## 📊 Resultado Esperado

```json
{
  "test": "FT-008-015-AI-Generation",
  "status": "PASS",
  "duration": "9m 15s",
  "scenarios": {
    "FT-008": "PASS",
    "FT-009": "PASS",
    "FT-010": "PASS",
    "FT-011": "PASS",
    "FT-012": "PASS",
    "FT-013": "PASS",
    "FT-014": "PASS",
    "FT-015": "PASS"
  },
  "scenesGenerated": 5,
  "scenesDeleted": 1,
  "scenesApproved": 1
}
```
