# 🎯 CT-016 a CT-020: HTML Semântico

**Categoria:** Accessibility - Critical  
**Tags:** `semantic`, `accessibility`, `critical`, `seo`  
**Cenários BDD:** accessibility.robot CT-016 a CT-020

---

## 📋 Descrição

Validar uso correto de HTML semântico:
- Hierarquia de headings
- Tags `<button>` para botões
- Tags `<a>` para links
- Tags semânticas (`<nav>`, `<main>`, `<section>`)
- Listas com `<ul>`/`<ol>`

## 🎬 Passos para Executar com chrome-devtools MCP

### CT-016: Hierarquia de headings está correta

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

#### 3. Analisar hierarquia de headings
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const hierarchy = [];
      let previousLevel = 0;
      let errors = [];
      
      for (const heading of headings) {
        const level = parseInt(heading.tagName.substring(1));
        const text = heading.textContent?.trim().substring(0, 50);
        
        hierarchy.push({
          tag: heading.tagName,
          level: level,
          text: text,
          id: heading.id || '(no id)'
        });
        
        // Verificar se pulou níveis
        if (previousLevel > 0 && level > previousLevel + 1) {
          errors.push({
            problem: `Pulou de h${previousLevel} para h${level}`,
            text: text
          });
        }
        
        previousLevel = level;
      }
      
      // Verificar se começa com h1
      const firstHeading = hierarchy[0];
      if (firstHeading && firstHeading.level !== 1) {
        errors.push({
          problem: 'Primeira heading não é h1',
          found: `h${firstHeading.level}`
        });
      }
      
      // Verificar se há apenas um h1
      const h1Count = hierarchy.filter(h => h.level === 1).length;
      if (h1Count > 1) {
        errors.push({
          problem: `Múltiplos h1 (${h1Count})`,
          recommendation: 'Deve haver apenas 1 h1 por página'
        });
      }
      
      return {
        headingCount: headings.length,
        hierarchy: hierarchy,
        errors: errors,
        passes: errors.length === 0,
        h1Count: h1Count
      };
    }
```

#### 4. Verificar sequência lógica
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      const sequence = Array.from(headings).map(h => parseInt(h.tagName.substring(1)));
      
      // Verificar sequência: cada nível pode aumentar 1 ou diminuir qualquer quantidade
      let valid = true;
      let issues = [];
      
      for (let i = 1; i < sequence.length; i++) {
        const prev = sequence[i - 1];
        const curr = sequence[i];
        
        // Se aumentou, só pode ser +1
        if (curr > prev && curr !== prev + 1) {
          valid = false;
          issues.push({
            position: i,
            from: `h${prev}`,
            to: `h${curr}`,
            problem: `Pulou nível (h${prev} → h${curr})`
          });
        }
      }
      
      return {
        sequence: sequence.map(n => `h${n}`).join(' → '),
        valid: valid,
        issues: issues,
        passes: valid
      };
    }
```

#### 5. Tirar screenshot
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/screenshots/ct-016-heading-hierarchy.png"
```

---

### CT-017: Botões usam tag `<button>`

#### 6. Localizar todos elementos clicáveis
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Elementos que se comportam como botões mas não são <button>
      const fakeButtons = [];
      
      // Procurar divs/spans com onclick
      const clickables = document.querySelectorAll('[onclick], [role="button"]');
      
      for (const el of clickables) {
        if (el.tagName !== 'BUTTON' && el.tagName !== 'A') {
          fakeButtons.push({
            tag: el.tagName,
            class: el.className,
            text: el.textContent?.substring(0, 30),
            hasRole: el.getAttribute('role') === 'button',
            problem: 'Deve usar <button>'
          });
        }
      }
      
      // Contar botões reais
      const realButtons = document.querySelectorAll('button');
      
      return {
        realButtons: realButtons.length,
        fakeButtons: fakeButtons.length,
        fakeButtonsList: fakeButtons,
        passes: fakeButtons.length === 0,
        message: 'Todos os botões devem usar tag <button>'
      };
    }
```

