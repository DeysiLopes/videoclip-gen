# 🎯 FT-028 a FT-030: Armazenamento e Persistência

**Categoria:** Functional - Important  
**Tags:** `storage`, `important`, `persistence`, `history`  
**Cenários BDD:** functional.robot FT-028 a FT-030

---

## 📋 Descrição

Testar funcionalidades de armazenamento local:
- Histórico de projetos salvos
- Salvar projeto em andamento
- Retomar projeto salvo anteriormente

## 🎬 Passos para Executar com chrome-devtools MCP

### FT-028: Histórico de projetos

#### 1. Abrir aplicação
```
chrome-devtools-new_page
  url: http://localhost:3000
  timeout: 10000
```

#### 2. Criar mock de projetos salvos
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const projects = [
        {
          id: 'proj-001',
          name: 'Meu Primeiro Projeto',
          audioFile: 'audio1.mp3',
          createdAt: new Date('2025-01-15').toISOString(),
          updatedAt: new Date('2025-01-15').toISOString(),
          status: 'completed',
          scenesCount: 5
        },
        {
          id: 'proj-002',
          name: 'Projeto em Andamento',
          audioFile: 'audio2.mp3',
          createdAt: new Date('2025-02-01').toISOString(),
          updatedAt: new Date('2025-02-10').toISOString(),
          status: 'in_progress',
          scenesCount: 3
        },
        {
          id: 'proj-003',
          name: 'Teste Rápido',
          audioFile: 'test.mp3',
          createdAt: new Date('2025-03-05').toISOString(),
          updatedAt: new Date('2025-03-05').toISOString(),
          status: 'draft',
          scenesCount: 0
        }
      ];
      
      localStorage.setItem('projectHistory', JSON.stringify(projects));
      
      return {
        saved: true,
        count: projects.length
      };
    }
```

#### 3. Navegar para histórico
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar link/botão de histórico
      const historyBtn = document.querySelector(
        '[data-history], [aria-label*="Histórico"], button:has-text("Projetos")'
      );
      
      if (historyBtn) {
        historyBtn.click();
        return { navigated: true };
      }
      
      // Tentar URL direta
      window.location.hash = '#/history';
      return { navigated: true, method: 'direct' };
    }
```

#### 4. Aguardar página de histórico
```
chrome-devtools-wait_for
  text: "Projetos"
  timeout: 5000
```

#### 5. Verificar lista de projetos
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const projectItems = document.querySelectorAll(
        '[data-project-item], .project-card, [role="listitem"]'
      );
      
      if (projectItems.length === 0) {
        return { error: 'Nenhum projeto encontrado na lista' };
      }
      
      const projects = Array.from(projectItems).map(item => ({
        name: item.querySelector('[data-project-name], h3, .title')?.textContent?.trim(),
        status: item.querySelector('[data-project-status], .status')?.textContent?.trim(),
        date: item.querySelector('[data-project-date], .date')?.textContent?.trim()
      }));
      
      return {
        projectCount: projectItems.length,
        projects: projects,
        passes: projectItems.length === 3
      };
    }
```

#### 6. Verificar ordenação (mais recentes primeiro)
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const dateElements = document.querySelectorAll('[data-project-date], .date');
      const dates = Array.from(dateElements).map(el => {
        const text = el.textContent?.trim();
        // Tentar parsear data
        return new Date(text || '2000-01-01');
      });
      
      // Verificar se está ordenado (mais recente primeiro)
      let isOrdered = true;
      for (let i = 1; i < dates.length; i++) {
        if (dates[i] > dates[i - 1]) {
          isOrdered = false;
          break;
        }
      }
      
      return {
        dateCount: dates.length,
        isOrdered: isOrdered,
        dates: dates.map(d => d.toISOString()),
        passes: isOrdered
      };
    }
```

#### 7. Verificar informações dos projetos
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const firstProject = document.querySelector('[data-project-item], .project-card');
      
      if (!firstProject) {
        return { error: 'Projeto não encontrado' };
      }
      
      const hasName = !!firstProject.querySelector('[data-project-name], .title');
      const hasStatus = !!firstProject.querySelector('[data-project-status], .status');
      const hasDate = !!firstProject.querySelector('[data-project-date], .date');
      const hasActions = !!firstProject.querySelector('button, a');
      
      return {
        hasName: hasName,
        hasStatus: hasStatus,
        hasDate: hasDate,
        hasActions: hasActions,
        passes: hasName && hasStatus && hasDate
      };
    }
```

#### 8. Screenshot
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ft-028-history.png"
```

---

### FT-029: Salvar projeto em andamento

#### 9. Criar projeto novo
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Navegar para início
      window.location.hash = '#/';
      
      // Configurar projeto
      const projectData = {
        name: 'Projeto para Salvar',
        audioFile: 'test-audio.mp3',
        description: 'Teste de salvamento',
        scenes: [
          { id: '1', prompt: 'Cena 1', status: 'draft' },
          { id: '2', prompt: 'Cena 2', status: 'draft' }
        ],
        status: 'in_progress',
        createdAt: new Date().toISOString()
      };
      
      localStorage.setItem('currentProject', JSON.stringify(projectData));
      
      return { created: true, project: projectData.name };
    }
```

#### 10. Procurar botão "Salvar"
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const saveBtn = document.querySelector(
        '[data-save], [aria-label*="Salvar"], button:has-text("Salvar")'
      );
      
      return {
        found: !!saveBtn,
        text: saveBtn?.textContent?.trim(),
        disabled: saveBtn?.disabled
      };
    }
```

