# ♿ Guia de Acessibilidade - DreamDirector AI

## Overview

Este documento descreve as práticas de acessibilidade implementadas no DreamDirector AI para garantir que a plataforma seja usável por todas as pessoas, incluindo aquelas com deficiências.

**Padrões Seguidos:**
- WCAG 2.1 (Web Content Accessibility Guidelines) - Nível AA
- WAI-ARIA (Accessible Rich Internet Applications)
- Semantic HTML5

---

## 🎯 Princípios de Acessibilidade (POUR)

### 1. **Perceptível** (Perceivable)
Informações e componentes devem ser percebidos pelos usuários.

- ✅ Contraste de cores (4.5:1 para texto)
- ✅ Descrições alternativas (alt text)
- ✅ Legendas em vídeos
- ✅ Não depender apenas de cor

### 2. **Operável** (Operable)
Componentes devem ser operáveis via teclado e outros dispositivos.

- ✅ Navegação completa por teclado (Tab, Shift+Tab, Enter, Escape)
- ✅ Sem armadilhas de teclado (keyboard traps)
- ✅ Focus visível em todos os elementos interativos
- ✅ Tempo suficiente para interagir

### 3. **Compreensível** (Understandable)
Conteúdo e operação devem ser compreensíveis.

- ✅ Linguagem clara e simples
- ✅ Erros explicados claramente
- ✅ Rótulos consistentes
- ✅ Placeholders e hints úteis

### 4. **Robusto** (Robust)
Conteúdo deve ser compatível com assistive technologies.

- ✅ HTML semântico
- ✅ ARIA labels apropriados
- ✅ Validação de tipos TypeScript
- ✅ Testes com screen readers

---

## 🛠️ Implementação Frontend

### Estrutura Semântica HTML

```typescript
// ✅ BOM - Usar elementos semânticos
<nav aria-label="Navegação principal">
  <button>Menu</button>
</nav>

<main>
  <section>
    <h1>Título Principal</h1>
    <p>Conteúdo</p>
  </section>
</main>

<footer>
  <p>&copy; 2025 DreamDirector AI</p>
</footer>

// ❌ RUIM - Div genérica sem semântica
<div className="navbar">
  <div className="button">Menu</div>
</div>
```

### ARIA Labels

```typescript
// ✅ BOM - Labels descritivos
<button 
  aria-label="Renderizar vídeo final"
  aria-describedby="render-help"
>
  Renderizar
</button>
<p id="render-help">Gera o vídeo final com todas as cenas aprovadas</p>

// ✅ BOM - Form labels
<label htmlFor="projectName">Nome do Projeto</label>
<input 
  id="projectName"
  type="text"
  placeholder="Digite o nome do projeto"
  aria-required="true"
/>

// ❌ RUIM - Sem labels
<input type="text" placeholder="Nome do Projeto" />
```

### Navegação por Teclado

```typescript
// ✅ BOM - Suporta Tab, Enter, Escape
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  onKeyDown={(e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  }}
>
  <h2 id="modal-title">Confirmar Ação</h2>
  <button autoFocus>OK</button>
  <button>Cancelar</button>
</div>

// ✅ BOM - Focus management
useEffect(() => {
  if (isOpen) {
    firstButtonRef.current?.focus();
  }
}, [isOpen]);
```

### Contraste de Cores

```typescript
// ✅ BOM - Contraste 4.5:1+
className="text-white bg-indigo-600"  // Razão: ~8:1

// ❌ RUIM - Contraste baixo
className="text-gray-500 bg-gray-100"  // Razão: ~2:1
```

### Feedback Visual

```typescript
// ✅ BOM - Indicadores múltiplos
<div className="flex items-center gap-2">
  <span className="w-3 h-3 bg-green-500 rounded-full" aria-hidden="true"></span>
  <span className="text-green-700">Renderização concluída</span>
</div>

// ❌ RUIM - Apenas cor
<div className="bg-green-500">Concluído</div>
```

---

## 🎬 Componentes Acessíveis

### 1. Botões

```typescript
interface AccessibleButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  disabled?: boolean;
  title?: string; // Tooltip
}

export const AccessibleButton: React.FC<AccessibleButtonProps> = ({
  children,
  onClick,
  ariaLabel,
  ariaDescribedBy,
  disabled,
  title,
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    title={title}
    className={`
      px-4 py-2 rounded-lg font-semibold
      transition-all duration-200
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500
      disabled:opacity-50 disabled:cursor-not-allowed
      hover:scale-105
    `}
  >
    {children}
  </button>
);
```

### 2. Inputs

```typescript
interface AccessibleInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
}

export const AccessibleInput: React.FC<AccessibleInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
  helperText,
}) => {
  const helperId = `${id}-help`;
  const errorId = `${id}-error`;

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {required && <span aria-label="obrigatório">*</span>}
      </label>
      <input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        aria-required={required}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        aria-invalid={!!error}
        className={`
          w-full px-3 py-2 rounded-md
          border-2 transition-colors
          focus:outline-none focus:ring-2 focus:ring-indigo-500
          ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'}
        `}
      />
      {helperText && (
        <p id={helperId} className="mt-1 text-xs text-gray-600">
          {helperText}
        </p>
      )}
      {error && (
        <p id={errorId} className="mt-1 text-xs text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
```

