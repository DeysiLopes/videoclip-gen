# 🐳 DOCKER FIXES - Correção dos Dockerfiles

## ✅ Problema Resolvido

**Erro:** `npm ci` falhava porque não havia `package-lock.json` no contexto

**Solução:** Usar `npm install` (compatível) com contextos Docker corretos

---

## 🔧 Mudanças Realizadas

### 1. **Dockerfile (raiz)** - Frontend
✅ Atualizado para:
- Usar contexto `frontend/`
- Usar `npm install` em vez de `npm ci`
- Build correto para React + Vite

### 2. **backend/Dockerfile** - Backend
✅ Atualizado para:
- Usar contexto `backend/`
- Usar `npm install` em vez de `npm ci`
- Incluir FFmpeg para renderização

### 3. **frontend/Dockerfile** - NOVO ✨
✅ Criado para:
- Build específico do frontend
- Multi-stage: builder + nginx
- Nginx configurado inline

### 4. **cloudbuild.yaml** - Revisado
✅ Agora:
- Constrói frontend e backend separadamente
- Contextos corretos para cada Dockerfile
- Deploy em dois Cloud Run services diferentes

### 5. **.dockerignore** - Criados
✅ 3 arquivos:
- `.dockerignore` (raiz) - global
- `frontend/.dockerignore` - específico
- `backend/.dockerignore` - específico

---

## 📊 Estrutura Final

```
videoclip-gen/
├── Dockerfile                (Frontend)
├── .dockerignore            (Global)
├── cloudbuild.yaml          (Novo pipeline)
│
├── frontend/
│   ├── Dockerfile          (Específico)
│   ├── .dockerignore       (Específico)
│   └── package.json
│
└── backend/
    ├── Dockerfile          (Específico)
    ├── .dockerignore       (Específico)
    └── package.json
```

---

## 🚀 Como Usar

### Build Local

```bash
# Frontend
docker build -f frontend/Dockerfile -t videoclip-gen-frontend:latest frontend/

# Backend
docker build -f backend/Dockerfile -t videoclip-gen-backend:latest backend/

# Rodar com Docker Compose
docker-compose up --build
```

### Deploy GCP

```bash
# Cloud Build usará cloudbuild.yaml automaticamente
git push origin main

# Verifica status no GCP Console
# → Cloud Build → Build History
```

---

## ✨ Benefícios

✅ **Contextos Corretos** - Cada Dockerfile vê apenas seu diretório
✅ **npm install** - Compatível com ou sem package-lock.json
✅ **Serviços Separados** - Frontend e Backend em Cloud Run diferentes
✅ **Build Paralelo** - Cloud Build pode compilar em paralelo
✅ **Escalabilidade** - Cada serviço escala independentemente

---

## 📝 Notas Importantes

### Frontend
- **Porta:** 8080
- **Runtime:** nginx
- **Build:** React + Vite
- **Saída:** dist/

### Backend
- **Porta:** 3000
- **Runtime:** Node.js
- **Build:** TypeScript + Express
- **Dependência:** FFmpeg

---

## 🔗 Próximos Passos

1. ✅ Dockerfiles corrigidos
2. ⏳ Testar build local: `docker-compose up --build`
3. ⏳ Deploy GCP: `git push origin main`
4. ⏳ Verificar em Cloud Run console

---

## 📞 Troubleshooting

### Erro: "COPY failed: no matching files found"
✅ **Solução:** Contexto Docker incorreto
```bash
# Verificar arquivo existe
ls frontend/package.json   # Deve existir
ls backend/package.json    # Deve existir
```

### Erro: "npm install" ainda falha
✅ **Solução:** Instalar package-lock.json
```bash
cd frontend && npm install
cd backend && npm install
git add package-lock.json
git commit -m "Add package-lock.json"
```

### Build local falha
✅ **Solução:** Limpar Docker
```bash
docker system prune -a
docker-compose up --build
```

---

**Status:** ✅ Dockerfiles Corrigidos

**Data:** 2025-11-16

**Próximo Deploy:** git push → GCP Cloud Build

