# 🎯 FT-021 a FT-026: Corte Final e Renderização

**Categoria:** Functional - Critical  
**Tags:** `finalcut`, `critical`, `ffmpeg`, `timeline`  
**Cenários BDD:** functional.robot FT-021 a FT-026

---

## 📋 Descrição

Testar página de Corte Final:
- Acessar página
- Timeline visual
- Reprodução sincronizada
- Renderização final com FFmpeg
- Download
- Amostra rápida

## 🎬 Passos para Executar com chrome-devtools MCP

### PRÉ-REQUISITO: Ter cenas renderizadas

#### 1. Setup com cenas renderizadas
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const mockProject = {
        name: 'Test Final Cut',
        scenes: [
          { id: '1', status: 'GENERATED', videoUrl: 'video1.mp4', duration: 45 },
          { id: '2', status: 'GENERATED', videoUrl: 'video2.mp4', duration: 40 },
          { id: '3', status: 'GENERATED', videoUrl: 'video3.mp4', duration: 50 },
          { id: '4', status: 'GENERATED', videoUrl: 'video4.mp4', duration: 42 },
          { id: '5', status: 'GENERATED', videoUrl: 'video5.mp4', duration: 38 }
        ],
        audioFile: 'audio.mp3',
        audioDuration: 215
      };
      
      localStorage.setItem('currentProject', JSON.stringify(mockProject));
      return { ready: true };
    }
```

---

### FT-021: Acessar página de corte final

#### 2. Abrir aplicação
```
chrome-devtools-new_page
  url: http://localhost:3000
  timeout: 10000
```

#### 3. Navegar para Corte Final
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Clicar no botão "Ir para Corte Final"
      const finalCutBtn = document.querySelector('[data-go-to-final-cut], button[aria-label*="Corte Final"]');
      
      if (finalCutBtn) {
        finalCutBtn.click();
        return { navigated: true };
      }
      
      // Ou navegar diretamente
      window.location.hash = '#/final-cut';
      return { navigated: true, method: 'direct' };
    }
```

#### 4. Aguardar carregamento
```
chrome-devtools-wait_for
  text: "Corte Final"
  timeout: 5000
```

#### 5. Verificar estrutura da página
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const timeline = document.querySelector('[data-timeline], .timeline');
      const videoPlayers = document.querySelectorAll('video');
      const audioPlayer = document.querySelector('audio');
      const renderBtn = document.querySelector('[data-render-final], button[aria-label*="Renderizar"]');
      
      return {
        hasTimeline: !!timeline,
        videoCount: videoPlayers.length,
        hasAudio: !!audioPlayer,
        hasRenderButton: !!renderBtn,
        passes: !!timeline && videoPlayers.length >= 5 && !!audioPlayer
      };
    }
```

#### 6. Verificar preview de todas as cenas
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const scenePreviews = document.querySelectorAll('[data-scene-preview], .scene-preview');
      const previews = [];
      
      for (const preview of scenePreviews) {
        const video = preview.querySelector('video');
        const duration = preview.querySelector('[data-duration]');
        
        previews.push({
          hasVideo: !!video,
          duration: duration?.textContent,
          src: video?.src?.substring(0, 30)
        });
      }
      
      return {
        previewCount: scenePreviews.length,
        previews: previews,
        allHaveVideo: previews.every(p => p.hasVideo)
      };
    }
```

#### 7. Tirar screenshot da página
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/screenshots/ft-021-final-cut-page.png"
```

---

### FT-022: Reprodução sincronizada de vídeos

#### 8. Localizar controles de reprodução
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const playBtn = document.querySelector('[data-play], button[aria-label*="Play"]');
      const pauseBtn = document.querySelector('[data-pause], button[aria-label*="Pause"]');
      const audio = document.querySelector('audio');
      
      return {
        hasPlayButton: !!playBtn,
        hasPauseButton: !!pauseBtn,
        hasAudio: !!audio,
        audioSrc: audio?.src?.substring(0, 50)
      };
    }
```

#### 9. Iniciar reprodução
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      const playBtn = document.querySelector('[data-play], button[aria-label*="Play"]');
      const audio = document.querySelector('audio');
      
      if (!playBtn || !audio) {
        return { error: 'Controls not found' };
      }
      
      // Clicar no play
      playBtn.click();
      
      // Aguardar um pouco
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return {
        playing: !audio.paused,
        currentTime: audio.currentTime,
        duration: audio.duration
      };
    }
