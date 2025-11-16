# 🎯 CT-026 a CT-029: Imagens Acessíveis

**Categoria:** Accessibility - Important  
**Tags:** `accessibility`, `images`, `important`, `wcag-aa`, `alt-text`  
**Cenários BDD:** accessibility.robot CT-026 a CT-029

---

## 📋 Descrição

Testar acessibilidade de imagens:
- Todas as imagens têm alt text apropriado
- Imagens decorativas têm alt vazio
- Imagens complexas têm descrições longas
- SVGs são acessíveis

---

## 🎬 Passos para Executar com chrome-devtools MCP

### CT-026: Todas as imagens têm alt text

#### 1. Abrir aplicação
```
chrome-devtools-new_page
  url: http://localhost:3000
  timeout: 10000
```

#### 2. Listar todas as imagens
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const images = document.querySelectorAll('img');
      
      const results = Array.from(images).map(img => {
        const alt = img.getAttribute('alt');
        const src = img.src;
        const role = img.getAttribute('role');
        
        return {
          src: src.substring(src.lastIndexOf('/') + 1),
          hasAlt: alt !== null,
          altText: alt,
          altEmpty: alt === '',
          role: role
        };
      });
      
      return {
        totalImages: images.length,
        results: results,
        withAlt: results.filter(r => r.hasAlt).length,
        withoutAlt: results.filter(r => !r.hasAlt).length
      };
    }
```

#### 3. Verificar qualidade do alt text
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const images = document.querySelectorAll('img[alt]:not([alt=""])');
      
      const results = Array.from(images).map(img => {
        const alt = img.getAttribute('alt');
        const src = img.src;
        
        // Verificar problemas comuns
        const problems = [];
        
        // Alt text muito curto
        if (alt.length < 3) {
          problems.push('Alt text muito curto');
        }
        
        // Alt text contém nome do arquivo
        if (alt.includes('.jpg') || alt.includes('.png') || alt.includes('.svg')) {
          problems.push('Contém extensão de arquivo');
        }
        
        // Alt text começa com "imagem de" ou "foto de"
        if (alt.toLowerCase().startsWith('imagem de') || 
            alt.toLowerCase().startsWith('foto de') ||
            alt.toLowerCase().startsWith('picture of') ||
            alt.toLowerCase().startsWith('image of')) {
          problems.push('Redundante (imagem de...)');
        }
        
        // Alt text muito longo (> 150 caracteres)
        if (alt.length > 150) {
          problems.push('Alt text muito longo (considere longdesc)');
        }
        
        return {
          src: src.substring(src.lastIndexOf('/') + 1),
          alt: alt,
          altLength: alt.length,
          problems: problems,
          quality: problems.length === 0 ? 'good' : 'needs-improvement'
        };
      });
      
      const goodQuality = results.filter(r => r.quality === 'good');
      
      return {
        totalWithAlt: images.length,
        goodQuality: goodQuality.length,
        needsImprovement: results.length - goodQuality.length,
        passes: goodQuality.length === results.length,
        samples: results.slice(0, 5)
      };
    }
```

#### 4. Verificar imagens sem alt
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
      
      if (imagesWithoutAlt.length === 0) {
        return {
          imagesWithoutAlt: 0,
          passes: true,
          message: 'Todas as imagens têm atributo alt'
        };
      }
      
      const results = Array.from(imagesWithoutAlt).map(img => ({
        src: img.src.substring(img.src.lastIndexOf('/') + 1),
        parent: img.parentElement?.tagName,
        hasAriaLabel: !!img.getAttribute('aria-label'),
        hasRole: !!img.getAttribute('role')
      }));
      
      return {
        imagesWithoutAlt: imagesWithoutAlt.length,
        passes: false,
        message: 'Algumas imagens não têm atributo alt',
        images: results
      };
    }
```

---

### CT-027: Imagens decorativas têm alt vazio

#### 5. Identificar imagens decorativas
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const images = document.querySelectorAll('img');
      
      const decorative = Array.from(images).filter(img => {
        const role = img.getAttribute('role');
        const alt = img.getAttribute('alt');
        const ariaHidden = img.getAttribute('aria-hidden');
        
        // Imagem é decorativa se:
        // - role="presentation" ou role="none"
        // - aria-hidden="true"
        // - alt=""
        // - está em elemento decorativo
        
        return role === 'presentation' || 
               role === 'none' || 
               ariaHidden === 'true' ||
               alt === '';
      });
      
      const results = decorative.map(img => {
        const role = img.getAttribute('role');
        const alt = img.getAttribute('alt');
        const ariaHidden = img.getAttribute('aria-hidden');
        
        // Imagem decorativa deve ter alt=""
        const hasEmptyAlt = alt === '';
        
        // Ou role="presentation"/"none"
        const hasDecorativeRole = role === 'presentation' || role === 'none';
        
        // Ou aria-hidden="true"
        const isAriaHidden = ariaHidden === 'true';
        
        const isProperlyMarked = hasEmptyAlt || hasDecorativeRole || isAriaHidden;
        
        return {
          src: img.src.substring(img.src.lastIndexOf('/') + 1),
          alt: alt,
          role: role,
          ariaHidden: ariaHidden,
          isProperlyMarked: isProperlyMarked
        };
      });
      
      const allProper = results.every(r => r.isProperlyMarked);
      
      return {
        decorativeImages: decorative.length,
        properlyMarked: results.filter(r => r.isProperlyMarked).length,
        allProper: allProper,
        passes: allProper,
        samples: results.slice(0, 5)
      };
    }
```

