# 📁 Reorganização do Projeto - Frontend em Pasta Separada

## ✅ O que foi feito

Reorganizamos o projeto **videoclip-gen** para uma **estrutura monorepo** com o seguinte layout:

```
videoclip-gen/
├── frontend/                  # ← Frontend React/Vite (NOVO)
│   ├── src/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── index.css
│   │   ├── types.ts
│   │   └── services/
│   ├── components/
│   ├── constants/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── package.json              # ← Package.json monorepo (NOVO)
├── Dockerfile                # ← Atualizado para monorepo
├── docker-compose.yml        # ← Novo para dev local
├── nginx.conf                # ← Inalterado
├── cloudbuild.yaml           # ← Inalterado
└── .gitignore
```

### Arquivos Movidos

✅ **Configuração:**
- `package.json` → `frontend/package.json`
- `package-lock.json` → `frontend/package-lock.json`
- `tsconfig.json` → `frontend/tsconfig.json`
- `vite.config.ts` → `frontend/vite.config.ts`
- `tailwind.config.js` → `frontend/tailwind.config.js`
- `postcss.config.js` → `frontend/postcss.config.js`

✅ **Código:**
- `App.tsx` → `frontend/src/App.tsx`
- `index.tsx` → `frontend/src/index.tsx`
- `index.css` → `frontend/src/index.css`
- `types.ts` → `frontend/src/types.ts`
- `components/` → `frontend/components/`
- `services/` → `frontend/src/services/`
- `constants/` → `frontend/constants/`

✅ **Públicos:**
- `icon.svg` → `frontend/public/icon.svg`
- `manifest.json` → `frontend/public/manifest.json`
- `metadata.json` → `frontend/public/metadata.json`
- `sw.js` → `frontend/public/sw.js`
- `coi-serviceworker.js` → `frontend/public/coi-serviceworker.js`
- `clear-sw.html` → `frontend/public/clear-sw.html`

---

## 🚀 PRÓXIMOS PASSOS - TESTE LOCAL

### 1️⃣ Instalar Dependências

```bash
cd /home/deysi/workspace/videoclip-gen/frontend
npm install
```

Isso vai instalar todas as dependências do React, Vite, Tailwind, FFmpeg, etc.

### 2️⃣ Testar Localmente (Desenvolvimento)

```bash
cd /home/deysi/workspace/videoclip-gen/frontend
npm run dev
```

O Vite vai rodar em `http://localhost:5173` (porta padrão do Vite).

**Verificar:**
- ✅ Página carrega?
- ✅ Estilo (Tailwind) funciona?
- ✅ Componentes React renderizam?
- ✅ FFmpeg carrega sem erro de CORS?

### 3️⃣ Testar Com Docker Compose (Produção Local)

```bash
cd /home/deysi/workspace/videoclip-gen
docker-compose up --build
```

Isso vai:
1. Buildar o Dockerfile (frontend)
2. Rodar nginx em `http://localhost:8080`

**Verificar:**
- ✅ Página carrega em http://localhost:8080?
- ✅ Estilo funciona?
- ✅ FFmpeg files servem sem erro CORS?

### 4️⃣ Build para Produção

```bash
cd /home/deysi/workspace/videoclip-gen/frontend
npm run build
```

Isso vai gerar a pasta `frontend/dist/` com os arquivos otimizados.

---

## 📋 O que testar

Após reorganizar e rodar `npm run dev`:

1. **Home Page** - Carrega sem erros?
2. **Styling** - Tailwind CSS funciona (bg-black, cores, etc)?
3. **Componentes** - Buttons, forms, cards renderizam?
4. **FFmpeg Loader** - Console mostra logs do FFmpeg carregando?
5. **Sem CORS errors** - Verificar console do navegador

---

## ⚠️ Se algo quebrar

Se receber erros como `Module not found` ou `Cannot find module`:

1. **Verifique o `tsconfig.json`** - Paths devem estar corretos:
   ```json
   "paths": {
     "@/*": ["./*"]
   }
   ```

2. **Limpe cache:**
   ```bash
   rm -rf frontend/dist frontend/node_modules
   npm install
   npm run dev
   ```

3. **Verifique imports em `App.tsx`** - Podem estar com paths antigos

---

## 📝 Estrutura Final Esperada

```
frontend/
├── dist/                 # Gerado após npm run build
├── node_modules/         # Instalado após npm install
├── src/
│   ├── App.tsx
│   ├── index.tsx
│   ├── index.css
│   ├── types.ts
│   └── services/
│       ├── ffmpeg-loader.ts
│       ├── geminiService.ts
│       ├── dbService.ts
│       └── utils.ts
├── components/
├── constants/
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── ...configs
```

---

## 🎯 PRÓXIMA FASE (após testar localmente)

Quando o frontend funcionar perfeitamente:

1. ✅ Criar pasta `backend/` com Express.js
2. ✅ Criar pasta `database/` com migrations SQL
3. ✅ Criar `.github/workflows/` para CI/CD
4. ✅ Atualizar `cloudbuild.yaml` para build monorepo

---

**Status:** ✅ Frontend reorganizado e pronto para teste local!