```

#### 10. Verificar sincronização de vídeos
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const audio = document.querySelector('audio');
      const videos = document.querySelectorAll('video');
      const currentTime = audio?.currentTime || 0;
      
      // Calcular qual vídeo deveria estar ativo
      let cumulativeDuration = 0;
      let activeVideoIndex = 0;
      
      const sceneDurations = [45, 40, 50, 42, 38]; // Durações mock
      
      for (let i = 0; i < sceneDurations.length; i++) {
        if (currentTime >= cumulativeDuration && 
            currentTime < cumulativeDuration + sceneDurations[i]) {
          activeVideoIndex = i;
          break;
        }
        cumulativeDuration += sceneDurations[i];
      }
      
      // Verificar se vídeo correto está tocando
      const activeVideo = videos[activeVideoIndex];
      
      return {
        audioTime: currentTime,
        expectedActiveIndex: activeVideoIndex,
        activeVideoPlaying: activeVideo ? !activeVideo.paused : false,
        synchronized: !!activeVideo && !activeVideo.paused
      };
    }
```

#### 11. Testar transição entre cenas
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      const audio = document.querySelector('audio');
      
      if (!audio) {
        return { error: 'Audio not found' };
      }
      
      // Pular para perto do final da primeira cena (44s)
      audio.currentTime = 44;
      
      // Aguardar transição
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const currentTime = audio.currentTime;
      const videos = document.querySelectorAll('video');
      
      // Verificar se mudou para segunda cena
      const firstVideoPlaying = videos[0] && !videos[0].paused;
      const secondVideoPlaying = videos[1] && !videos[1].paused;
      
      return {
        timeAfterTransition: currentTime,
        firstVideoPlaying: firstVideoPlaying,
        secondVideoPlaying: secondVideoPlaying,
        transitionedCorrectly: !firstVideoPlaying && secondVideoPlaying
      };
    }
```

---

### FT-023: Navegação na timeline

#### 12. Verificar timeline visual
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const timeline = document.querySelector('[data-timeline], .timeline');
      const markers = timeline?.querySelectorAll('[data-scene-marker], .scene-marker');
      const progressBar = timeline?.querySelector('[data-progress], .progress');
      
      return {
        hasTimeline: !!timeline,
        markerCount: markers?.length || 0,
        hasProgressBar: !!progressBar,
        passes: !!timeline && (markers?.length || 0) >= 5
      };
    }
```

#### 13. Clicar em ponto específico da timeline
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      const timeline = document.querySelector('[data-timeline], .timeline');
      const audio = document.querySelector('audio');
      
      if (!timeline || !audio) {
        return { error: 'Timeline or audio not found' };
      }
      
      // Simular click no meio da timeline (50%)
      const rect = timeline.getBoundingClientRect();
      const clickX = rect.left + (rect.width * 0.5);
      const clickY = rect.top + (rect.height * 0.5);
      
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        clientX: clickX,
        clientY: clickY
      });
      
      timeline.dispatchEvent(clickEvent);
      
      // Aguardar atualização
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newTime = audio.currentTime;
      const totalDuration = audio.duration;
      const expectedTime = totalDuration * 0.5;
      const difference = Math.abs(newTime - expectedTime);
      
      return {
        newTime: newTime,
        expectedTime: expectedTime,
        difference: difference,
        jumpedCorrectly: difference < 5 // Tolerância de 5 segundos
      };
    }
```

#### 14. Verificar cena correta após salto
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const audio = document.querySelector('audio');
      const videos = document.querySelectorAll('video');
      const currentTime = audio?.currentTime || 0;
      
      // Identificar cena ativa
      let activeScene = 0;
      let cumulative = 0;
      const durations = [45, 40, 50, 42, 38];
      
      for (let i = 0; i < durations.length; i++) {
        if (currentTime >= cumulative && currentTime < cumulative + durations[i]) {
          activeScene = i;
          break;
        }
        cumulative += durations[i];
      }
      
      return {
        currentTime: currentTime,
        activeScene: activeScene + 1,
        totalScenes: videos.length,
        passes: activeScene >= 0 && activeScene < videos.length
      };
    }
```