#### 6. Verificar ícones decorativos
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar ícones (font icons, SVG icons)
      const iconElements = document.querySelectorAll(
        'i[class*="icon"], i[class*="fa-"], [class*="material-icons"], svg[class*="icon"]'
      );
      
      const results = Array.from(iconElements).map(icon => {
        const ariaHidden = icon.getAttribute('aria-hidden');
        const role = icon.getAttribute('role');
        const ariaLabel = icon.getAttribute('aria-label');
        
        // Ícone decorativo deve ter aria-hidden="true"
        // Ícone significativo deve ter aria-label
        
        const hasText = icon.textContent?.trim().length > 0;
        const nearbyText = icon.nextElementSibling?.textContent?.trim();
        
        // Se há texto próximo, ícone é provavelmente decorativo
        const isLikelyDecorative = !!nearbyText && nearbyText.length > 0;
        
        const isProperlyMarked = isLikelyDecorative ? 
          ariaHidden === 'true' : 
          !!ariaLabel || hasText;
        
        return {
          element: icon.tagName,
          class: icon.className,
          ariaHidden: ariaHidden,
          ariaLabel: ariaLabel,
          hasNearbyText: !!nearbyText,
          isProperlyMarked: isProperlyMarked
        };
      });
      
      const allProper = results.every(r => r.isProperlyMarked);
      
      return {
        iconElements: iconElements.length,
        properlyMarked: results.filter(r => r.isProperlyMarked).length,
        allProper: allProper,
        passes: allProper,
        samples: results.slice(0, 5)
      };
    }
```

---

### CT-028: Imagens complexas têm descrições longas

#### 7. Procurar imagens complexas
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const images = document.querySelectorAll('img');
      
      // Imagens complexas: gráficos, diagramas, infográficos
      const complexImages = Array.from(images).filter(img => {
        const alt = img.getAttribute('alt')?.toLowerCase() || '';
        const src = img.src.toLowerCase();
        
        // Indicadores de imagem complexa
        return alt.includes('gráfico') ||
               alt.includes('diagrama') ||
               alt.includes('chart') ||
               alt.includes('graph') ||
               alt.includes('infográfico') ||
               src.includes('chart') ||
               src.includes('graph') ||
               src.includes('diagram');
      });
      
      if (complexImages.length === 0) {
        return {
          complexImages: 0,
          passes: true,
          note: 'Nenhuma imagem complexa detectada'
        };
      }
      
      const results = complexImages.map(img => {
        const longdesc = img.getAttribute('longdesc');
        const ariaDescribedby = img.getAttribute('aria-describedby');
        
        let hasLongDescription = false;
        let descriptionMethod = 'none';
        
        if (longdesc) {
          hasLongDescription = true;
          descriptionMethod = 'longdesc';
        } else if (ariaDescribedby) {
          const descElement = document.getElementById(ariaDescribedby);
          if (descElement && descElement.textContent.length > 50) {
            hasLongDescription = true;
            descriptionMethod = 'aria-describedby';
          }
        }
        
        return {
          src: img.src.substring(img.src.lastIndexOf('/') + 1),
          alt: img.getAttribute('alt'),
          hasLongDescription: hasLongDescription,
          descriptionMethod: descriptionMethod
        };
      });
      
      const allHaveDesc = results.every(r => r.hasLongDescription);
      
      return {
        complexImages: complexImages.length,
        withDescription: results.filter(r => r.hasLongDescription).length,
        allHaveDesc: allHaveDesc,
        passes: allHaveDesc,
        images: results
      };
    }
```

#### 8. Verificar descrições detalhadas
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      // Procurar elementos com descrições longas
      const describedElements = document.querySelectorAll('[aria-describedby]');
      
      const results = Array.from(describedElements).map(el => {
        const describedby = el.getAttribute('aria-describedby');
        const descElement = document.getElementById(describedby);
        
        const descLength = descElement?.textContent?.length || 0;
        
        return {
          element: el.tagName,
          describedby: describedby,
          descriptionExists: !!descElement,
          descriptionLength: descLength,
          isAdequate: descLength > 20
        };
      });
      
      return {
        elementsWithDesc: describedElements.length,
        adequateDescriptions: results.filter(r => r.isAdequate).length,
        samples: results.slice(0, 3)
      };
    }
