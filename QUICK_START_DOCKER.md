# 🚀 QUICK START - Como Rodar e Testar

## 1️⃣ Limpar Tudo (Se houver containers antigos)

```bash
cd /home/deysi/workspace/videoclip-gen

# Parar todos os containers
docker-compose down -v

# Remover volumes
docker volume prune -f

# Remover images (opcional)
docker image prune -a -f
```

## 2️⃣ Iniciar Containers

```bash
# Build e start
docker-compose up --build -d

# Ou só start (se já foi buildado)
docker-compose up -d
```

## 3️⃣ Aguardar Containers Ficarem Healthy

```bash
# Ver status
docker-compose ps

# Aguardar ~30-40 segundos para healthcheck passar

# Ver logs em tempo real
docker-compose logs -f
```

## 4️⃣ Testar Endpoints

```bash
# Frontend
curl http://localhost:8080/health
# Esperado: 200 OK ou "healthy"

# Backend
curl http://localhost:3000/health
# Esperado: 200 OK ou erro (é ok se der erro em dev)
```

## 5️⃣ Acessar Aplicação

```bash
# Abrir no navegador
http://localhost:8080

# Frontend deve carregar!
```

## 📊 Ver Status

```bash
# Ver todos os containers
docker-compose ps

# Ver logs frontend
docker-compose logs frontend

# Ver logs backend
docker-compose logs backend

# Ver logs em tempo real
docker-compose logs -f
```

## 🛑 Parar Containers

```bash
# Parar mas manter dados
docker-compose stop

# Parar e remover
docker-compose down

# Parar e remover volumes também
docker-compose down -v
```

---

## ✅ Se Funcionar

Parabéns! Os containers estão rodando:
- **Frontend:** http://localhost:8080 ✅
- **Backend:** http://localhost:3000 ✅

## ❌ Se Não Funcionar

Rodar diagnóstico:
```bash
# Ver containers
docker ps

# Se nenhum aparece:
docker-compose logs

# Se há erros, copiar output completo
```

---

**Pronto!** 🎉