#### 11. Clicar em Salvar
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const saveBtn = document.querySelector(
        '[data-save], [aria-label*="Salvar"], button:has-text("Salvar")'
      );
      
      if (saveBtn && !saveBtn.disabled) {
        saveBtn.click();
        return { clicked: true };
      }
      
      // Alternativa: Simular Ctrl+S
      document.dispatchEvent(new KeyboardEvent('keydown', {
        key: 's',
        ctrlKey: true,
        bubbles: true
      }));
      
      return { clicked: true, method: 'keyboard' };
    }
```

#### 12. Verificar feedback de salvamento
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Procurar toast/notificação
      const notification = document.querySelector(
        '[role="alert"], .toast, .notification, [data-notification]'
      );
      
      const message = notification?.textContent?.toLowerCase();
      const isSaveMessage = message?.includes('salvo') || 
                           message?.includes('saved') ||
                           message?.includes('sucesso');
      
      return {
        hasNotification: !!notification,
        message: notification?.textContent?.trim(),
        isSaveMessage: isSaveMessage,
        passes: isSaveMessage
      };
    }
```

#### 13. Verificar localStorage atualizado
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const history = localStorage.getItem('projectHistory');
      
      if (!history) {
        return { error: 'Histórico não encontrado' };
      }
      
      const projects = JSON.parse(history);
      const savedProject = projects.find(p => p.name === 'Projeto para Salvar');
      
      return {
        historyCount: projects.length,
        projectFound: !!savedProject,
        projectData: savedProject,
        passes: !!savedProject
      };
    }
```

---

### FT-030: Retomar projeto salvo

#### 14. Navegar para histórico
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      window.location.hash = '#/history';
      return { navigated: true };
    }
```

#### 15. Aguardar lista
```
chrome-devtools-wait_for
  text: "Projetos"
  timeout: 3000
```

#### 16. Selecionar projeto para retomar
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar primeiro projeto
      const firstProject = document.querySelector('[data-project-item], .project-card');
      
      if (!firstProject) {
        return { error: 'Nenhum projeto encontrado' };
      }
      
      // Procurar botão "Abrir" ou "Continuar"
      const openBtn = firstProject.querySelector(
        '[data-open], [data-continue], button:has-text("Abrir"), button:has-text("Continuar")'
      );
      
      if (openBtn) {
        openBtn.click();
        return { clicked: true };
      }
      
      // Alternativa: clicar no próprio projeto
      firstProject.click();
      return { clicked: true, method: 'card' };
    }
```

#### 17. Verificar projeto carregado
```javascript
chrome-devtools-evaluate_script
  function: |
    async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const currentProject = localStorage.getItem('currentProject');
      
      if (!currentProject) {
        return { error: 'Projeto não carregado' };
      }
      
      const project = JSON.parse(currentProject);
      
      // Verificar se UI mostra dados do projeto
      const projectName = document.querySelector('[data-project-name], .project-title, h1');
      const nameMatches = projectName?.textContent?.includes(project.name);
      
      return {
        projectLoaded: true,
        projectName: project.name,
        scenesCount: project.scenes?.length || 0,
        uiMatches: nameMatches,
        passes: nameMatches
      };
    }
```

#### 18. Verificar estado preservado
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const currentProject = JSON.parse(localStorage.getItem('currentProject'));
      
      // Verificar se cenas foram restauradas
      const sceneElements = document.querySelectorAll('[data-scene], .scene-item');
      
      const expectedScenes = currentProject.scenes?.length || 0;
      const actualScenes = sceneElements.length;
      
      return {
        expectedScenes: expectedScenes,
        actualScenes: actualScenes,
        scenesRestored: expectedScenes === actualScenes,
        status: currentProject.status,
        passes: expectedScenes === actualScenes
      };
    }
```

#### 19. Verificar possibilidade de continuar trabalho
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Verificar se há botões de ação disponíveis
      const generateBtn = document.querySelector('[data-generate], button:has-text("Gerar")');
      const editBtn = document.querySelector('[data-edit], button:has-text("Editar")');
      const saveBtn = document.querySelector('[data-save], button:has-text("Salvar")');
      
      return {
        canGenerate: !!generateBtn && !generateBtn.disabled,
        canEdit: !!editBtn && !editBtn.disabled,
        canSave: !!saveBtn && !saveBtn.disabled,
        passes: !!(generateBtn || editBtn || saveBtn)
      };
    }
```

#### 20. Screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ft-030-project-restored.png"
```

---

## ✅ Critérios de Sucesso

**FT-028:**
- [ ] Lista de projetos é exibida
- [ ] Projetos ordenados por data (mais recente primeiro)
- [ ] Cada projeto mostra: nome, status, data
- [ ] Pelo menos 3 projetos visíveis

**FT-029:**
- [ ] Botão "Salvar" está disponível
- [ ] Clicar salva projeto no localStorage
- [ ] Feedback visual de sucesso
- [ ] Projeto aparece no histórico

**FT-030:**
- [ ] Projeto pode ser selecionado da lista
- [ ] Dados são carregados corretamente
- [ ] Cenas são restauradas
- [ ] Ações continuam disponíveis

---

## ⏱️ Duração Esperada

- Total: ~4-5 minutos
- FT-028: 1.5 min
- FT-029: 1.5 min
- FT-030: 1.5 min

---

## 🐛 Cenários de Falha Comuns

- **Lista vazia:** localStorage não populado
- **Salvar falha:** Quota do localStorage excedida
- **Projeto não carrega:** JSON corrompido ou inválido
- **Estado perdido:** Campos não preservados corretamente
- **Ordenação errada:** Comparação de datas falha

---

## 📊 Resultado Esperado

```json
{
  "test": "FT-028-030-Storage",
  "status": "PASS",
  "duration": "4m 20s",
  "scenarios": {
    "FT-028": "PASS",
    "FT-029": "PASS",
    "FT-030": "PASS"
  },
  "projectsSaved": 4,
  "storageUsed": "~50 KB"
}
```
