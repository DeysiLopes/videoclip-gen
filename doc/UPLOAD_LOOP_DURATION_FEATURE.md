# ✅ Feature: Loop Duration para Upload de Vídeos

## 🎯 O Que Foi Adicionado

Quando o usuário **faz upload de um vídeo** (em vez de gerar com Gemini), agora ele pode **definir a duração desejada com loop automático**.

## 📝 Problema Resolvido

**Cenário:**
- Cena planejada: 35 segundos
- Vídeo uploadado: 8 segundos
- Solução: Fazer o vídeo entrar em loop até atingir 35s

**Antes:**
- Upload de vídeo → Usa duração real (8s)
- Cena fica curta demais ❌

**Depois:**
- Upload de vídeo → Modal pergunta duração desejada
- Usuário define 35s
- Vídeo faz loop até 35s ✅

## 🎬 Como Funciona

### 1. **Usuário Clica em "Enviar" (Upload)**

```
SceneCard.tsx
  ├─ handleUpload()
  │   ├─ Detecta arquivo
  │   ├─ Armazena em uploadingFile
  │   └─ Mostra modal (showUploadDurationModal = true)
```

### 2. **Modal Aparece**

```
┌─────────────────────────────┐
│ ⏱️ Duração do Loop           │
│                             │
│ O vídeo será repetido (loop)│
│ até alcançar a duração...   │
│                             │
│ Duração Desejada: [35    ] s│
│ Mínimo: 1s | Máximo: 300s   │
│                             │
│ 💡 Se vídeo tem 8s e você   │
│    quer 35s, ele fará loop  │
│    ~4 vezes                 │
│                             │
│ [Cancelar] [Confirmar]      │
└─────────────────────────────┘
```

### 3. **Usuário Confirma**

```
handleConfirmUpload()
  ├─ Processa arquivo
  ├─ Detecta duração real (8s)
  ├─ Salva:
  │   ├─ duration: 8 (real)
  │   └─ intendedDuration: 35 (desejada) ✅
  └─ Backend fará loop ao renderizar
```

## 📊 Estados Adicionados

```typescript
const [showUploadDurationModal, setShowUploadDurationModal] = useState(false);
// Controla se modal está visível

const [uploadDuration, setUploadDuration] = useState<number>(35);
// Duração desejada (padrão: 35s ou intendedDuration da cena)

const [uploadingFile, setUploadingFile] = useState<File | null>(null);
// Arquivo temporário até confirmação
```

## 🔄 Fluxo Completo

```
1. Usuário em editing mode
   └─ Clica botão "Enviar"

2. handleUpload()
   └─ Mostra modal com input de duração

3. Modal aparece
   └─ Pré-preenchido com intendedDuration da cena (ex: 35s)

4. Usuário pode:
   ├─ Mudar valor (1-300s)
   └─ Ou manter padrão

5. Clica "Confirmar"
   └─ handleConfirmUpload()
      ├─ Processa arquivo
      ├─ Detecta duração real (ffprobe)
      ├─ Salva ambas as durações
      └─ Backend usará intendedDuration para loop

6. Renderização (backend)
   ├─ duration: 8s (real)
   ├─ intendedDuration: 35s (planejada)
   └─ Faz loop até 35s
```

## 💾 Dados Salvos no Backend

Quando renderizar, o backend recebe:

```typescript
{
  id: "scene-123",
  videoBlob: Blob,
  duration: 8,              // Real
  intendedDuration: 35,     // Desejada ← Novo!
  isUploaded: true,
  // ...
}
```

Backend usa `intendedDuration` para calcular repetições:

```typescript
const repetitions = Math.ceil(intendedDuration / actualDuration);
// ceil(35 / 8) = 5 repetições
```

## 🎯 Validações

- Mínimo: 1 segundo
- Máximo: 300 segundos (5 minutos)
- Input type: `number`
- Step: 1 segundo

## 📌 Notas Técnicas

1. **Modal aparece apenas em upload**, não em geração Gemini
2. **Valor padrão**: `scene.intendedDuration ?? 35` (usa duração planejada)
3. **Durações são armazenadas**:
   - `duration`: Real (do ffprobe)
   - `intendedDuration`: Desejada (do modal)
4. **Backend renderiza com loop** usando `intendedDuration`

## 🧪 Como Testar

### Teste 1: Upload com Loop
1. Ir para Storyboard
2. Cena com intendedDuration = 35s
3. Clicar "Enviar" (upload)
4. ✅ Modal aparece com 35s pré-preenchido
5. Confirmar
6. Vídeo é salvo com `duration` real e `intendedDuration` = 35s

### Teste 2: Mudar Duração
1. Mesmo teste acima
2. Mudar valor em modal (ex: 50s)
3. Confirmar
4. ✅ Vídeo será renderizado com loop até 50s

### Teste 3: Renderizar
1. Fazer upload
2. Definir duração (ex: 35s)
3. Aprovar
4. Ir para "Corte Final"
5. Renderizar
6. ✅ Vídeo final terá duração correta (com loop)

## ✅ Checklist

- [x] Modal criado com input de duração
- [x] Estados adicionados
- [x] handleUpload modificado
- [x] handleConfirmUpload implementado
- [x] Validações (1-300s)
- [x] Tooltip com exemplo
- [x] Cancelar/Confirmar funcionando
- [x] intendedDuration salvo na cena
- [x] Backend pode usar para calcular loop
- [x] Sem erros de compilação

---

**Data:** 2025-11-16  
**Tipo:** Feature / User Experience  
**Status:** ✅ IMPLEMENTADO  
**Impacto:** Upload com controle de duração e loop

