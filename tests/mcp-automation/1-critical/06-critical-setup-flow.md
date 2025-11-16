# 🎯 FT-001 a FT-007: Configuração do Projeto

**Categoria:** Functional - Critical  
**Tags:** `setup`, `critical`, `smoke`, `forms`, `validation`  
**Cenários BDD:** functional.robot FT-001 a FT-007

---

## 📋 Descrição

Testar configuração inicial do projeto:
- Acessar página inicial
- Preencher nome
- Validações
- Upload de áudio
- Navegação para próxima etapa

## 🎬 Passos para Executar com chrome-devtools MCP

### FT-001: Acessar página inicial

#### 1. Abrir aplicação
```
chrome-devtools-new_page
  url: http://localhost:3000
  timeout: 10000
```

#### 2. Aguardar carregamento
```
chrome-devtools-wait_for
  text: "DreamDirector AI"
  timeout: 10000
```

#### 3. Verificar stepper
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const stepper = document.querySelector('[aria-label="Progress"]');
      const steps = stepper?.querySelectorAll('[role="listitem"], .step, [data-step]');
      
      return {
        hasStepper: !!stepper,
        stepCount: steps?.length || 0,
        expectedSteps: 3,
        passes: steps?.length === 3
      };
    }
```

#### 4. Tirar screenshot inicial
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/screenshots/ft-001-initial.png"
```

---

### FT-002: Preencher nome do projeto

#### 5. Tirar snapshot para localizar input
```
chrome-devtools-take_snapshot
  verbose: false
```

#### 6. Preencher nome
```
chrome-devtools-fill
  uid: "projectName"
  value: "Meu Primeiro Vídeo"
```

#### 7. Validar preenchimento
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const input = document.querySelector('input[id="projectName"]');
      return {
        value: input?.value,
        expected: "Meu Primeiro Vídeo",
        passes: input?.value === "Meu Primeiro Vídeo"
      };
    }
```

---

### FT-003: Campo vazio desabilita botão

#### 8. Limpar campo
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const input = document.querySelector('input[id="projectName"]');
      if (input) {
        input.value = '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return { cleared: true };
    }
```

#### 9. Verificar botão desabilitado
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const buttons = document.querySelectorAll('button');
      let nextButton = null;
      
      for (const btn of buttons) {
        if (btn.textContent.includes('Próximo') || 
            btn.textContent.includes('Next')) {
          nextButton = btn;
          break;
        }
      }
      
      return {
        found: !!nextButton,
        disabled: nextButton?.disabled || nextButton?.hasAttribute('disabled'),
        passes: nextButton?.disabled === true
      };
    }
```

---

### FT-004: Nome preenchido habilita botão

#### 10. Preencher nome novamente
```
chrome-devtools-fill
  uid: "projectName"
  value: "Projeto Teste"
```

#### 11. Verificar botão habilitado
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const buttons = document.querySelectorAll('button');
      let nextButton = null;
      
      for (const btn of buttons) {
        if (btn.textContent.includes('Próximo') || 
            btn.textContent.includes('Next')) {
          nextButton = btn;
          break;
        }
      }
      
      return {
        found: !!nextButton,
        enabled: !nextButton?.disabled && !nextButton?.hasAttribute('disabled'),
        passes: !nextButton?.disabled
      };
    }
```

---

### FT-005: Upload de arquivo de áudio

#### 12. Localizar input de arquivo
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const fileInput = document.querySelector('input[type="file"]');
      return {
        found: !!fileInput,
        accept: fileInput?.accept || 'not specified',
        expectedAccept: 'audio/*,.mp3,.wav,.ogg'
      };
    }
```

#### 13. Simular upload (mock)
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      const fileInput = document.querySelector('input[type="file"]');
      
      if (!fileInput) {
        return { error: 'File input not found' };
      }
      
      // Criar arquivo mock
      const mockFile = new File(['audio content'], 'sample.mp3', { 
        type: 'audio/mpeg' 
      });
      
      // Criar DataTransfer
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(mockFile);
      
      // Atribuir ao input
      fileInput.files = dataTransfer.files;
      
      // Disparar eventos
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      return { 
        uploaded: true, 
        fileName: 'sample.mp3',
        fileType: 'audio/mpeg'
      };
    }
```

#### 14. Aguardar confirmação
```
chrome-devtools-wait_for
  text: "Áudio carregado"
  timeout: 5000
```