#### 7. Validar botões têm type correto
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const buttons = document.querySelectorAll('button');
      const issues = [];
      
      for (const btn of buttons) {
        const type = btn.type;
        const inForm = btn.closest('form') !== null;
        
        // Botões em forms devem ter type explícito
        if (inForm && !type) {
          issues.push({
            button: btn.textContent?.substring(0, 30),
            problem: 'Botão em form sem type (padrão é submit)',
            recommendation: 'Definir type="button" ou type="submit"'
          });
        }
        
        // Validar types válidos
        if (type && !['button', 'submit', 'reset'].includes(type)) {
          issues.push({
            button: btn.textContent?.substring(0, 30),
            problem: `Type inválido: ${type}`,
            validTypes: ['button', 'submit', 'reset']
          });
        }
      }
      
      return {
        totalButtons: buttons.length,
        issues: issues,
        passes: issues.length === 0
      };
    }
```

#### 8. Verificar acessibilidade de botões
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const buttons = document.querySelectorAll('button');
      const problems = [];
      
      for (const btn of buttons) {
        const hasText = btn.textContent?.trim().length > 0;
        const hasAriaLabel = btn.hasAttribute('aria-label');
        const hasAriaLabelledBy = btn.hasAttribute('aria-labelledby');
        const hasTitle = btn.hasAttribute('title');
        
        // Botão deve ter texto ou aria-label
        const hasAccessibleName = hasText || hasAriaLabel || hasAriaLabelledBy;
        
        if (!hasAccessibleName) {
          problems.push({
            button: btn.outerHTML.substring(0, 100),
            problem: 'Botão sem texto ou aria-label',
            innerHTML: btn.innerHTML.substring(0, 50)
          });
        }
        
        // Botões desabilitados devem ter disabled, não aria-disabled
        const ariaDisabled = btn.getAttribute('aria-disabled');
        const disabled = btn.disabled;
        
        if (ariaDisabled === 'true' && !disabled) {
          problems.push({
            button: btn.textContent?.substring(0, 30),
            problem: 'Usar disabled ao invés de aria-disabled="true"'
          });
        }
      }
      
      return {
        totalButtons: buttons.length,
        problems: problems,
        passes: problems.length === 0
      };
    }
```

---

### CT-018: Links usam tag `<a>`

#### 9. Localizar links falsos
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Elementos que se comportam como links mas não são <a>
      const fakeLinks = [];
      
      // Procurar elementos com cursor:pointer e texto que parece link
      const allElements = document.querySelectorAll('*');
      
      for (const el of allElements) {
        if (el.tagName === 'A') continue;
        
        const styles = window.getComputedStyle(el);
        const hasPointerCursor = styles.cursor === 'pointer';
        const hasUnderline = styles.textDecoration.includes('underline');
        const hasLinkColor = styles.color === 'rgb(0, 0, 238)' || // Blue
                             styles.color.includes('blue');
        
        // Se parece link mas não é <a>
        if ((hasPointerCursor || hasUnderline) && 
            el.textContent?.trim().length > 0 &&
            el.textContent.length < 100) {
          fakeLinks.push({
            tag: el.tagName,
            text: el.textContent?.substring(0, 30),
            hasPointerCursor: hasPointerCursor,
            hasUnderline: hasUnderline,
            problem: 'Parece link mas não é <a>'
          });
        }
      }
      
      // Contar links reais
      const realLinks = document.querySelectorAll('a');
      
      return {
        realLinks: realLinks.length,
        fakeLinks: fakeLinks.length,
        fakeLinksFound: fakeLinks.slice(0, 5), // Primeiros 5
        passes: fakeLinks.length === 0
      };
    }
```

#### 10. Validar links têm href
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const links = document.querySelectorAll('a');
      const issues = [];
      
      for (const link of links) {
        const href = link.getAttribute('href');
        const hasOnClick = link.onclick !== null || link.hasAttribute('onclick');
        
        // Links devem ter href
        if (!href || href === '#' || href === 'javascript:void(0)') {
          // Se tem onclick, pode ser botão disfarçado
          if (hasOnClick) {
            issues.push({
              text: link.textContent?.substring(0, 30),
              href: href || '(none)',
              problem: 'Link com onclick deve ser <button>',
              recommendation: 'Trocar por <button>'
            });
          } else {
            issues.push({
              text: link.textContent?.substring(0, 30),
              href: href || '(none)',
              problem: 'Link sem href válido'
            });
          }
        }
        
        // Validar links externos têm target e rel
        if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
          const hostname = new URL(href).hostname;
          const isExternal = hostname !== window.location.hostname;
          
          if (isExternal) {
            const target = link.getAttribute('target');
            const rel = link.getAttribute('rel');
            
            if (target === '_blank' && (!rel || !rel.includes('noopener'))) {
              issues.push({
                text: link.textContent?.substring(0, 30),
                problem: 'Link externo com target="_blank" sem rel="noopener"',
                security: 'Vulnerabilidade de segurança'
              });
            }
          }
        }
      }
      
      return {
        totalLinks: links.length,
        issues: issues,
        passes: issues.length === 0
      };
    }
```

