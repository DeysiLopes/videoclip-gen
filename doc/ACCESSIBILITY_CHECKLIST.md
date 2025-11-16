# ♿ Checklist de Acessibilidade - Prático

Use este checklist antes de enviar código para produção.

## ✅ Pre-Commit Checklist

### 1. HTML Semântico
- [ ] Uso `<button>` para ações, não `<div role="button">`
- [ ] Uso `<a>` para navegação, não `<div onClick>`
- [ ] Todos os inputs têm `<label>` associado
- [ ] Hierarquia correta: h1 → h2 → h3 (sem pular)
- [ ] Uso `<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`

### 2. ARIA
- [ ] Ícones/botões sem texto têm `aria-label`
- [ ] Inputs têm `aria-required`, `aria-invalid` quando apropriado
- [ ] Modals têm `role="dialog"`, `aria-modal="true"`, `aria-labelledby`
- [ ] Alerts têm `role="alert"`, `aria-live="polite"`
- [ ] Regiões dinâmicas têm `aria-live`
- [ ] Elementos decorativos têm `aria-hidden="true"`

### 3. Teclado
- [ ] Tab percorre todos os elementos interativos
- [ ] Shift+Tab volta corretamente
- [ ] Focus é visível em TODOS os elementos
- [ ] Enter/Space funcionam em botões
- [ ] Escape fecha modals
- [ ] Sem "keyboard traps"

