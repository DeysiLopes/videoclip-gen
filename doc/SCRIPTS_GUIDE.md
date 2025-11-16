# 🎬 DreamDirector AI - Scripts de Automação

## 📁 Scripts Disponíveis

```
videoclip-gen/
├── 🚀 start.sh         → Inicia frontend + backend
├── 🛑 stop.sh          → Para e limpa containers
├── 📋 QUICKSTART.sh    → Guia interativo
└── 💾 commit.sh        → Commit + Push automático
```

---

## 🚀 start.sh

**Descrição:** Inicia frontend e backend com Docker Compose

**Uso:**
```bash
./start.sh
```

**O que faz:**
1. Para containers existentes
2. Remove volumes antigos
3. Reconstrói imagens Docker
4. Inicia containers em background
5. Aguarda inicialização (10s)
6. Exibe status e URLs

**Saída esperada:**
```
🚀 Iniciando DreamDirector AI...
🛑 Parando containers existentes...
🔨 Construindo e iniciando containers...
⏳ Aguardando containers ficarem prontos...
✅ Verificando status dos containers...
🎉 DreamDirector AI iniciado com sucesso!

📌 Acessos:
   Frontend: http://localhost:3000
   Backend:  http://localhost:8080/health
```

---

## 🛑 stop.sh

**Descrição:** Para e remove containers, volumes e redes

**Uso:**
```bash
./stop.sh
```

**O que faz:**
1. Para todos os containers
2. Remove volumes (dados temporários)
3. Remove redes Docker
4. Limpa recursos

**Saída esperada:**
```
🛑 Parando DreamDirector AI...
✅ DreamDirector AI parado com sucesso!

📋 Para iniciar novamente:
   ./start.sh
```

---

## 📋 QUICKSTART.sh

**Descrição:** Guia interativo com todas as informações

**Uso:**
```bash
./QUICKSTART.sh
```

**O que mostra:**
- 📋 Opções disponíveis (7 comandos)
- 🌐 URLs de acesso
- 📦 Estrutura do projeto
- ✅ Próximos passos
- 🐛 Troubleshooting

---

## 💾 commit.sh

**Descrição:** Commit e push automático das mudanças

**Uso:**
```bash
./commit.sh
```

**O que faz:**
1. Exibe status do Git
2. Adiciona todos os arquivos
3. Cria commit com mensagem descritiva
4. Faz push para `origin main`
5. Dispara CI/CD no GCP

**⚠️ Atenção:** Revise as mudanças antes de executar!

---

## 📊 Fluxo Completo de Uso

### Desenvolvimento Local

```bash
# 1. Iniciar aplicação
./start.sh

# 2. Aguardar containers (~30s)
# Aguardar mensagem: "🎉 DreamDirector AI iniciado com sucesso!"

# 3. Acessar frontend
# Abrir navegador: http://localhost:3000

# 4. Verificar backend
curl http://localhost:8080/health

# 5. Desenvolver...

# 6. Ver logs em tempo real
docker compose logs -f

# 7. Parar aplicação
./stop.sh
```

### Deploy para Produção (GCP)

```bash
# 1. Fazer mudanças no código

# 2. Testar localmente
./start.sh
# Testar aplicação...
./stop.sh

# 3. Commit e push
./commit.sh

# 4. Aguardar CI/CD no GCP (~10 min)

# 5. Verificar deploy
# Acessar: https://videoclip-gen-frontend-XXXXX.run.app
```

---

## 🎯 Comandos Rápidos

| Ação | Comando |
|------|---------|
| **Iniciar** | `./start.sh` |
| **Parar** | `./stop.sh` |
| **Guia** | `./QUICKSTART.sh` |
| **Commit** | `./commit.sh` |
| **Logs** | `docker compose logs -f` |
| **Status** | `docker compose ps` |
| **Reiniciar** | `./stop.sh && ./start.sh` |

---

## 🐛 Troubleshooting

### Erro: "Porta já em uso"

```bash
# Parar containers
./stop.sh

# Verificar processos
sudo lsof -i :3000
sudo lsof -i :8080

# Matar processos
sudo kill -9 <PID>

# Tentar novamente
./start.sh
```

### Erro: "Containers não iniciam"

```bash
# Ver logs
docker compose logs

# Reconstruir do zero
docker compose down -v
docker compose build --no-cache
docker compose up -d
```

### Erro: "Frontend não conecta no backend"

```bash
# Testar backend
curl http://localhost:8080/health

# Ver logs do backend
docker compose logs -f backend

# Verificar variável de ambiente
docker compose exec frontend env | grep VITE_API_URL
```

---

## 📚 Documentação Adicional

- **README.md** - Visão geral do projeto
- **doc/DOCKER_SETUP_FIX.md** - Correções detalhadas
- **doc/IMPLEMENTATION_SUMMARY.md** - Resumo da implementação
- **doc/GCP_QUICK_START.md** - Deploy no GCP

---

## ✅ Checklist de Verificação

Antes de fazer deploy:

- [ ] Testes locais passando (`./start.sh`)
- [ ] Frontend acessível (http://localhost:3000)
- [ ] Backend respondendo (http://localhost:8080/health)
- [ ] Renderização funcionando
- [ ] Logs sem erros críticos
- [ ] Commit e push realizados (`./commit.sh`)

---

**Última Atualização:** 2025-11-16  
**Versão:** 1.0.0  
**Status:** ✅ PRONTO PARA USO

