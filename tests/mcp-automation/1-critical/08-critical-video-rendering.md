# 🎯 FT-016 a FT-020: Renderização de Vídeos

**Categoria:** Functional - Critical  
**Tags:** `rendering`, `ai`, `critical`, `video`  
**Cenários BDD:** functional.robot FT-016 a FT-020

---

## 📋 Descrição

Testar renderização de vídeos com RunwayML:
- Gerar vídeo da cena
- Player de vídeo
- Controles
- Timing/sincronização
- Download

## 🎬 Passos para Executar com chrome-devtools MCP

### PRÉ-REQUISITO: Ter cenas aprovadas

#### 1. Setup com cena aprovada
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Simular projeto com cena aprovada
      const mockProject = {
        name: 'Test Rendering',
        scenes: [
          {
            id: '1',
            prompt: 'A beautiful sunset over mountains',
            status: 'APPROVED',
            videoUrl: null
          }
        ]
      };
      
      localStorage.setItem('currentProject', JSON.stringify(mockProject));
      window.location.hash = '#/storyboard';
      
      return { ready: true };
    }
```

---

### FT-016: Renderizar vídeo da cena aprovada

#### 2. Aguardar storyboard
```
chrome-devtools-wait_for
  text: "Storyboard"
  timeout: 5000
```

#### 3. Clicar em "Gerar Vídeo"
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const approvedScene = document.querySelector('[data-status="APPROVED"], .scene-card.approved');
      const generateBtn = approvedScene?.querySelector('[data-generate-video], button[aria-label*="Gerar Vídeo"]');
      
      if (generateBtn) {
        generateBtn.click();
        return { clicked: true };
      }
      
      return { clicked: false, error: 'Generate button not found' };
    }
```

#### 4. Verificar progresso de renderização
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const progressBar = document.querySelector('[data-render-progress], progress, [role="progressbar"]');
      const progressText = document.querySelector('[data-progress-text]');
      
      return {
        hasProgress: !!progressBar,
        progressValue: progressBar?.value || progressBar?.getAttribute('aria-valuenow'),
        progressText: progressText?.textContent,
        isRendering: !!progressBar
      };
    }
```

#### 5. Aguardar renderização (LONGO - 2-3 min por cena)
```
chrome-devtools-wait_for
  text: "Vídeo gerado"
  timeout: 180000
```

#### 6. Verificar status final
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const scene = document.querySelector('[data-scene-card]');
      const status = scene?.getAttribute('data-status');
      const videoElement = scene?.querySelector('video');
      const videoUrl = videoElement?.src;
      
      return {
        status: status,
        hasVideo: !!videoElement,
        videoUrl: videoUrl?.substring(0, 50),
        passes: status === 'GENERATED' && !!videoElement
      };
    }
```

#### 7. Screenshot do vídeo gerado
```
chrome-devtools-take_screenshot
  fullPage: false
  format: "png"
  filePath: "tests/mcp-automation/screenshots/ft-016-video-generated.png"
```

---

### FT-017: Visualizar vídeo gerado

#### 8. Localizar player de vídeo
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const video = document.querySelector('video');
      
      if (!video) {
        return { error: 'Video element not found' };
      }
      
      return {
        found: true,
        src: video.src?.substring(0, 50),
        duration: video.duration,
        paused: video.paused,
        hasControls: video.hasAttribute('controls')
      };
    }
```

#### 9. Clicar em Play
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      const video = document.querySelector('video');
      
      if (!video) {
        return { error: 'Video not found' };
      }
      
      try {
        await video.play();
        
        return {
          playing: !video.paused,
          currentTime: video.currentTime,
          duration: video.duration
        };
      } catch (err) {
        return { error: err.message };
      }
    }
```

#### 10. Testar pause
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const video = document.querySelector('video');
      
      if (video) {
        video.pause();
        
        return {
          paused: video.paused,
          currentTime: video.currentTime
        };
      }
      
      return { error: 'Video not found' };
    }
```

#### 11. Testar seek (mover timeline)
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const video = document.querySelector('video');
      
      if (video && video.duration > 0) {
        const midPoint = video.duration / 2;
        video.currentTime = midPoint;
        
        return {
          seeked: true,
          newTime: video.currentTime,
          duration: video.duration
        };
      }
      
      return { error: 'Cannot seek' };
    }
```

---

### FT-018: Controles do player de vídeo

#### 12. Testar volume
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const video = document.querySelector('video');
      
      if (!video) {
        return { error: 'Video not found' };
      }
      
      // Testar vários níveis
      const tests = [];
      
      video.volume = 0.5;
      tests.push({ level: 0.5, set: video.volume === 0.5 });
      
      video.volume = 0;
      tests.push({ level: 0, set: video.volume === 0 });
      
      video.volume = 1;
      tests.push({ level: 1, set: video.volume === 1 });
      
      return {
        volumeTests: tests,
        passes: tests.every(t => t.set)
      };
    }