### 4. Cores & Contraste
- [ ] Texto/fundo tem contraste 4.5:1+ (use https://webaim.org/resources/contrastchecker/)
- [ ] Não dependo apenas de cor (usar ícones/padrões também)
- [ ] Modo escuro testado

### 5. Formulários
- [ ] Labels claramente associados (não apenas placeholders)
- [ ] Mensagens de erro descritivas
- [ ] Instruções visíveis antes do submit
- [ ] Validação cliente + servidor

### 6. Imagens
- [ ] Todas têm `alt` descritivo (ou `alt=""` se decorativa)
- [ ] Alt não começa com "image of"
- [ ] SVGs têm `<title>` e `<desc>`

### 7. Vídeos
- [ ] Legendas (closed captions)
- [ ] Áudio descritivo (se possível)
- [ ] Transcrição
- [ ] Controles de player acessíveis

---

## 🧪 Testing Checklist

### Navegação por Teclado
```
- [ ] Clico Tab 20 vezes sem problema
- [ ] Shift+Tab volta corretamente
- [ ] Posso usar a aplicação completamente sem mouse
- [ ] Focus está SEMPRE visível
```

### Screen Reader (NVDA/JAWS/VoiceOver)
```
- [ ] Toda navegação funciona
- [ ] Botões são anunciados como "button"
- [ ] Inputs são anunciados com label
- [ ] Erros são anunciados
- [ ] Ordem de leitura faz sentido
```

### Validadores Automáticos
```bash
# 1. Instalar eslint plugin
npm install -D eslint-plugin-jsx-a11y

# 2. Rodar Lighthouse
# Chrome DevTools → Lighthouse → Accessibility

# 3. Instalar extensões
# - WAVE
# - axe DevTools
# - Color Contrast Analyzer
```

### Teste Manual Mobile
```
- [ ] VoiceOver (iOS) funciona
- [ ] TalkBack (Android) funciona
- [ ] Zoom até 200% funciona
- [ ] Touch targets são >48x48px
```

---

## 🔍 Code Review Checklist

Quando revisar PRs, verificar:

### Componentes Novos
- [ ] Usa componentes de `AccessibleComponents.tsx`?
- [ ] Se não, segue padrão de acessibilidade?
- [ ] Tem ARIA labels apropriados?
- [ ] Tem estados `:focus` visíveis?

### Mudanças Visuais
- [ ] Mantém contraste 4.5:1+?
- [ ] Não remove focus styles?
- [ ] Animações <3 flashes/seg?

### Mudanças de Lógica
- [ ] Erros são anunciados (`role="alert"`)?
- [ ] Estados dinâmicos têm `aria-live`?
- [ ] Focus é gerenciado corretamente?

---

## 🚀 Deployment Checklist

Antes de fazer deploy:

```bash
# 1. Executar linter
npm run lint -- --ext .tsx --plugin jsx-a11y

# 2. Executar testes automáticos
npm run test:a11y

# 3. Validar com Lighthouse
# Chrome: DevTools → Lighthouse → Accessibility (target: 90+)

# 4. Testar com screen reader
# VoiceOver (Mac): Cmd+F5
# NVDA (Windows): Baixar em https://www.nvaccess.org/

# 5. Verificar com validador
# https://wave.webaim.org/
# https://www.accessibilityinsights.io/
```

---

## 📊 Scoring

Use esta tabela para acompanhar melhorias:

| Categoria | Target | Current | Status |
|-----------|--------|---------|--------|
| HTML Semântico | 95% | 80% | 🟡 |
| ARIA Labels | 95% | 85% | 🟡 |
| Keyboard Nav | 100% | 100% | ✅ |
| Contraste | 100% | 95% | 🟡 |
| Screen Reader | 90% | 85% | 🟡 |
| Mobile A11y | 90% | 80% | 🟡 |

---

## 🎯 Metas por Sprint

### Sprint 1 (Próximo)
- [ ] Implementar componentes acessíveis
- [ ] Adicionar skip links
- [ ] Testar keyboard navigation
- [ ] Lighthouse score: 80+

### Sprint 2
- [ ] Testar com screen readers
- [ ] Adicionar ARIA labels faltantes
- [ ] Testar mobile accessibility
- [ ] Lighthouse score: 90+

### Sprint 3+
- [ ] Conformidade WCAG 2.1 AA
- [ ] Documentar padrões internos
- [ ] Treinar time em a11y

---

## 📞 Recursos Rápidos

| Ferramenta | Link | Uso |
|-----------|------|-----|
| WAVE | https://wave.webaim.org/ | Validar acessibilidade |
| axe DevTools | https://www.deque.com/axe/devtools/ | Testes automáticos |
| Lighthouse | Chrome DevTools | Score geral |
| WebAIM Contrast | https://webaim.org/resources/contrastchecker/ | Verificar cores |
| Accessible Colors | https://accessible-colors.com/ | Gerar paletas |
| Color Oracle | https://colororacle.org/ | Simular daltonismo |
| NVDA | https://www.nvaccess.org/ | Screen reader Windows |
| VoiceOver | Cmd+F5 (Mac) | Screen reader Mac |

---

## 🎬 Exemplo: Tornar um Componente Acessível

### ANTES (❌ Inacessível)
```typescript
export const SceneCard = ({ scene, onDelete }) => {
  return (
    <div className="p-4 border rounded">
      <img src={scene.imageUrl} />
      <p>{scene.prompt}</p>
      <div onClick={() => onDelete(scene.id)}>🗑️</div>
    </div>
  );
};
```

### DEPOIS (✅ Acessível)
```typescript
export const SceneCard = ({ scene, onDelete }) => {
  return (
    <article className="p-4 border rounded" aria-label={`Cena: ${scene.prompt}`}>
      <img 
        src={scene.imageUrl} 
        alt={`Preview: ${scene.prompt}`}
      />
      <h3 className="text-sm font-semibold mt-2">{scene.prompt}</h3>
      <AccessibleButton
        onClick={() => onDelete(scene.id)}
        ariaLabel={`Deletar cena: ${scene.prompt}`}
        className="mt-2"
      >
        🗑️ Deletar
      </AccessibleButton>
    </article>
  );
};
```

**Mudanças:**
- ✅ `<div>` → `<article>` (semântico)
- ✅ `<img>` tem `alt` descritivo
- ✅ Ícone ficou dentro de `<button>` com `aria-label`
- ✅ Usado componente `AccessibleButton`

---

**Última atualização:** 2025-11-16

