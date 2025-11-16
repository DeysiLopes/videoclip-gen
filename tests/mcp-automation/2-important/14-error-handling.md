# 🎯 FT-031 a FT-034: Tratamento de Erros

**Categoria:** Functional - Important  
**Tags:** `errors`, `important`, `resilience`, `ux`  
**Cenários BDD:** functional.robot FT-031 a FT-034

---

## 📋 Descrição

Testar tratamento de erros e resiliência:
- Erro ao conectar com IA (Gemini)
- Erro ao renderizar vídeo (RunwayML)
- Arquivo de áudio inválido
- Timeout em operação longa

## 🎬 Passos para Executar com chrome-devtools MCP

### FT-031: Erro ao conectar com IA

#### 1. Abrir aplicação
```
chrome-devtools-new_page
  url: http://localhost:3000
  timeout: 10000
```

#### 2. Mock de erro de IA
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Interceptar chamadas para IA
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        
        // Simular erro na API Gemini
        if (typeof url === 'string' && url.includes('gemini')) {
          return Promise.reject(new Error('Network error: Failed to connect to Gemini API'));
        }
        
        return originalFetch.apply(this, args);
      };
      
      return { mocked: true };
    }
```

#### 3. Tentar gerar cenas
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Preencher form
      const nameInput = document.querySelector('[name="projectName"], input[type="text"]');
      const descInput = document.querySelector('[name="description"], textarea');
      
      if (nameInput) nameInput.value = 'Teste de Erro';
      if (descInput) descInput.value = 'Forçar erro na IA';
      
      // Clicar em gerar
      const generateBtn = document.querySelector('[data-generate], button:has-text("Gerar")');
      if (generateBtn) {
        generateBtn.click();
        return { triggered: true };
      }
      
      return { error: 'Botão gerar não encontrado' };
    }
```

#### 4. Aguardar erro
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Procurar mensagem de erro
      const errorMsg = document.querySelector(
        '[role="alert"], .error, [data-error], .notification--error'
      );
      
      const hasError = !!errorMsg;
      const errorText = errorMsg?.textContent?.toLowerCase();
      const mentionsIA = errorText?.includes('ia') || 
                        errorText?.includes('gemini') ||
                        errorText?.includes('api') ||
                        errorText?.includes('conexão');
      
      return {
        hasError: hasError,
        errorText: errorMsg?.textContent?.trim(),
        mentionsIA: mentionsIA,
        passes: hasError && mentionsIA
      };
    }
```

#### 5. Verificar botão de retry
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const retryBtn = document.querySelector(
        '[data-retry], button:has-text("Tentar"), button:has-text("Retry")'
      );
      
      return {
        hasRetryButton: !!retryBtn,
        buttonText: retryBtn?.textContent?.trim(),
        isEnabled: retryBtn ? !retryBtn.disabled : false,
        passes: !!retryBtn && !retryBtn.disabled
      };
    }
```

#### 6. Verificar que app não travou
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Verificar se outros botões ainda funcionam
      const buttons = document.querySelectorAll('button:not([disabled])');
      const inputs = document.querySelectorAll('input:not([disabled])');
      
      return {
        activeButtons: buttons.length,
        activeInputs: inputs.length,
        appResponsive: buttons.length > 0,
        passes: buttons.length > 0
      };
    }
```

#### 7. Screenshot do erro
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ft-031-ai-error.png"
```

---

### FT-032: Erro ao renderizar vídeo

#### 8. Mock de projeto com cenas
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const project = {
        name: 'Teste Erro Render',
        scenes: [
          { id: '1', prompt: 'Cena teste', status: 'APPROVED' }
        ]
      };
      
      localStorage.setItem('currentProject', JSON.stringify(project));
      
      // Mock erro de renderização
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        
        if (typeof url === 'string' && url.includes('runway')) {
          return Promise.reject(new Error('RunwayML API Error: Quota exceeded'));
        }
        
        return originalFetch.apply(this, args);
      };
      
      return { mocked: true };
    }
```

#### 9. Tentar renderizar
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const renderBtn = document.querySelector(
        '[data-render], button:has-text("Renderizar")'
      );
      
      if (renderBtn) {
        renderBtn.click();
        return { clicked: true };
      }
      
      return { error: 'Botão renderizar não encontrado' };
    }
```

