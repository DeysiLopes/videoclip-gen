# ✅ NPM RUN BUILD FAILED - DIST NÃO CRIADO - CORRIGIDO

## 🔧 Problema

**Erro:** `ERROR: dist directory not created!`

**Causa:** 
1. `npm install` foi executado em `/app` (raiz)
2. `npm run build` foi executado em `/app/frontend`
3. O `frontend/` não tinha `node_modules` instalados
4. Portanto `npm run build` falhou silenciosamente

---

## ✅ Solução Aplicada

### Dockerfile (raiz) - CORRIGIDO

**Antes:**
```dockerfile
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps  # ← Instalou na raiz

COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm run build  # ← Aqui não tem node_modules!
```

**Depois:**
```dockerfile
WORKDIR /app
COPY package*.json ./
RUN npm install --legacy-peer-deps  # ← Instala workspace raiz

COPY frontend ./frontend
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps  # ← NOVO: Instala frontend também!
RUN npm run build  # ← Agora tem node_modules!
```

---

## 🚀 Testar Agora

```bash
cd /home/deysi/workspace/videoclip-gen

# Execute o script automático
bash diagnose.sh

# Ou manual
docker compose down -v
docker system prune -f
docker compose build --no-cache frontend backend
docker compose up -d
sleep 40
docker compose ps
curl http://localhost:8080/health
curl http://localhost:3000/health
```

---

## 📊 Fluxo Correto Agora

```
Stage 1 (Builder):
  ✅ WORKDIR /app
  ✅ COPY package*.json ./
  ✅ RUN npm install (workspace raiz)
  ✅ COPY frontend ./frontend
  ✅ WORKDIR /app/frontend
  ✅ RUN npm install (frontend específico)
  ✅ RUN npm run build
  ✅ dist/ é criado!

Stage 2 (Runtime):
  ✅ COPY --from=builder /app/frontend/dist ...
  ✅ nginx serve dist/
```

---

## ✨ Arquivos Corrigidos

| Arquivo | Status |
|---------|--------|
| **Dockerfile (raiz)** | ✅ CORRIGIDO - npm install em frontend/ |
| **frontend/Dockerfile** | ✅ OK |
| **backend/Dockerfile** | ✅ OK |
| **docker-compose.yml** | ✅ OK |
| **nginx.conf** | ✅ OK |

---

**Status:** ✅ **FRONTEND DEVE BUILD AGORA**

Execute: `bash diagnose.sh`

---

**Data:** 2025-11-16

