# 🎯 FT-035 a FT-040: Performance e UX

**Categoria:** Functional - Important  
**Tags:** `performance`, `ux`, `important`, `usability`  
**Cenários BDD:** functional.robot FT-035 a FT-040

---

## 📋 Descrição

Testar performance e experiência do usuário:
- Tempo de carregamento
- UI não trava durante operações
- Design responsivo
- Dark mode
- Confirmações de ações destrutivas
- Feedback visual de progresso

## 🎬 Passos para Executar com chrome-devtools MCP

### FT-035: Página carrega em tempo razoável

#### 1. Medir tempo de carregamento
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Capturar timing do navegador
      const perfData = window.performance.timing;
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;
      const domReady = perfData.domContentLoadedEventEnd - perfData.navigationStart;
      
      return {
        loadTime: loadTime,
        domReady: domReady,
        loadTimeSeconds: (loadTime / 1000).toFixed(2),
        domReadySeconds: (domReady / 1000).toFixed(2),
        passes: loadTime < 3000 // < 3 segundos
      };
    }
```

#### 2. Abrir aplicação com medição
```
chrome-devtools-new_page
  url: http://localhost:3000
  timeout: 10000
```

#### 3. Verificar se elementos principais carregaram
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const startTime = performance.now();
      
      // Elementos críticos que devem estar presentes
      const header = document.querySelector('header, [role="banner"]');
      const main = document.querySelector('main, [role="main"]');
      const nav = document.querySelector('nav, [role="navigation"]');
      
      const endTime = performance.now();
      const renderTime = endTime - startTime;
      
      return {
        hasHeader: !!header,
        hasMain: !!main,
        hasNav: !!nav,
        renderTime: renderTime.toFixed(2) + 'ms',
        allLoaded: !!header && !!main,
        passes: !!header && !!main
      };
    }
```

#### 4. Verificar recursos carregados
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const resources = performance.getEntriesByType('resource');
      
      const css = resources.filter(r => r.name.includes('.css'));
      const js = resources.filter(r => r.name.includes('.js'));
      const images = resources.filter(r => 
        r.name.includes('.png') || 
        r.name.includes('.jpg') || 
        r.name.includes('.svg')
      );
      
      // Recursos muito grandes (> 1MB)
      const largeResources = resources.filter(r => r.transferSize > 1024 * 1024);
      
      return {
        totalResources: resources.length,
        cssFiles: css.length,
        jsFiles: js.length,
        images: images.length,
        largeResources: largeResources.length,
        largeResourcesList: largeResources.map(r => ({
          name: r.name.split('/').pop(),
          size: (r.transferSize / 1024 / 1024).toFixed(2) + ' MB'
        }))
      };
    }
```

---

### FT-036: UI não trava durante operações longas

#### 5. Iniciar operação longa (renderização mock)
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Simular operação longa
      let counter = 0;
      const interval = setInterval(() => {
        counter++;
        if (counter > 100) clearInterval(interval);
      }, 100);
      
      return { started: true };
    }
```

#### 6. Testar interatividade durante operação
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Tentar clicar em botões
      const buttons = document.querySelectorAll('button:not([disabled])');
      
      // Tentar focar input
      const input = document.querySelector('input');
      if (input) {
        input.focus();
        input.value = 'teste';
      }
      
      // Verificar se UI responde
      const inputResponsive = input ? document.activeElement === input : false;
      
      return {
        availableButtons: buttons.length,
        inputResponsive: inputResponsive,
        uiResponsive: buttons.length > 0 || inputResponsive,
        passes: buttons.length > 0
      };
    }
```

#### 7. Verificar Web Workers ou async
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Verificar se código usa Web Workers
      const hasWorkerSupport = typeof Worker !== 'undefined';
      
      // Verificar se há Promises/async em uso
      const scripts = Array.from(document.querySelectorAll('script'));
      const hasAsync = scripts.some(s => 
        s.textContent?.includes('async') || 
        s.textContent?.includes('Promise')
      );
      
      return {
        hasWorkerSupport: hasWorkerSupport,
        hasAsync: hasAsync,
        message: 'Operações longas devem ser async'
      };
    }
```

---

### FT-037: Design responsivo em diferentes tamanhos

#### 8. Testar mobile (375x667)
```
chrome-devtools-resize_page
  width: 375
  height: 667
```