#### 10. Verificar mensagem de erro
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const errorMsg = document.querySelector('[role="alert"], .error');
      const errorText = errorMsg?.textContent?.toLowerCase();
      
      const mentionsRender = errorText?.includes('render') ||
                            errorText?.includes('vídeo') ||
                            errorText?.includes('video') ||
                            errorText?.includes('quota');
      
      return {
        hasError: !!errorMsg,
        errorText: errorMsg?.textContent?.trim(),
        mentionsRender: mentionsRender,
        passes: !!errorMsg && mentionsRender
      };
    }
```

#### 11. Verificar que cena não ficou em estado inválido
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const scene = document.querySelector('[data-scene]');
      const status = scene?.getAttribute('data-status') || 
                    scene?.querySelector('[data-scene-status]')?.textContent;
      
      // Status deve voltar para APPROVED ou ERROR, não ficar em RENDERING
      const validStatus = status !== 'RENDERING' && status !== 'PENDING';
      
      return {
        sceneStatus: status,
        isValidState: validStatus,
        passes: validStatus
      };
    }
```

---

### FT-033: Arquivo de áudio inválido

#### 12. Navegar para upload
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      window.location.hash = '#/';
      return { navigated: true };
    }
```

#### 13. Tentar upload de arquivo inválido
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const fileInput = document.querySelector('input[type="file"]');
      
      if (!fileInput) {
        return { error: 'Input de arquivo não encontrado' };
      }
      
      // Criar arquivo fake inválido (não é áudio)
      const invalidFile = new File(['fake content'], 'documento.pdf', {
        type: 'application/pdf'
      });
      
      // Simular upload
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(invalidFile);
      fileInput.files = dataTransfer.files;
      
      // Disparar evento
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      return { uploaded: true, fileName: 'documento.pdf' };
    }
```

#### 14. Verificar erro de validação
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const errorMsg = document.querySelector('[role="alert"], .error, [data-error]');
      const errorText = errorMsg?.textContent?.toLowerCase();
      
      const mentionsAudio = errorText?.includes('áudio') ||
                           errorText?.includes('audio') ||
                           errorText?.includes('mp3') ||
                           errorText?.includes('formato') ||
                           errorText?.includes('inválido');
      
      return {
        hasError: !!errorMsg,
        errorText: errorMsg?.textContent?.trim(),
        mentionsAudio: mentionsAudio,
        passes: !!errorMsg && mentionsAudio
      };
    }
```

#### 15. Verificar formatos aceitos mostrados
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const fileInput = document.querySelector('input[type="file"]');
      const accept = fileInput?.getAttribute('accept');
      
      const helperText = document.querySelector(
        '[data-helper-text], .help-text, .hint'
      );
      
      return {
        hasAcceptAttribute: !!accept,
        acceptValue: accept,
        hasHelperText: !!helperText,
        helperText: helperText?.textContent?.trim(),
        passes: !!accept || !!helperText
      };
    }
```

#### 16. Tentar arquivo muito grande
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const fileInput = document.querySelector('input[type="file"]');
      
      if (!fileInput) {
        return { error: 'Input não encontrado' };
      }
      
      // Criar arquivo fake muito grande (100MB)
      const hugeFile = new File(['x'.repeat(100 * 1024 * 1024)], 'huge.mp3', {
        type: 'audio/mpeg'
      });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(hugeFile);
      fileInput.files = dataTransfer.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      return { uploaded: true, size: '100MB' };
    }
```

#### 17. Verificar erro de tamanho
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const errorMsg = document.querySelector('[role="alert"], .error');
      const errorText = errorMsg?.textContent?.toLowerCase();
      
      const mentionsSize = errorText?.includes('tamanho') ||
                          errorText?.includes('grande') ||
                          errorText?.includes('size') ||
                          errorText?.includes('mb') ||
                          errorText?.includes('limite');
      
      return {
        hasError: !!errorMsg,
        errorText: errorMsg?.textContent?.trim(),
        mentionsSize: mentionsSize,
        passes: !!errorMsg && mentionsSize
      };
    }
```

---

### FT-034: Timeout em operação longa

