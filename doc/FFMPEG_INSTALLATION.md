# 🎬 Instalação do FFmpeg - Guia Rápido

## ⚠️ Problema
O backend precisa do FFmpeg nativo (binário C) para renderizar vídeos. Sem ele, o renderização falha com erro `ENOENT`.

## ✅ Solução

### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install -y ffmpeg
```

### Linux (CentOS/RedHat)
```bash
sudo yum install -y ffmpeg
```

### macOS
```bash
brew install ffmpeg
```

### Windows
Baixar de: https://ffmpeg.org/download.html

## 🔍 Verificar Instalação

```bash
ffmpeg -version
```

Deve retornar algo como:
```
ffmpeg version 6.0.1 Copyright (c) 2000-2023
```

## 🚀 Após Instalar

1. Reiniciar o backend:
```bash
cd /home/deysi/workspace/videoclip-gen/backend
npm run dev
```

2. Tentar renderizar novamente no frontend

---

## 📝 Notas

- ✅ FFmpeg é necessário APENAS no backend
- ✅ Frontend não precisa (usa API)
- ✅ Em Docker, já está incluído no `backend/Dockerfile`

---

**Status:** ⏳ Aguardando FFmpeg ser instalado para continuar testes

