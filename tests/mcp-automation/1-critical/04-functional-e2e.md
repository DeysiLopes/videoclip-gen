# 🎯 FT-027: Fluxo Completo E2E - Criar Vídeo

**Categoria:** Functional - Critical  
**Tags:** `e2e`, `critical`, `workflow`  
**Cenário BDD:** functional.robot FT-027

---

## 📋 Descrição

Testar o fluxo completo de criação de vídeo:
1. Configurar projeto
2. Gerar cenas com IA
3. Aprovar e renderizar
4. Corte final
5. Download

## 🎬 Passos para Executar com chrome-devtools MCP

### FASE 1: SETUP DO PROJETO

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

#### 3. Tirar snapshot inicial
```
chrome-devtools-take_snapshot
  verbose: false
```

#### 4. Preencher nome do projeto
```
chrome-devtools-fill
  uid: "input-projectName"
  value: "Meu Vídeo E2E Test"
```

#### 5. Fazer upload de áudio (simulação)
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Simular upload de áudio
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) {
        // Criar evento de mudança simulado
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
        
        return { uploadSimulated: true };
      }
      return { uploadSimulated: false, error: 'File input not found' };
    }
```

#### 6. Aguardar confirmação de upload
```
chrome-devtools-wait_for
  text: "Áudio carregado"
  timeout: 5000
```

#### 7. Clicar em "Próximo"
```
chrome-devtools-click
  uid: "button-next-step"
```

---

### FASE 2: GERAÇÃO DE CENAS

#### 8. Aguardar página Storyboard
```
chrome-devtools-wait_for
  text: "Storyboard"
  timeout: 5000
```

#### 9. Preencher descrição do projeto
```
chrome-devtools-fill
  uid: "textarea-description"
  value: "Um videoclipe inspirador sobre a jornada da transformação pessoal e superação"
```

#### 10. Clicar em "Gerar Cenas"
```
chrome-devtools-click
  uid: "button-generate-scenes"
```

#### 11. Aguardar geração (AI)
```
chrome-devtools-wait_for
  text: "Cenas geradas"
  timeout: 30000
```

#### 12. Verificar quantidade de cenas
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const scenes = document.querySelectorAll('[data-scene-card]');
      return {
        sceneCount: scenes.length,
        expectedCount: 5,
        pass: scenes.length >= 5
      };
    }
```

#### 13. Aprovar todas as cenas
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const approveButtons = document.querySelectorAll('[data-approve-scene]');
      approveButtons.forEach(btn => btn.click());
      
      return {
        approved: approveButtons.length,
        success: true
      };
    }
```

#### 14. Tirar screenshot das cenas aprovadas
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
```

---

### FASE 3: RENDERIZAÇÃO

#### 15. Renderizar todas as cenas
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const renderButtons = document.querySelectorAll('[data-render-scene]');
      renderButtons.forEach(btn => btn.click());
      
      return {
        rendering: renderButtons.length
      };
    }
```

#### 16. Aguardar renderização (longo)
```
chrome-devtools-wait_for
  text: "Vídeos gerados"
  timeout: 120000
```

#### 17. Verificar status de renderização
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const scenes = document.querySelectorAll('[data-scene-card]');
      const statuses = [];
      
      for (const scene of scenes) {
        const status = scene.getAttribute('data-status');
        statuses.push(status);
      }
      
      return {
        total: statuses.length,
        generated: statuses.filter(s => s === 'GENERATED').length,
        allGenerated: statuses.every(s => s === 'GENERATED')
      };
    }
```

---

### FASE 4: CORTE FINAL

#### 18. Ir para Corte Final
```
chrome-devtools-click
  uid: "button-go-to-final-cut"
```

#### 19. Aguardar página de Corte Final
```
chrome-devtools-wait_for
  text: "Corte Final"
  timeout: 5000
```

#### 20. Verificar timeline visual
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const timeline = document.querySelector('[data-timeline]');
      const videoPlayers = document.querySelectorAll('video');
      
      return {
        hasTimeline: !!timeline,
        videoCount: videoPlayers.length,
        ready: !!timeline && videoPlayers.length >= 5
      };
    }
```

#### 21. Testar reprodução
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const audio = document.querySelector('audio');
      if (audio) {
        audio.play();
        return { playing: true, duration: audio.duration };
      }
      return { playing: false, error: 'Audio not found' };
    }
```

#### 22. Renderizar vídeo final
```
chrome-devtools-click
  uid: "button-render-final"
```

#### 23. Aguardar renderização final (muito longo)
```
chrome-devtools-wait_for
  text: "Vídeo final pronto"
  timeout: 300000
```

#### 24. Verificar progresso de renderização
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const progress = document.querySelector('[data-render-progress]');
      if (progress) {
        return {
          percentage: progress.textContent,
          complete: progress.textContent.includes('100%')
        };
      }
      return { progress: 'unknown' };
    }
```

---

### FASE 5: DOWNLOAD

#### 25. Clicar em Download
```
chrome-devtools-click
  uid: "button-download-final"
```

#### 26. Verificar requisição de download
```
chrome-devtools-list_network_requests
  resourceTypes: ["media", "other"]
  pageSize: 10
```

#### 27. Tirar screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
```

#### 28. Validar armazenamento local
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const projects = localStorage.getItem('projects');
      const currentProject = localStorage.getItem('currentProject');
      
      return {
        hasProjects: !!projects,
        hasCurrentProject: !!currentProject,
        projectCount: projects ? JSON.parse(projects).length : 0
      };
    }
```

---

## ✅ Critérios de Sucesso

- [ ] Projeto criado com sucesso
- [ ] 5 cenas geradas pela IA
- [ ] Todas as cenas aprovadas
- [ ] Todas as cenas renderizadas
- [ ] Vídeo final gerado com sucesso
- [ ] Download disponível
- [ ] Projeto salvo no localStorage

---

## ⏱️ Timeouts Esperados

- Setup: ~5 segundos
- Geração de cenas (IA): ~30 segundos
- Renderização de cenas: ~2 minutos por cena
- Renderização final (FFmpeg): ~5 minutos
- **Total E2E: ~15-20 minutos**

---

## 🐛 Cenários de Falha Comuns

- **IA timeout:** Gemini API demora demais
- **Renderização falha:** FFmpeg não disponível
- **Upload falha:** Arquivo de áudio inválido
- **Storage cheio:** localStorage atingiu limite
- **Network error:** Backend não responde

---

## 📊 Resultado Esperado

```json
{
  "test": "FT-027-E2E",
  "status": "PASS",
  "duration": "18m 32s",
  "phases": {
    "setup": "PASS",
    "sceneGeneration": "PASS",
    "rendering": "PASS",
    "finalCut": "PASS",
    "download": "PASS"
  },
  "sceneCount": 5,
  "finalVideoDuration": "3m 45s",
  "fileSize": "12.3 MB"
}
```