#### 18. Mock de operação lenta
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Interceptar e adicionar delay
      const originalFetch = window.fetch;
      window.fetch = function(...args) {
        const url = args[0];
        
        // Simular operação muito lenta (30s)
        if (typeof url === 'string' && url.includes('generate')) {
          return new Promise((resolve, reject) => {
            setTimeout(() => {
              reject(new Error('Request timeout'));
            }, 30000);
          });
        }
        
        return originalFetch.apply(this, args);
      };
      
      return { mocked: true };
    }
```

#### 19. Iniciar operação
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const generateBtn = document.querySelector('[data-generate]');
      
      if (generateBtn) {
        generateBtn.click();
        return { started: true };
      }
      
      return { error: 'Botão não encontrado' };
    }
```

#### 20. Verificar indicador de loading
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const loading = document.querySelector(
        '[data-loading], .loading, .spinner, [role="progressbar"]'
      );
      
      return {
        hasLoading: !!loading,
        loadingVisible: loading ? window.getComputedStyle(loading).display !== 'none' : false,
        passes: !!loading
      };
    }
```

#### 21. Verificar botão de cancelar
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const cancelBtn = document.querySelector(
        '[data-cancel], button:has-text("Cancelar"), button:has-text("Cancel")'
      );
      
      return {
        hasCancelButton: !!cancelBtn,
        isEnabled: cancelBtn ? !cancelBtn.disabled : false,
        passes: !!cancelBtn && !cancelBtn.disabled
      };
    }
```

#### 22. Aguardar timeout (ou cancelar)
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      // Tentar cancelar
      const cancelBtn = document.querySelector('[data-cancel]');
      if (cancelBtn) {
        cancelBtn.click();
      }
      
      // Aguardar processamento
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verificar mensagem
      const errorMsg = document.querySelector('[role="alert"], .error');
      const infoMsg = document.querySelector('[role="status"]');
      
      const msg = errorMsg || infoMsg;
      const text = msg?.textContent?.toLowerCase();
      
      const mentionsTimeout = text?.includes('timeout') ||
                             text?.includes('tempo') ||
                             text?.includes('demorado') ||
                             text?.includes('cancel');
      
      return {
        hasMessage: !!msg,
        messageText: msg?.textContent?.trim(),
        mentionsTimeout: mentionsTimeout,
        passes: !!msg
      };
    }
```

#### 23. Screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ft-034-timeout.png"
```

---

## ✅ Critérios de Sucesso

**FT-031:**
- [ ] Erro da IA é capturado
- [ ] Mensagem de erro clara e específica
- [ ] Botão "Tentar novamente" disponível
- [ ] App continua responsivo

**FT-032:**
- [ ] Erro de renderização é tratado
- [ ] Mensagem menciona problema de vídeo
- [ ] Cena não fica em estado inválido
- [ ] Possível tentar novamente

**FT-033:**
- [ ] Arquivo inválido é rejeitado
- [ ] Erro mostra formato esperado
- [ ] Arquivo muito grande é rejeitado
- [ ] Limites são mostrados ao usuário

**FT-034:**
- [ ] Loading indicator é exibido
- [ ] Botão cancelar está disponível
- [ ] Timeout é tratado adequadamente
- [ ] Mensagem apropriada é mostrada

---

## ⏱️ Duração Esperada

- Total: ~3-4 minutos
- FT-031: 1 min
- FT-032: 1 min
- FT-033: 1 min
- FT-034: 1 min

---

## 🐛 Cenários de Falha Comuns

- **Erro não capturado:** Try-catch faltando
- **Mensagem genérica:** "Algo deu errado" sem detalhes
- **App trava:** Sem tratamento, congela UI
- **Estado inconsistente:** Cena fica "carregando" infinitamente
- **Sem retry:** Usuário forçado a recarregar página
- **Validação no backend:** Erro só aparece após upload

---

## 📊 Resultado Esperado

```json
{
  "test": "FT-031-034-Error-Handling",
  "status": "PASS",
  "duration": "3m 45s",
  "scenarios": {
    "FT-031": "PASS",
    "FT-032": "PASS",
    "FT-033": "PASS",
    "FT-034": "PASS"
  },
  "errorsHandled": 4,
  "userExperienceOk": true
}
```
