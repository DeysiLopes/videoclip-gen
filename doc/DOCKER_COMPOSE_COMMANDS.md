# 🚀 DOCKER COMPOSE COMMANDS - Sintaxe Correta

## ⚠️ Importante: `docker compose` (SEM HÍFEN)

**Não use:** `docker-compose`  
**Use:** `docker compose` ✅

---

## 📋 Comandos Essenciais

### 1️⃣ Iniciar Tudo (Build + Start)
```bash
docker compose up --build -d
```

### 2️⃣ Parar e Limpar Tudo
```bash
docker compose down -v
```

### 3️⃣ Ver Status dos Containers
```bash
docker compose ps
```

### 4️⃣ Ver Logs
```bash
# Todos os logs
docker compose logs

# Logs em tempo real
docker compose logs -f

# Logs do frontend
docker compose logs frontend

# Logs do backend
docker compose logs backend
```

### 5️⃣ Parar Containers
```bash
docker compose stop
```

### 6️⃣ Iniciar Containers (sem rebuild)
```bash
docker compose start
```

---

## 🔄 Workflow Completo

### Limpar Tudo e Reconstruir
```bash
# 1. Parar e remover containers + volumes
docker compose down -v

# 2. Rebuild e start
docker compose up --build -d

# 3. Aguardar healthcheck (30-40 segundos)
sleep 40

# 4. Verificar status
docker compose ps

# 5. Ver logs
docker compose logs
```

### Testar Endpoints
```bash
# Frontend
curl http://localhost:8080/health

# Backend
curl http://localhost:3000/health
```

---

## ✅ Verificação Final

Se tudo funcionar, você deve ver:

```bash
$ docker compose ps

NAME                      COMMAND                  SERVICE      STATUS
videoclip-gen-backend     "node dist/index.js"     backend      Up (healthy)
videoclip-gen-frontend    "nginx -g daemon off;"   frontend     Up (healthy)
```

---

## 🌐 Acessar Aplicação

```
Frontend: http://localhost:8080
Backend:  http://localhost:3000
```

---

## 📝 Referência Rápida

| Comando | O que faz |
|---------|-----------|
| `docker compose up -d` | Iniciar containers |
| `docker compose up --build -d` | Rebuild e iniciar |
| `docker compose down` | Parar containers |
| `docker compose down -v` | Parar e remover volumes |
| `docker compose ps` | Ver status |
| `docker compose logs` | Ver logs |
| `docker compose logs -f` | Logs em tempo real |
| `docker compose stop` | Parar sem remover |
| `docker compose start` | Iniciar containers parados |
| `docker compose restart` | Reiniciar containers |

---

## 🎯 Quick Start

```bash
cd /home/deysi/workspace/videoclip-gen

# Limpar
docker compose down -v

# Rebuild
docker compose up --build -d

# Aguardar
sleep 40

# Verificar
docker compose ps

# Testar
curl http://localhost:8080/health
```

---

**Importante:** Use `docker compose` (sem hífen) em todos os comandos! ✅

**Data:** 2025-11-16