```

#### 13. Testar fullscreen
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      const video = document.querySelector('video');
      
      if (!video) {
        return { error: 'Video not found' };
      }
      
      const supportsFullscreen = 
        document.fullscreenEnabled ||
        document.webkitFullscreenEnabled;
      
      if (supportsFullscreen) {
        try {
          if (video.requestFullscreen) {
            await video.requestFullscreen();
          } else if (video.webkitRequestFullscreen) {
            await video.webkitRequestFullscreen();
          }
          
          return { 
            fullscreenSupported: true,
            entered: !!document.fullscreenElement
          };
        } catch (err) {
          return { 
            fullscreenSupported: true, 
            error: err.message 
          };
        }
      }
      
      return { 
        fullscreenSupported: false,
        message: 'Fullscreen not available in test environment'
      };
    }
```

#### 14. Testar velocidade de reprodução
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const video = document.querySelector('video');
      
      if (!video) {
        return { error: 'Video not found' };
      }
      
      const speeds = [0.5, 1, 1.5, 2];
      const tests = [];
      
      for (const speed of speeds) {
        video.playbackRate = speed;
        tests.push({
          speed: speed,
          set: video.playbackRate === speed
        });
      }
      
      return {
        playbackTests: tests,
        passes: tests.every(t => t.set)
      };
    }
```

---

### FT-019: Timing automático de cenas

#### 15. Verificar múltiplas cenas
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const scenes = document.querySelectorAll('[data-scene-card]');
      const videoData = [];
      
      for (const scene of scenes) {
        const video = scene.querySelector('video');
        const duration = video?.duration || 0;
        
        videoData.push({
          sceneId: scene.getAttribute('data-scene-id'),
          duration: duration,
          status: scene.getAttribute('data-status')
        });
      }
      
      const totalDuration = videoData.reduce((sum, v) => sum + v.duration, 0);
      
      return {
        sceneCount: scenes.length,
        videos: videoData,
        totalDuration: totalDuration,
        avgDuration: totalDuration / scenes.length
      };
    }
```

#### 16. Verificar sincronização com áudio
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const audio = document.querySelector('audio');
      const videos = document.querySelectorAll('video');
      
      const audioDuration = audio?.duration || 0;
      const totalVideoDuration = Array.from(videos).reduce(
        (sum, v) => sum + (v.duration || 0), 0
      );
      
      const difference = Math.abs(audioDuration - totalVideoDuration);
      const isClose = difference < 5; // 5 segundos de tolerância
      
      return {
        audioDuration: audioDuration,
        videoDuration: totalVideoDuration,
        difference: difference,
        synchronized: isClose,
        passes: isClose
      };
    }
```

---

### FT-020: Download de vídeo gerado

#### 17. Clicar em "Baixar Vídeo"
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const downloadBtn = document.querySelector('[data-download-video], button[aria-label*="Baixar"]');
      
      if (downloadBtn) {
        downloadBtn.click();
        return { clicked: true };
      }
      
      return { clicked: false, error: 'Download button not found' };
    }
```

#### 18. Verificar requisição de download
```
chrome-devtools-list_network_requests
  resourceTypes: ["media", "xhr", "fetch"]
  pageSize: 20
```

#### 19. Validar nome do arquivo
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Verificar link de download criado
      const downloadLinks = document.querySelectorAll('a[download]');
      const videoDownloads = Array.from(downloadLinks).filter(
        link => link.download.includes('DreamDirector') || 
                link.download.endsWith('.mp4')
      );
      
      return {
        hasDownloadLinks: downloadLinks.length > 0,
        videoDownloads: videoDownloads.map(l => ({
          filename: l.download,
          href: l.href.substring(0, 50)
        })),
        correctNaming: videoDownloads.some(l => l.download.includes('DreamDirector'))
      };
    }
```

#### 20. Screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/screenshots/ft-020-download-ready.png"
```

---

## ✅ Critérios de Sucesso

**FT-016:**
- [ ] Progresso de renderização visível
- [ ] Vídeo gerado com sucesso
- [ ] Status muda para "GENERATED"

**FT-017:**
- [ ] Vídeo pode reproduzir
- [ ] Pause funciona
- [ ] Seek (timeline) funciona

**FT-018:**
- [ ] Volume ajusta (0, 0.5, 1)
- [ ] Fullscreen disponível
- [ ] Velocidade ajusta (0.5x, 1x, 1.5x, 2x)

**FT-019:**
- [ ] Duração total próxima ao áudio (±5s)
- [ ] Cenas sincronizadas

**FT-020:**
- [ ] Download inicia
- [ ] Arquivo tem nome "DreamDirector..."
- [ ] Formato MP4

---

## ⏱️ Duração Esperada

- Total: ~5-8 minutos (+ tempo de renderização)
- FT-016: 2-3min (renderização)
- FT-017: 1min
- FT-018: 1min
- FT-019: 30s
- FT-020: 30s

---

## 🐛 Cenários de Falha Comuns

- **Renderização timeout:** RunwayML API lenta
- **Vídeo não carrega:** URL inválida
- **Player não funciona:** Codec não suportado
- **Download falha:** CORS ou permissões
- **Timing errado:** Cálculo de duração incorreto

---

## 📊 Resultado Esperado

```json
{
  "test": "FT-016-020-Video-Rendering",
  "status": "PASS",
  "duration": "6m 42s",
  "scenarios": {
    "FT-016": "PASS",
    "FT-017": "PASS",
    "FT-018": "PASS",
    "FT-019": "PASS",
    "FT-020": "PASS"
  },
  "renderTime": "2m 35s",
  "videoDuration": "45s",
  "downloadReady": true
}
```