#### 9. Verificar layout mobile
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Verificar se há menu hamburger
      const hamburger = document.querySelector(
        '[data-menu], .hamburger, [aria-label*="Menu"]'
      );
      
      // Verificar se texto é legível
      const body = document.body;
      const fontSize = window.getComputedStyle(body).fontSize;
      
      // Verificar overflow horizontal
      const hasHorizontalScroll = document.documentElement.scrollWidth > width;
      
      return {
        viewport: `${width}x${height}`,
        hasHamburger: !!hamburger,
        fontSize: fontSize,
        hasHorizontalScroll: hasHorizontalScroll,
        passes: !!hamburger && !hasHorizontalScroll
      };
    }
```

#### 10. Screenshot mobile
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ft-037-mobile.png"
```

#### 11. Testar tablet (768x1024)
```
chrome-devtools-resize_page
  width: 768
  height: 1024
```

#### 12. Verificar layout tablet
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const width = window.innerWidth;
      
      // Verificar se layout se adapta
      const main = document.querySelector('main');
      const mainWidth = main?.offsetWidth;
      const isFluid = mainWidth && mainWidth < width;
      
      return {
        viewport: `${width}x${window.innerHeight}`,
        mainWidth: mainWidth,
        isFluid: isFluid,
        passes: isFluid
      };
    }
```

#### 13. Restaurar desktop (1920x1080)
```
chrome-devtools-resize_page
  width: 1920
  height: 1080
```

---

### FT-038: Dark mode funcional

#### 14. Verificar suporte a dark mode
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar toggle de tema
      const themeToggle = document.querySelector(
        '[data-theme-toggle], [aria-label*="tema"], [aria-label*="dark"]'
      );
      
      // Verificar CSS variables para temas
      const root = document.documentElement;
      const styles = window.getComputedStyle(root);
      const bgColor = styles.getPropertyValue('--bg-color') || 
                     styles.backgroundColor;
      
      return {
        hasThemeToggle: !!themeToggle,
        currentBgColor: bgColor,
        hasCSSVariables: !!styles.getPropertyValue('--bg-color')
      };
    }
```

#### 15. Ativar dark mode
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const themeToggle = document.querySelector('[data-theme-toggle]');
      
      if (themeToggle) {
        themeToggle.click();
        return { toggled: true };
      }
      
      // Alternativa: forçar via classe ou localStorage
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      
      return { toggled: true, method: 'fallback' };
    }
```

#### 16. Verificar cores do dark mode
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const body = document.body;
      const styles = window.getComputedStyle(body);
      
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;
      
      // Extrair RGB
      const bgMatch = bgColor.match(/\d+/g);
      const textMatch = textColor.match(/\d+/g);
      
      if (!bgMatch || !textMatch) {
        return { error: 'Cores não encontradas' };
      }
      
      // Calcular luminância
      const bgLuminance = (parseInt(bgMatch[0]) + parseInt(bgMatch[1]) + parseInt(bgMatch[2])) / 3;
      const textLuminance = (parseInt(textMatch[0]) + parseInt(textMatch[1]) + parseInt(textMatch[2])) / 3;
      
      // Dark mode: fundo escuro, texto claro
      const isDarkBg = bgLuminance < 128;
      const isLightText = textLuminance > 128;
      
      return {
        backgroundColor: bgColor,
        textColor: textColor,
        isDarkBackground: isDarkBg,
        isLightText: isLightText,
        passes: isDarkBg && isLightText
      };
    }
```

#### 17. Screenshot dark mode
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ft-038-darkmode.png"
```

---

### FT-039: Confirmação antes de ações destrutivas

#### 18. Criar projeto mock para deletar
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const projects = [
        { id: 'proj-001', name: 'Projeto para Deletar', status: 'draft' }
      ];
      
      localStorage.setItem('projectHistory', JSON.stringify(projects));
      
      return { created: true };
    }
```

#### 19. Tentar deletar projeto
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Navegar para histórico
      window.location.hash = '#/history';
      
      // Aguardar e procurar botão deletar
      setTimeout(() => {
        const deleteBtn = document.querySelector(
          '[data-delete], button[aria-label*="Deletar"], button:has-text("Deletar")'
        );
        
        if (deleteBtn) {
          deleteBtn.click();
        }
      }, 1000);
      
      return { initiated: true };
    }
```

#### 20. Verificar modal de confirmação
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const modal = document.querySelector('[role="dialog"], [role="alertdialog"]');
      const confirmBtn = document.querySelector(
        '[data-confirm], button:has-text("Confirmar"), button:has-text("Sim")'
      );
      const cancelBtn = document.querySelector(
        '[data-cancel], button:has-text("Cancelar"), button:has-text("Não")'
      );
      
      return {
        hasModal: !!modal,
        hasConfirmButton: !!confirmBtn,
        hasCancelButton: !!cancelBtn,
        passes: !!modal && !!confirmBtn && !!cancelBtn
      };
    }
```