---

### FT-024: Renderizar vídeo final com FFmpeg

#### 15. Clicar em "Renderizar Vídeo Final"
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const renderBtn = document.querySelector('[data-render-final], button[aria-label*="Renderizar"]');
      
      if (renderBtn) {
        renderBtn.click();
        return { clicked: true };
      }
      
      return { clicked: false, error: 'Render button not found' };
    }
```

#### 16. Verificar progresso de renderização
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const progressBar = document.querySelector('[data-render-progress], progress');
      const progressText = document.querySelector('[data-progress-percentage]');
      const statusText = document.querySelector('[data-render-status]');
      
      return {
        hasProgress: !!progressBar,
        percentage: progressText?.textContent,
        status: statusText?.textContent,
        isRendering: !!progressBar && progressBar.value < 100
      };
    }
```

#### 17. Aguardar renderização (MUITO LONGO - 5-10 min)
```
chrome-devtools-wait_for
  text: "Vídeo final pronto"
  timeout: 600000
```

#### 18. Verificar vídeo final gerado
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const finalVideo = document.querySelector('[data-final-video], video.final-video');
      const downloadBtn = document.querySelector('[data-download-final], button[aria-label*="Baixar"]');
      
      return {
        videoGenerated: !!finalVideo,
        videoSrc: finalVideo?.src?.substring(0, 50),
        videoDuration: finalVideo?.duration,
        canDownload: !!downloadBtn,
        passes: !!finalVideo && !!downloadBtn
      };
    }
```

#### 19. Validar sistema usando FFmpeg
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Verificar se há evidências de FFmpeg no console
      const logs = [];
      
      // Verificar localStorage para metadados de renderização
      const renderInfo = localStorage.getItem('lastRender');
      
      return {
        renderInfo: renderInfo ? JSON.parse(renderInfo) : null,
        usedFFmpeg: renderInfo ? renderInfo.includes('ffmpeg') : false,
        message: 'Verificação de FFmpeg via logs/metadata'
      };
    }
```

---

### FT-025: Download de vídeo final

#### 20. Clicar em "Baixar"
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const downloadBtn = document.querySelector('[data-download-final], button[aria-label*="Baixar"]');
      
      if (downloadBtn) {
        downloadBtn.click();
        return { clicked: true };
      }
      
      return { clicked: false, error: 'Download button not found' };
    }
```

#### 21. Verificar requisições de download
```
chrome-devtools-list_network_requests
  resourceTypes: ["media", "xhr", "fetch"]
  pageSize: 30
```

#### 22. Validar arquivo baixado
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Verificar links de download criados
      const downloadLinks = document.querySelectorAll('a[download]');
      const videoDownloads = Array.from(downloadLinks).filter(
        link => link.download.endsWith('.mp4')
      );
      
      const finalDownload = videoDownloads.find(
        link => link.download.includes('DreamDirector') || 
                link.download.includes('final')
      );
      
      return {
        hasDownloadLinks: downloadLinks.length > 0,
        videoDownloadCount: videoDownloads.length,
        finalDownload: finalDownload ? {
          filename: finalDownload.download,
          href: finalDownload.href.substring(0, 50)
        } : null,
        passes: !!finalDownload
      };
    }
```

#### 23. Validar tamanho e formato
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      const finalVideo = document.querySelector('[data-final-video], video.final-video');
      
      if (!finalVideo) {
        return { error: 'Final video not found' };
      }
      
      // Tentar obter tamanho do arquivo via fetch HEAD
      try {
        const response = await fetch(finalVideo.src, { method: 'HEAD' });
        const contentLength = response.headers.get('content-length');
        const contentType = response.headers.get('content-type');
        
        const sizeMB = contentLength ? (parseInt(contentLength) / 1024 / 1024).toFixed(2) : 'unknown';
        
        return {
          size: `${sizeMB} MB`,
          contentType: contentType,
          expectedSize: '~10 MB',
          sizeOk: sizeMB > 5 && sizeMB < 50,
          formatOk: contentType === 'video/mp4'
        };
      } catch (err) {
        return { error: err.message };
      }
    }
