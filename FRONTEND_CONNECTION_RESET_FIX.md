# 🔧 FRONTEND NÃO RESPONDE - Solução

## 📊 Diagnóstico

**Backend:** ✅ Funciona em `http://localhost:3000/health`  
**Frontend:** ❌ Connection reset em `http://localhost:8080/health`

---

## 🚀 Solução Passo a Passo

### Opção 1: Rebuild Completo (Recomendado)

```bash
cd /home/deysi/workspace/videoclip-gen

# 1. Limpar tudo
docker compose down -v

# 2. Remover imagens antigas
docker system prune -f

# 3. Rebuild sem cache (mais lento mas mais seguro)
docker compose build --no-cache frontend

# 4. Build backend também
docker compose build --no-cache backend

# 5. Iniciar
docker compose up -d

# 6. Aguardar 40 segundos
sleep 40

# 7. Verificar status
docker compose ps

# 8. Testar
curl http://localhost:8080/health
curl http://localhost:3000/health
```

### Opção 2: Script Automático

```bash
cd /home/deysi/workspace/videoclip-gen
bash diagnose.sh
```

---

## 🔍 Se Ainda Não Funcionar

### Ver Logs Detalhados

```bash
# Logs completos do frontend
docker compose logs frontend

# Logs em tempo real
docker compose logs -f frontend

# Últimas 100 linhas
docker compose logs frontend | tail -100
```

### Testar Container Manualmente

```bash
# Entrar no container frontend
docker compose exec frontend sh

# Dentro do container:
ls -la /usr/share/nginx/html/
nginx -t
curl http://localhost:8080/health
```

### Verificar Build do Frontend

```bash
# Build apenas (sem iniciar)
docker compose build frontend --verbose

# Ver erro específico se houver
docker compose build frontend 2>&1 | tail -50
```

---

## ⚠️ Problemas Comuns

### Problema 1: dist/ não foi criado
**Solução:**
```bash
cd frontend
npm install
npm run build
cd ..
```

### Problema 2: Porta 8080 já em uso
```bash
# Ver quem está usando
lsof -i :8080

# Matar processo
kill -9 <PID>

# Ou mudar porta no docker-compose.yml
# De: "8080:8080"
# Para: "8000:8080"
```

### Problema 3: nginx não inicia
```bash
# Testar config nginx
docker compose exec frontend nginx -t

# Ver logs
docker compose logs frontend | grep -i error
```

---

## ✅ Checklist

- [ ] Rodou: `docker compose down -v`
- [ ] Rodou: `docker system prune -f`
- [ ] Rodou: `docker compose build --no-cache frontend`
- [ ] Rodou: `docker compose up -d`
- [ ] Aguardou 40 segundos
- [ ] Rodou: `docker compose ps`
- [ ] Frontend está "Up (healthy)"
- [ ] Testou: `curl http://localhost:8080/health`

---

## 🎯 Arquivos Atualizados

- ✅ `Dockerfile` (raiz) - Corrigido
- ✅ `frontend/Dockerfile` - Corrigido
- ✅ `docker-compose.yml` - OK
- ✅ `nginx.conf` - OK

---

**Se ainda não funcionar, execute o script e compartilhe os logs!**

```bash
bash diagnose.sh
```

---

**Data:** 2025-11-16

