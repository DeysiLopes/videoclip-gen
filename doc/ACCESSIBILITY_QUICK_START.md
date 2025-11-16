# 🚀 Quick Start - Implementar Acessibilidade

Use este guia para adicionar acessibilidade rapidamente aos seus componentes.

## 1️⃣ Componente Simples

### Usar Componentes Prontos

```typescript
// ❌ NÃO
import { useState } from 'react';

export const DeleteButton = ({ onDelete }) => {
  return <div onClick={onDelete}>🗑️</div>;
};

// ✅ SIM
import { AccessibleButton } from './AccessibleComponents';

export const DeleteButton = ({ onDelete, itemName }) => {
  return (
    <AccessibleButton
      onClick={onDelete}
      ariaLabel={`Deletar ${itemName}`}
    >
      🗑️ Deletar
    </AccessibleButton>
  );
};
```

## 2️⃣ Formulário

### Input Acessível

```typescript
// ❌ NÃO
<input type="text" placeholder="Nome" />

// ✅ SIM
import { AccessibleInput } from './AccessibleComponents';

<AccessibleInput
  id="projectName"
  label="Nome do Projeto"
  value={name}
  onChange={setName}
  required
  helperText="Mínimo 3 caracteres"
  error={name.length < 3 ? "Nome muito curto" : undefined}
/>
```

## 3️⃣ Modal

### Dialog Acessível

```typescript
// ❌ NÃO
<div onClick={close}>
  <h2>{title}</h2>
  {children}
  <button onClick={close}>Close</button>
</div>

// ✅ SIM
import { AccessibleModal } from './AccessibleComponents';

<AccessibleModal
  isOpen={isOpen}
  onClose={onClose}
  title="Confirmar Ação"
>
  {children}
</AccessibleModal>
```

## 4️⃣ Ícone

### Ícone com Label

```typescript
// ❌ NÃO
<button>🎬</button>

// ✅ SIM
<button aria-label="Renderizar vídeo">🎬</button>

// ✅ MELHOR
import { AccessibleButton } from './AccessibleComponents';

<AccessibleButton ariaLabel="Renderizar vídeo">
  🎬 Renderizar
</AccessibleButton>
```

## 5️⃣ Alert/Erro

### Mensagem Acessível

```typescript
// ❌ NÃO
<div className="bg-red-500">{error}</div>

// ✅ SIM
import { AccessibleAlert } from './AccessibleComponents';

<AccessibleAlert
  type="error"
  title="Erro"
  message={error}
  onClose={clearError}
/>
```

## 6️⃣ Imagem

### Alt Text

```typescript
// ❌ NÃO
<img src="scene.jpg" />
<img src="scene.jpg" alt="image" />

// ✅ SIM
<img 
  src="scene.jpg" 
  alt="Cena de abertura: personagem em frente à montanha ao amanhecer"
/>

// ✅ DECORATIVA
<img src="divider.png" alt="" aria-hidden="true" />
```

## 7️⃣ Link/Botão

### Semântica Correta

```typescript
// ❌ NÃO
<div onClick={() => navigate('/home')} role="button">
  Home
</div>

// ✅ SIM - Navegação
<a href="/home">Home</a>

// ✅ SIM - Ação
<button onClick={handleClick}>Salvar</button>
```

## 8️⃣ Heading

### Hierarquia Correta

```typescript
// ❌ NÃO
<h1>App</h1>
<h3>Seção 1</h3>  {/* Pulou h2 */}
<h2>Seção 2</h2>

// ✅ SIM
<h1>App</h1>
<h2>Seção 1</h2>
<h3>Subsseção 1.1</h3>
<h2>Seção 2</h2>
```

## 9️⃣ Lista

### Semântica de Lista

```typescript
// ❌ NÃO
<div>
  <div>Item 1</div>
  <div>Item 2</div>
</div>

// ✅ SIM
<ul>
  <li>Item 1</li>
  <li>Item 2</li>
</ul>

// ✅ GRID
<ul className="grid grid-cols-2">
  <li>Item 1</li>
  <li>Item 2</li>
</ul>
```

## 🔟 Navegação

### Stepper/Progress

```typescript
// ❌ NÃO
<div className="flex gap-2">
  <div className="w-8 h-8 bg-blue-500">1</div>
  <div className="w-8 h-8 bg-gray-300">2</div>
</div>

// ✅ SIM
import { AccessibleStepper } from './AccessibleComponents';

<AccessibleStepper
  steps={["Setup", "Storyboard", "Final"]}
  currentStep={1}
/>
```

---

## ⚡ Checklist Rápido

Antes de submeter PR:

```
[ ] Testei com Tab/Shift+Tab
[ ] Focus é visível em TODOS os elementos
[ ] Usei componentes acessíveis quando apropriado
[ ] Inputs têm labels
[ ] Erros têm role="alert"
[ ] Ícones têm aria-label
[ ] Modals podem fechar com Escape
[ ] Imagens têm alt text
[ ] Heading hierarchy está correta
[ ] Sem keyboard traps
[ ] Lighthouse a11y score: 85+
```

---

## 🆘 Problemas Comuns

### "Focus não está visível"

```typescript
// Adicionar outline ao focus
className="focus:outline-2 focus:outline-indigo-500 focus:outline-offset-2"
```

### "Erro não é anunciado"

```typescript
// Use role="alert"
<div role="alert" className="text-red-600">
  {error}
</div>
```

### "Screen reader não lê"

```typescript
// Certifique-se que tem aria-label ou texto visível
<button aria-label="Deletar">🗑️</button>
// ou
<button>🗑️ Deletar</button>
```

### "Input não está acessível"

```typescript
// SEMPRE use label com htmlFor
<label htmlFor="name">Nome:</label>
<input id="name" type="text" />
```

---

## 📚 Exemplo Completo

### Componente Acessível do Zero

```typescript
import React, { useState } from 'react';
import { AccessibleInput, AccessibleButton, AccessibleAlert } from './AccessibleComponents';

interface ProjectFormProps {
  onSubmit: (name: string) => void;
}

export const ProjectForm: React.FC<ProjectFormProps> = ({ onSubmit }) => {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = () => {
    // Validar
    if (name.length < 3) {
      setError('Nome deve ter ao menos 3 caracteres');
      return;
    }

    // Submeter
    setError('');
    onSubmit(name);
    setName('');
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        handleSubmit();
      }}
      aria-labelledby="form-title"
      className="max-w-md mx-auto"
    >
      <h2 id="form-title" className="text-xl font-bold mb-4">
        Novo Projeto
      </h2>

      {error && (
        <AccessibleAlert
          type="error"
          title="Erro de validação"
          message={error}
          onClose={() => setError('')}
        />
      )}

      <AccessibleInput
        id="projectName"
        label="Nome do Projeto"
        value={name}
        onChange={setName}
        placeholder="Ex: Meu Primeiro Vídeo"
        required
        helperText="Mínimo 3 caracteres"
        error={name && name.length < 3 ? "Muito curto" : undefined}
      />

      <AccessibleButton
        onClick={handleSubmit}
        ariaLabel="Criar novo projeto"
        className="w-full mt-4"
      >
        Criar Projeto
      </AccessibleButton>
    </form>
  );
};
```

---

## 🎯 Próximos Passos

1. Substituir componentes não-acessíveis pelos do `AccessibleComponents.tsx`
2. Adicionar aria-labels faltantes
3. Testar com teclado
4. Rodar ESLint com jsx-a11y
5. Testar com screen reader

**Tempo estimado:** 1-2 horas por componente

**Última atualização:** 2025-11-16