### 3. Modal/Dialog

```typescript
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const titleId = useId();
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      firstButtonRef.current?.focus();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop com ARIA */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        role="presentation"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-0 flex items-center justify-center z-50"
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        }}
      >
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
          <div className="p-6">
            <h2 id={titleId} className="text-xl font-bold mb-4">
              {title}
            </h2>
            {children}
          </div>
          <div className="flex justify-end gap-3 p-4 border-t">
            <button
              ref={firstButtonRef}
              onClick={onClose}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
```

### 4. Stepper/Progress

```typescript
interface AccessibleStepperProps {
  steps: string[];
  currentStep: number;
  onStepClick?: (step: number) => void;
}

export const AccessibleStepper: React.FC<AccessibleStepperProps> = ({
  steps,
  currentStep,
  onStepClick,
}) => {
  return (
    <nav aria-label="Progresso da aplicação">
      <ol role="list" className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <li
            key={step}
            className="flex items-center"
            aria-current={idx === currentStep ? 'step' : undefined}
          >
            <button
              onClick={() => onStepClick?.(idx)}
              disabled={idx > currentStep}
              aria-label={`Passo ${idx + 1}: ${step}${idx === currentStep ? ' (ativo)' : ''}`}
              className={`
                w-10 h-10 rounded-full font-bold
                focus:outline-none focus:ring-2 focus:ring-indigo-500
                ${idx < currentStep ? 'bg-green-500 text-white' : ''}
                ${idx === currentStep ? 'bg-indigo-600 text-white ring-2 ring-indigo-300' : ''}
                ${idx > currentStep ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : ''}
              `}
            >
              {idx + 1}
            </button>
            {idx < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 ${
                  idx < currentStep ? 'bg-green-500' : 'bg-gray-300'
                }`}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};
```

---

## 📋 Checklist de Acessibilidade

### HTML & Semântica
- [ ] Usar tags semânticas (`<nav>`, `<main>`, `<section>`, `<article>`, etc)
- [ ] Hierarquia correta de headings (h1 → h2 → h3)
- [ ] Labels para todos os inputs
- [ ] Estrutura lógica e em ordem de leitura

### Navegação
- [ ] Navegação completa por teclado
- [ ] Tab order lógico
- [ ] Skip links para conteúdo principal
- [ ] Focus visível em todos os elementos

### ARIA
- [ ] `aria-label` para ícones/botões sem texto
- [ ] `aria-describedby` para descrições
- [ ] `aria-live` para atualizações dinâmicas
- [ ] `aria-modal` para modals
- [ ] `role` apropriados

### Cores & Contraste
- [ ] Contraste mínimo 4.5:1 para texto
- [ ] Não depender apenas de cor
- [ ] Modo alto contraste suportado
- [ ] Dark mode bem implementado

### Imagens & Mídia
- [ ] Alt text descritivo
- [ ] Legendas em vídeos
- [ ] Transcrições de áudio
- [ ] Sem animações que piscam >3x/segundo

### Formulários
- [ ] Labels claramente associados
- [ ] Mensagens de erro claras
- [ ] Instruções acessíveis
- [ ] Validação no lado do cliente e servidor

### Performance
- [ ] Tempo de carregamento <3 segundos
- [ ] Responsivo (mobile-first)
- [ ] Reduzir JS desnecessário

---

## 🧪 Testing

### Manual Testing
```bash
# 1. Navegação por Teclado
- Tab entre elementos
- Shift+Tab volta
- Enter/Space em botões
- Escape fecha modals

# 2. Screen Reader (NVDA/JAWS no Windows, VoiceOver no Mac)
- Testar toda navegação
- Verificar labels
- Conferir ordem de leitura

# 3. Validadores
- WAVE: https://wave.webaim.org/
- axe DevTools: https://www.deque.com/axe/devtools/
- Lighthouse (Chrome DevTools)
```

### Ferramentas
```bash
# npm
npm install -D @testing-library/jest-dom
npm install -D @axe-core/react
npm install -D eslint-plugin-jsx-a11y

# ESLint config
{
  "plugins": ["jsx-a11y"],
  "extends": ["plugin:jsx-a11y/recommended"]
}
```

---

## 🔗 Recursos

- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)
- [A11y Project](https://www.a11yproject.com/)
- [Accessible Colors](https://accessible-colors.com/)

---

## 📊 Conformidade

| Critério | Status | Nível |
|----------|--------|-------|
| Percepção | ✅ | AA |
| Operabilidade | ✅ | AA |
| Compreensão | ✅ | AA |
| Robustez | ✅ | AA |

**Meta: WCAG 2.1 Nível AA ou superior**

---

**Última atualização:** 2025-11-16
**Versão:** 1.0