```

---

### CT-029: SVGs são acessíveis

#### 9. Listar SVGs
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const svgs = document.querySelectorAll('svg');
      
      const results = Array.from(svgs).map(svg => {
        const role = svg.getAttribute('role');
        const ariaLabel = svg.getAttribute('aria-label');
        const ariaLabelledby = svg.getAttribute('aria-labelledby');
        const ariaHidden = svg.getAttribute('aria-hidden');
        const title = svg.querySelector('title');
        const desc = svg.querySelector('desc');
        
        // SVG é decorativo se tem aria-hidden="true"
        const isDecorative = ariaHidden === 'true';
        
        // SVG significativo deve ter label
        const hasLabel = !!ariaLabel || !!ariaLabelledby || !!title;
        
        const isAccessible = isDecorative || hasLabel;
        
        return {
          role: role,
          ariaLabel: ariaLabel,
          ariaLabelledby: ariaLabelledby,
          ariaHidden: ariaHidden,
          hasTitle: !!title,
          hasDesc: !!desc,
          titleText: title?.textContent,
          isDecorative: isDecorative,
          hasLabel: hasLabel,
          isAccessible: isAccessible
        };
      });
      
      const allAccessible = results.every(r => r.isAccessible);
      
      return {
        totalSVGs: svgs.length,
        decorative: results.filter(r => r.isDecorative).length,
        withLabel: results.filter(r => r.hasLabel).length,
        accessible: results.filter(r => r.isAccessible).length,
        allAccessible: allAccessible,
        passes: allAccessible,
        samples: results.slice(0, 5)
      };
    }
```

#### 10. Verificar SVG inline
```javascript
chrome-devtools-evaluate_script
  function: |
    () => {
      const inlineSVGs = document.querySelectorAll('svg:not([aria-hidden="true"])');
      
      const results = Array.from(inlineSVGs).map(svg => {
        // Verificar se SVG tem role="img"
        const role = svg.getAttribute('role');
        const hasImgRole = role === 'img';
        
        // Verificar focusable
        const focusable = svg.getAttribute('focusable');
        const isFocusable = focusable !== 'false';
        
        // SVG inline significativo deve ter:
        // - role="img"
        // - focusable="false" (para IE/Edge)
        // - aria-label ou title
        
        const ariaLabel = svg.getAttribute('aria-label');
        const title = svg.querySelector('title');
        
        const isProperlyConfigured = 
          hasImgRole && 
          focusable === 'false' &&
          (!!ariaLabel || !!title);
        
        return {
          hasImgRole: hasImgRole,
          focusableAttribute: focusable,
          hasLabel: !!ariaLabel || !!title,
          isProperlyConfigured: isProperlyConfigured
        };
      });
      
      const allProper = results.every(r => r.isProperlyConfigured);
      
      return {
        inlineSVGs: inlineSVGs.length,
        properlyConfigured: results.filter(r => r.isProperlyConfigured).length,
        allProper: allProper,
        passes: allProper || inlineSVGs.length === 0,
        samples: results.slice(0, 3)
      };
    }
```

#### 11. Screenshot final
```
chrome-devtools-take_screenshot
  fullPage: true
  format: "png"
  filePath: "tests/mcp-automation/2-important/screenshots/ct-029-svgs.png"
```

---

## ✅ Critérios de Sucesso

**CT-026:**
- [ ] Todas as imagens têm atributo alt
- [ ] Alt text é descritivo (não genérico)
- [ ] Alt text não contém extensões de arquivo
- [ ] Alt text não começa com "imagem de"

**CT-027:**
- [ ] Imagens decorativas têm alt=""
- [ ] Ou role="presentation"/"none"
- [ ] Ou aria-hidden="true"
- [ ] Ícones decorativos marcados corretamente

**CT-028:**
- [ ] Imagens complexas identificadas
- [ ] Têm longdesc ou aria-describedby
- [ ] Descrições são detalhadas (>20 chars)
- [ ] Descrições são compreensíveis

**CT-029:**
- [ ] SVGs decorativos têm aria-hidden="true"
- [ ] SVGs significativos têm role="img"
- [ ] SVGs têm aria-label ou <title>
- [ ] SVGs inline têm focusable="false"

---

## ⏱️ Duração Esperada

- Total: ~3-4 minutos
- CT-026: 1 min
- CT-027: 1 min
- CT-028: 1 min
- CT-029: 1 min

---

## 🐛 Cenários de Falha Comuns

- **Imagens sem alt:** Atributo faltando
- **Alt genérico:** "imagem", "foto", "image1.jpg"
- **Decorativas com alt text:** Deve ser alt=""
- **SVG sem label:** Inacessível para screen readers
- **Gráficos sem descrição:** Alt curto demais
- **Ícones sem aria-hidden:** Poluição para SR

---

## 📊 Resultado Esperado

```json
{
  "test": "CT-026-029-Images",
  "status": "PASS",
  "duration": "3m 45s",
  "scenarios": {
    "CT-026": "PASS",
    "CT-027": "PASS",
    "CT-028": "PASS",
    "CT-029": "PASS"
  },
  "totalImages": 15,
  "allHaveAlt": true,
  "decorativeMarked": true,
  "svgsAccessible": true
}
```