```

---

### FT-026: Ver amostra rápida (5s por cena)

#### 24. Clicar em "Ver Amostra (5s)"
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const sampleBtn = document.querySelector('[data-sample-preview], button[aria-label*="Amostra"]');
      
      if (sampleBtn) {
        sampleBtn.click();
        return { clicked: true };
      }
      
      return { clicked: false, error: 'Sample button not found' };
    }
```

#### 25. Verificar renderização de amostra
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const sampleProgress = document.querySelector('[data-sample-progress]');
      const sampleStatus = document.querySelector('[data-sample-status]');
      
      return {
        isRendering: !!sampleProgress,
        status: sampleStatus?.textContent,
        message: 'Renderizando amostra com 5s de cada cena'
      };
    }
```

#### 26. Aguardar amostra (deve ser rápido < 2 min)
```
chrome-devtools-wait_for
  text: "Amostra pronta"
  timeout: 120000
```

#### 27. Validar duração da amostra
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const sampleVideo = document.querySelector('[data-sample-video], video.sample');
      
      if (!sampleVideo) {
        return { error: 'Sample video not found' };
      }
      
      const expectedDuration = 5 * 5; // 5 cenas x 5 segundos
      const actualDuration = sampleVideo.duration;
      const difference = Math.abs(actualDuration - expectedDuration);
      
      return {
        expectedDuration: expectedDuration,
        actualDuration: actualDuration,
        difference: difference,
        passes: difference < 3, // Tolerância de 3 segundos
        message: 'Amostra deve ter ~25 segundos'
      };
    }
```

#### 28. Reproduzir amostra
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      const sampleVideo = document.querySelector('[data-sample-video], video.sample');
      
      if (!sampleVideo) {
        return { error: 'Sample video not found' };
      }
      
      try {
        await sampleVideo.play();
        
        // Aguardar um pouco
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        return {
          playing: !sampleVideo.paused,
          currentTime: sampleVideo.currentTime,
          duration: sampleVideo.duration,
          passes: !sampleVideo.paused
        };
      } catch (err) {
        return { error: err.message };
      }
    }
```

#### 29. Screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/screenshots/ft-026-sample-ready.png"
```

---

## ✅ Critérios de Sucesso

**FT-021:**
- [ ] Página Corte Final carrega
- [ ] Timeline visual presente
- [ ] Preview de todas as cenas
- [ ] Controles de reprodução

**FT-022:**
- [ ] Áudio reproduz
- [ ] Vídeo correto sincronizado
- [ ] Transições suaves entre cenas

**FT-023:**
- [ ] Timeline clicável
- [ ] Salto para tempo correto
- [ ] Cena correta após salto

**FT-024:**
- [ ] Renderização inicia
- [ ] Progresso visível
- [ ] Vídeo final gerado
- [ ] FFmpeg usado

**FT-025:**
- [ ] Download inicia
- [ ] Arquivo MP4
- [ ] Nome "DreamDirector..."
- [ ] Tamanho ~10 MB

**FT-026:**
- [ ] Amostra renderiza rápido
- [ ] Duração ~25s (5 cenas x 5s)
- [ ] Reproduz corretamente

---

## ⏱️ Duração Esperada

- Total: ~10-15 minutos (+ renderização)
- FT-021: 1 min
- FT-022: 2 min
- FT-023: 1 min
- FT-024: 5-10 min (renderização FFmpeg)
- FT-025: 1 min
- FT-026: 2 min (renderização amostra)

---

## 🐛 Cenários de Falha Comuns

- **Timeline não sincroniza:** Cálculo de duração errado
- **FFmpeg timeout:** Vídeo muito longo
- **Download falha:** CORS ou blob URL inválida
- **Amostra demora:** FFmpeg não otimizado
- **Transições quebradas:** Eventos não disparados

---

## 📊 Resultado Esperado

```json
{
  "test": "FT-021-026-Final-Cut",
  "status": "PASS",
  "duration": "12m 45s",
  "scenarios": {
    "FT-021": "PASS",
    "FT-022": "PASS",
    "FT-023": "PASS",
    "FT-024": "PASS",
    "FT-025": "PASS",
    "FT-026": "PASS"
  },
  "renderTime": "8m 20s",
  "sampleTime": "1m 35s",
  "finalVideoSize": "11.2 MB"
}
```