---

### CT-019: Usa tags semânticas

#### 11. Verificar tags semânticas HTML5
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const semanticTags = {
        nav: document.querySelectorAll('nav'),
        main: document.querySelectorAll('main'),
        header: document.querySelectorAll('header'),
        footer: document.querySelectorAll('footer'),
        section: document.querySelectorAll('section'),
        article: document.querySelectorAll('article'),
        aside: document.querySelectorAll('aside')
      };
      
      const found = {};
      const missing = [];
      
      for (const [tag, elements] of Object.entries(semanticTags)) {
        found[tag] = elements.length;
        
        // Tags esperadas
        if (tag === 'main' && elements.length === 0) {
          missing.push({ tag: 'main', reason: 'Conteúdo principal deve estar em <main>' });
        }
        if (tag === 'nav' && elements.length === 0) {
          missing.push({ tag: 'nav', reason: 'Navegação deve estar em <nav>' });
        }
      }
      
      // Verificar se há muitos <div> onde poderia usar semântica
      const allDivs = document.querySelectorAll('div');
      const suspiciousDivs = [];
      
      for (const div of allDivs) {
        const className = div.className?.toLowerCase();
        
        if (className?.includes('nav') || className?.includes('menu')) {
          suspiciousDivs.push({ class: className, suggestion: '<nav>' });
        }
        if (className?.includes('header')) {
          suspiciousDivs.push({ class: className, suggestion: '<header>' });
        }
        if (className?.includes('footer')) {
          suspiciousDivs.push({ class: className, suggestion: '<footer>' });
        }
        if (className?.includes('article') || className?.includes('post')) {
          suspiciousDivs.push({ class: className, suggestion: '<article>' });
        }
      }
      
      return {
        semanticTags: found,
        missing: missing,
        suspiciousDivs: suspiciousDivs.slice(0, 5),
        passes: missing.length === 0 && found.main > 0 && found.nav > 0,
        recommendations: suspiciousDivs.length > 0 ? 'Considerar tags semânticas' : 'OK'
      };
    }
```

#### 12. Validar estrutura da página
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const structure = {
        hasMain: !!document.querySelector('main'),
        mainCount: document.querySelectorAll('main').length,
        hasNav: !!document.querySelector('nav'),
        hasHeader: !!document.querySelector('header'),
        hasFooter: !!document.querySelector('footer')
      };
      
      const issues = [];
      
      // Deve ter exatamente 1 <main>
      if (structure.mainCount === 0) {
        issues.push('Falta tag <main>');
      } else if (structure.mainCount > 1) {
        issues.push(`Múltiplas tags <main> (${structure.mainCount})`);
      }
      
      // Deve ter pelo menos 1 <nav>
      if (!structure.hasNav) {
        issues.push('Falta tag <nav> para navegação');
      }
      
      return {
        structure: structure,
        issues: issues,
        passes: issues.length === 0,
        score: `${Object.values(structure).filter(Boolean).length}/5 tags encontradas`
      };
    }
```

---

### CT-020: Listas usam `<ul>` ou `<ol>`

#### 13. Localizar listas falsas
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar divs que se parecem com listas
      const fakeLists = [];
      const allDivs = document.querySelectorAll('div');
      
      for (const div of allDivs) {
        const children = Array.from(div.children);
        
        // Se tem 3+ filhos diretos similares, pode ser lista
        if (children.length >= 3) {
          const tags = children.map(c => c.tagName);
          const allSameTag = tags.every(t => t === tags[0]);
          
          if (allSameTag && tags[0] === 'DIV') {
            // Verificar se tem bullet points ou números no texto
            const firstText = children[0].textContent?.trim();
            const hasBullet = firstText?.startsWith('•') || 
                            firstText?.startsWith('-') ||
                            firstText?.match(/^\d+\./);
            
            if (hasBullet) {
              fakeLists.push({
                parent: div.className || '(no class)',
                childCount: children.length,
                firstChild: firstText?.substring(0, 30),
                problem: 'Deve usar <ul> ou <ol>',
                recommendation: hasBullet ? '<ul>' : '<ol>'
              });
            }
          }
        }
      }
      
      // Contar listas reais
      const realLists = {
        ul: document.querySelectorAll('ul').length,
        ol: document.querySelectorAll('ol').length
      };
      
      return {
        realLists: realLists,
        totalRealLists: realLists.ul + realLists.ol,
        fakeLists: fakeLists.length,
        fakeListsFound: fakeLists.slice(0, 3),
        passes: fakeLists.length === 0
      };
    }