#### 21. Testar cancelar
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const cancelBtn = document.querySelector('[data-cancel]');
      
      if (cancelBtn) {
        cancelBtn.click();
      }
      
      // Verificar se projeto ainda existe
      const projects = JSON.parse(localStorage.getItem('projectHistory') || '[]');
      
      return {
        cancelled: true,
        projectStillExists: projects.length > 0,
        passes: projects.length > 0
      };
    }
```

---

### FT-040: Feedback visual de progresso

#### 22. Iniciar operação com progresso
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Simular progresso
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        
        // Atualizar barra se existir
        const progressBar = document.querySelector('[role="progressbar"], progress');
        if (progressBar) {
          progressBar.value = progress;
          progressBar.setAttribute('aria-valuenow', progress.toString());
        }
        
        if (progress >= 100) clearInterval(interval);
      }, 500);
      
      return { started: true };
    }
```

#### 23. Verificar indicadores de progresso
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Procurar diferentes tipos de indicadores
      const progressBar = document.querySelector('[role="progressbar"], progress');
      const spinner = document.querySelector('.spinner, [data-loading]');
      const percentage = document.querySelector('[data-percentage]');
      
      return {
        hasProgressBar: !!progressBar,
        hasSpinner: !!spinner,
        hasPercentage: !!percentage,
        hasAnyIndicator: !!(progressBar || spinner || percentage),
        passes: !!(progressBar || spinner)
      };
    }
```

#### 24. Verificar acessibilidade do progresso
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const progressBar = document.querySelector('[role="progressbar"]');
      
      if (!progressBar) {
        return { error: 'Progress bar não encontrado' };
      }
      
      const hasAriaValueNow = progressBar.hasAttribute('aria-valuenow');
      const hasAriaValueMin = progressBar.hasAttribute('aria-valuemin');
      const hasAriaValueMax = progressBar.hasAttribute('aria-valuemax');
      const hasLabel = progressBar.hasAttribute('aria-label') || 
                      progressBar.hasAttribute('aria-labelledby');
      
      return {
        hasAriaValueNow: hasAriaValueNow,
        hasAriaValueMin: hasAriaValueMin,
        hasAriaValueMax: hasAriaValueMax,
        hasLabel: hasLabel,
        passes: hasAriaValueNow && hasLabel
      };
    }
```

#### 25. Screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ft-040-progress.png"
```

---

## ✅ Critérios de Sucesso

**FT-035:**
- [ ] Página carrega em < 3 segundos
- [ ] DOM ready em < 1.5 segundos
- [ ] Elementos principais presentes
- [ ] Sem recursos > 1MB

**FT-036:**
- [ ] UI permanece responsiva
- [ ] Botões clicáveis durante operações
- [ ] Uso de async/Promises
- [ ] Sem travamentos

**FT-037:**
- [ ] Layout mobile funcional (375px)
- [ ] Layout tablet funcional (768px)
- [ ] Sem scroll horizontal
- [ ] Texto legível em todos os tamanhos

**FT-038:**
- [ ] Toggle de tema disponível
- [ ] Dark mode aplicado corretamente
- [ ] Contraste adequado no dark mode
- [ ] Preferência salva

**FT-039:**
- [ ] Modal de confirmação aparece
- [ ] Opções "Confirmar" e "Cancelar"
- [ ] Cancelar preserva dados
- [ ] Mensagem clara sobre ação

**FT-040:**
- [ ] Indicador de progresso visível
- [ ] Porcentagem ou spinner
- [ ] ARIA attributes corretos
- [ ] Acessível para screen readers

---

## ⏱️ Duração Esperada

- Total: ~5-6 minutos
- FT-035: 1 min
- FT-036: 1 min
- FT-037: 1.5 min
- FT-038: 1 min
- FT-039: 1 min
- FT-040: 1 min

---

## 🐛 Cenários de Falha Comuns

- **Carregamento lento:** Recursos grandes não otimizados
- **UI trava:** Operações síncronas bloqueando thread
- **Layout quebrado:** CSS não responsivo
- **Dark mode mal implementado:** Contraste insuficiente
- **Sem confirmação:** Dados deletados sem aviso
- **Sem feedback:** Usuário não sabe se algo está acontecendo

---

## 📊 Resultado Esperado

```json
{
  "test": "FT-035-040-Performance-UX",
  "status": "PASS",
  "duration": "5m 30s",
  "scenarios": {
    "FT-035": "PASS",
    "FT-036": "PASS",
    "FT-037": "PASS",
    "FT-038": "PASS",
    "FT-039": "PASS",
    "FT-040": "PASS"
  },
  "loadTime": "2.1s",
  "responsive": true,
  "darkModeOk": true
}
```