#### 15. Tirar screenshot do upload
```
chrome-devtools-take_screenshot
  fullPage: false
  format: "png"
  filePath: "tests/mcp-automation/screenshots/ft-005-upload.png"
```

---

### FT-006: Validar tipo de arquivo

#### 16. Tentar upload de arquivo inválido
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      const fileInput = document.querySelector('input[type="file"]');
      
      if (!fileInput) {
        return { error: 'File input not found' };
      }
      
      // Criar arquivo inválido (imagem)
      const invalidFile = new File(['image content'], 'imagem.png', { 
        type: 'image/png' 
      });
      
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(invalidFile);
      fileInput.files = dataTransfer.files;
      fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      
      // Aguardar erro aparecer
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Verificar mensagem de erro
      const alerts = document.querySelectorAll('[role="alert"]');
      const errorMessages = Array.from(alerts).map(a => a.textContent);
      
      return { 
        attempted: true,
        errorShown: errorMessages.length > 0,
        errors: errorMessages
      };
    }
```

#### 17. Verificar mensagem de erro
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const alerts = document.querySelectorAll('[role="alert"]');
      const hasAudioError = Array.from(alerts).some(a => 
        a.textContent.toLowerCase().includes('apenas') &&
        a.textContent.toLowerCase().includes('áudio')
      );
      
      return {
        hasError: alerts.length > 0,
        hasCorrectMessage: hasAudioError,
        passes: hasAudioError
      };
    }
```

---

### FT-007: Prosseguir para storyboard

#### 18. Garantir dados válidos
```
chrome-devtools-fill
  uid: "projectName"
  value: "Teste Navegação"
```

#### 19. Upload válido novamente
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const fileInput = document.querySelector('input[type="file"]');
      
      if (fileInput) {
        const mockFile = new File(['audio'], 'audio.mp3', { type: 'audio/mpeg' });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(mockFile);
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
      }
      
      return { ready: true };
    }
```

#### 20. Clicar em Próximo
```
chrome-devtools-click
  uid: "button-next"
```

#### 21. Aguardar página Storyboard
```
chrome-devtools-wait_for
  text: "Storyboard"
  timeout: 5000
```

#### 22. Verificar etapa atual
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const stepper = document.querySelector('[aria-label="Progress"]');
      const currentStep = stepper?.querySelector('[aria-current="step"], .active, [data-active="true"]');
      
      return {
        currentStepText: currentStep?.textContent?.trim(),
        isStoryboard: currentStep?.textContent?.toLowerCase().includes('storyboard'),
        passes: currentStep?.textContent?.toLowerCase().includes('storyboard')
      };
    }
```

#### 23. Screenshot final da configuração
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/screenshots/ft-007-storyboard.png"
```

---

## ✅ Critérios de Sucesso

**FT-001:**
- [ ] Página carrega com título "DreamDirector AI"
- [ ] Stepper mostra 3 etapas

**FT-002:**
- [ ] Campo nome aceita texto
- [ ] Valor é preservado

**FT-003:**
- [ ] Botão "Próximo" desabilitado quando nome vazio

**FT-004:**
- [ ] Botão "Próximo" habilitado quando nome preenchido

**FT-005:**
- [ ] Upload de áudio funciona
- [ ] Mensagem "Áudio carregado" aparece

**FT-006:**
- [ ] Arquivo não-áudio é rejeitado
- [ ] Mensagem de erro clara

**FT-007:**
- [ ] Navegação para Storyboard funciona
- [ ] Stepper indica etapa 2

---

## ⏱️ Duração Esperada

- Total: ~3-4 minutos
- FT-001: 30s
- FT-002: 20s
- FT-003: 20s
- FT-004: 20s
- FT-005: 40s
- FT-006: 30s
- FT-007: 30s

---

## 🐛 Cenários de Falha Comuns

- **Input não encontrado:** Selector errado
- **Botão não desabilita:** Validação não implementada
- **Upload não funciona:** DataTransfer mock não suportado
- **Navegação quebra:** Roteamento não configurado

---

## 📊 Resultado Esperado

```json
{
  "test": "FT-001-007-Setup",
  "status": "PASS",
  "duration": "3m 42s",
  "scenarios": {
    "FT-001": "PASS",
    "FT-002": "PASS",
    "FT-003": "PASS",
    "FT-004": "PASS",
    "FT-005": "PASS",
    "FT-006": "PASS",
    "FT-007": "PASS"
  }
}
```