```

#### 14. Validar estrutura de listas
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const lists = document.querySelectorAll('ul, ol');
      const issues = [];
      
      for (const list of lists) {
        // Filhos diretos devem ser <li>
        const directChildren = Array.from(list.children);
        const nonLiChildren = directChildren.filter(c => c.tagName !== 'LI');
        
        if (nonLiChildren.length > 0) {
          issues.push({
            listType: list.tagName,
            problem: `${list.tagName} tem filhos que não são <li>`,
            found: nonLiChildren.map(c => c.tagName).join(', '),
            recommendation: 'Apenas <li> como filhos diretos'
          });
        }
        
        // Lista deve ter pelo menos 1 item
        const items = list.querySelectorAll('li');
        if (items.length === 0) {
          issues.push({
            listType: list.tagName,
            problem: 'Lista vazia (sem <li>)'
          });
        }
      }
      
      return {
        totalLists: lists.length,
        issues: issues,
        passes: issues.length === 0
      };
    }
```

#### 15. Verificar listas de navegação
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const navs = document.querySelectorAll('nav');
      const navWithLists = [];
      const navWithoutLists = [];
      
      for (const nav of navs) {
        const hasList = nav.querySelector('ul, ol') !== null;
        
        if (hasList) {
          navWithLists.push({
            nav: nav.className || '(no class)',
            listType: nav.querySelector('ul') ? 'ul' : 'ol'
          });
        } else {
          // Verificar se tem links diretos
          const directLinks = Array.from(nav.children).filter(c => c.tagName === 'A');
          
          if (directLinks.length > 1) {
            navWithoutLists.push({
              nav: nav.className || '(no class)',
              linkCount: directLinks.length,
              recommendation: 'Usar <ul><li><a> para navegação'
            });
          }
        }
      }
      
      return {
        navCount: navs.length,
        navWithLists: navWithLists.length,
        navWithoutLists: navWithoutLists,
        passes: navWithoutLists.length === 0,
        message: 'Navegação com múltiplos links deve usar <ul>'
      };
    }
```

#### 16. Screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/screenshots/ct-020-semantic-html.png"
```

---

## ✅ Critérios de Sucesso

**CT-016:**
- [ ] Um único `<h1>` por página
- [ ] Hierarquia sem pulos (h1 → h2 → h3)
- [ ] Ordem lógica

**CT-017:**
- [ ] Botões usam `<button>`
- [ ] Não usa `<div onclick>`
- [ ] Types corretos (button/submit)

**CT-018:**
- [ ] Links usam `<a>`
- [ ] Todos têm `href` válido
- [ ] Externos têm `rel="noopener"`

**CT-019:**
- [ ] Usa `<main>` para conteúdo
- [ ] Usa `<nav>` para navegação
- [ ] Usa `<header>`, `<footer>`, `<section>`

**CT-020:**
- [ ] Listas usam `<ul>`/`<ol>`
- [ ] Filhos diretos são `<li>`
- [ ] Navegação usa `<ul>`

---

## ⏱️ Duração Esperada

- Total: ~2-3 minutos
- CT-016: 30s
- CT-017: 30s
- CT-018: 30s
- CT-019: 30s
- CT-020: 30s

---

## 🐛 Cenários de Falha Comuns

- **Múltiplos h1:** SEO e acessibilidade prejudicados
- **Divs como botões:** Não funcionam com teclado
- **Links sem href:** Screen readers não identificam
- **Falta `<main>`:** Navegação por landmarks falha
- **Divs como listas:** Screen readers não anunciam lista

---

## 📊 Resultado Esperado

```json
{
  "test": "CT-016-020-Semantic-HTML",
  "status": "PASS",
  "duration": "2m 15s",
  "scenarios": {
    "CT-016": "PASS",
    "CT-017": "PASS",
    "CT-018": "PASS",
    "CT-019": "PASS",
    "CT-020": "PASS"
  },
  "h1Count": 1,
  "semanticScore": "5/5",
  "realButtons": 32,
  "fakeButtons": 0
}
```
