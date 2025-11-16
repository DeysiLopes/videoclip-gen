# 🔧 TROUBLESHOOTING - Connection reset by peer

## 🚨 Erro: `curl: (56) Recv failure: Connection reset by peer`

**O que significa:** O container nginx está rodando mas rejeitando a conexão na porta 8080

---

## ✅ Soluções

### 1. Verificar se Docker está rodando
```bash
docker ps
# Se vazio, nenhum container está rodando
```

### 2. Verificar se docker-compose iniciou corretamente
```bash
cd /home/deysi/workspace/videoclip-gen
docker-compose ps

# Se vazio, fazer:
docker-compose down -v
docker-compose up -d

# Aguardar 30 segundos
sleep 30

# Verificar novamente
docker-compose ps
```

### 3. Ver logs do frontend
```bash
docker logs videoclip-gen-frontend
# Procurar por erros
```

### 4. Verificar porta 8080
```bash
netstat -tuln | grep 8080
# ou
lsof -i :8080
```

### 5. Testar conexão diretamente no container
```bash
docker exec -it videoclip-gen-frontend sh
# Dentro do container:
curl http://localhost:8080/health
wget http://localhost:8080/health
```

### 6. Verificar nginx dentro do container
```bash
docker exec videoclip-gen-frontend nginx -t
# Deve retornar: nginx: configuration file test is successful
```

---

## 🔍 Problemas Comuns

### Problema 1: Porta 8080 já em uso
```bash
# Liberar porta
lsof -i :8080
kill -9 <PID>

# Ou mudar porta no docker-compose.yml
# De: "8080:8080"
# Para: "8000:8080"
```

### Problema 2: Build falhou silenciosamente
```bash
# Forçar rebuild
docker-compose down -v
docker-compose up --build -d

# Ver progresso
docker-compose logs -f frontend
```

### Problema 3: nginx.conf com erro
```bash
# Testar config
docker exec videoclip-gen-frontend cat /etc/nginx/nginx.conf

# Verificar sintaxe
docker exec videoclip-gen-frontend nginx -t
```

### Problema 4: Frontend não buildou
```bash
# Verificar build
docker logs videoclip-gen-frontend

# Tentar build manualmente
docker build -f frontend/Dockerfile -t test-frontend:latest frontend/
```

---

## ✅ Checklist de Diagnóstico

- [ ] Docker está rodando: `docker ps`
- [ ] docker-compose up executado: `docker-compose ps`
- [ ] Containers estão healthy: `docker ps` (verificar STATUS)
- [ ] Logs sem erros: `docker logs videoclip-gen-frontend`
- [ ] Porta 8080 não em uso: `lsof -i :8080`
- [ ] nginx config válida: `docker exec videoclip-gen-frontend nginx -t`
- [ ] Health endpoint funciona: `curl http://localhost:8080/health`

---

## 🚀 Teste Completo

```bash
# 1. Limpar
docker-compose down -v

# 2. Rebuild
docker-compose up --build -d

# 3. Aguardar 30s
sleep 30

# 4. Verificar
docker-compose ps

# 5. Ver logs
docker-compose logs

# 6. Testar
curl http://localhost:8080/health
```

---

## 📊 Se Ainda Não Funcionar

Coletar informações:
```bash
docker --version
docker-compose --version
docker ps
docker logs videoclip-gen-frontend
docker exec videoclip-gen-frontend nginx -t
curl -v http://localhost:8080/health
```

Compartilhar output para diagnóstico.

---

**Data:** 2025-11-16

