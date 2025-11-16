<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# 🎬 DreamDirector AI - Video Clip Generation Platform

> **AI-powered video generation platform that transforms creative ideas into professional video clips using Google's Gemini API and FFmpeg native rendering.**

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue)](https://www.docker.com/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()

---

## 🎯 O Que É?

**DreamDirector AI** é uma plataforma web completa para geração de videoclipes profissionais usando:

- 🤖 **Inteligência Artificial (Google Gemini)** - Interpreta seus prompts e gera roteiros detalhados
- 🎨 **Geração de Imagens** - Cria cenas visuais baseadas no roteiro
- 🎬 **Renderização com FFmpeg** - Concatena cenas e sincroniza com áudio
- ⚡ **Backend Nativo** - Processamento rápido com FFmpeg nativo (5-10 minutos vs 30+ minutos)

### O que você consegue fazer:

1. **Descrever uma ideia** em texto (ex: "Um videoclipe inspirador sobre transformação pessoal")
2. **Sistema gera automaticamente:**
   - ✅ Roteiro detalhado com 5+ cenas
   - ✅ Imagens para cada cena usando IA
   - ✅ Vídeos com efeitos para cada cena
3. **Você aprova ou regenera** as cenas
4. **Renderiza o vídeo final** com áudio sincronizado
5. **Download automático** do MP4 pronto

---

## 🏗️ Arquitetura

### Como Funciona (Fluxo Completo)

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React)                        │
│  - Upload de áudio / descrição do projeto                  │
│  - Preview de cenas geradas                                │
│  - Aprovação/Rejeição de cenas                             │
│  - Download do vídeo final                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP API (FormData)
                       ↓
┌──────────────────────────────────────────────────────────────┐
│                   Backend (Express.js)                       │
│  - Recebe vídeos + áudio via FormData                       │
│  - Orquestra renderização com FFmpeg                        │
│  - Rastreia status de jobs em SQLite                        │
│  - Serve vídeos finalizados                                 │
└──────────────────────┬──────────────────────────────────────┘
                       │ FFmpeg exec()
                       ↓
┌──────────────────────────────────────────────────────────────┐
│              FFmpeg Nativo (C/C++)                           │
│  - Concatenação de vídeos: concat filter                    │
│  - Sincronização de áudio: -shortest flag                   │
│  - Encoding VP9: realtime mode (rápido)                     │
│  - Output: MP4 otimizado para streaming                     │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌──────────────────────────────────────────────────────────────┐
│           Vídeo Final (9-10 MB MP4)                          │
│  ✅ 5+ cenas concatenadas                                    │
│  ✅ Áudio sincronizado                                       │
│  ✅ Qualidade VP9 (visualmente lossless)                     │
│  ✅ Pronto para streaming/distribuição                       │
└──────────────────────────────────────────────────────────────┘
```

### Estrutura do Projeto

```
videoclip-gen/ (Monorepo)
│
├── 📄 README.md                 ← Você está aqui
├── 📦 package.json              ← Root workspace config
├── 🐳 Dockerfile                ← Build produção (frontend)
├── 🐳 backend/Dockerfile        ← Build produção (backend)
├── 🐳 docker-compose.yml        ← Orquestra local
│
├── 📂 frontend/                 ← React + Vite + Tailwind
│   ├── src/
│   │   ├── App.tsx
│   │   ├── components/          ← UI components
│   │   ├── services/
│   │   │   ├── renderService.ts ← API client
│   │   │   ├── geminiService.ts ← IA integration
│   │   │   └── utils.ts
│   │   └── index.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── 📂 backend/                  ← Express + FFmpeg
│   ├── src/
│   │   ├── index.ts             ← API server (3 rotas)
│   │   ├── worker.ts            ← FFmpeg executor
│   │   ├── db.ts                ← SQLite queries
│   │   └── types.ts
│   ├── package.json
│   ├── tsconfig.json
│   └── dist/                    ← Compiled JS
│
├── 📂 doc/                      ← Documentação
│   ├── SUCCESS.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── ... (15 mais)
│
└── 🔧 Configs
    ├── cloudbuild.yaml          ← CI/CD (GCP)
    ├── nginx.conf               ← Reverse proxy
    └── .dockerignore

```

---

## 🚀 Como Rodar Localmente

### Pré-requisitos

- **Node.js 18+** - [Download](https://nodejs.org/)
- **FFmpeg** - Necessário apenas no backend
  ```bash
  # Ubuntu/Debian
  sudo apt-get install -y ffmpeg

  # macOS
  brew install ffmpeg

  # CentOS/RedHat
  sudo yum install -y ffmpeg
  ```
- **Docker** (opcional) - Para produção local

### Opção 1: Desenvolvimento (Recomendado)

```bash
# 1️⃣ Clone o projeto
git clone https://github.com/DeysiLopes/videoclip-gen.git
cd videoclip-gen

# 2️⃣ Terminal 1 - Frontend
cd frontend
npm install
npm run dev
# → http://localhost:5173

# 3️⃣ Terminal 2 - Backend
cd backend
npm install
npm run dev
# → http://localhost:3000

# 4️⃣ Abra http://localhost:5173 no navegador
```

### Opção 2: Docker Compose (Produção Local)

```bash
# 1️⃣ Clone o projeto
git clone https://github.com/DeysiLopes/videoclip-gen.git
cd videoclip-gen

# 2️⃣ Inicie com Docker Compose
docker-compose up --build

# → Frontend: http://localhost:8080
# → Backend: http://localhost:3000 (interno)
```

### Opção 3: Produção (GCP Cloud Run)

```bash
# Veja doc/GCP_QUICK_START.md para instruções detalhadas
```

---

## 📊 Stack Tecnológico

### Frontend
- **React 19** - UI framework
- **Vite 6** - Build tool (ultra-rápido)
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling utilities
- **Lucide React** - Icons
- **FFmpeg WASM** - Video preview (local)

### Backend
- **Node.js 18+** - Runtime
- **Express.js** - Web framework
- **FFmpeg nativo** - Video encoding/concatenation
- **better-sqlite3** - Lightweight database
- **Multer** - File uploads
- **TypeScript** - Type safety

### DevOps
- **Docker** - Containerization
- **Cloud Build** - CI/CD (GCP)
- **Cloud Run** - Serverless deployment
- **nginx** - Reverse proxy

---

## 🎬 API Endpoints

### POST `/api/render`
Inicia renderização de vídeo
```bash
curl -X POST http://localhost:3000/api/render \
  -F "projectId=proj-123" \
  -F "video_0=@scene1.mp4" \
  -F "video_1=@scene2.mp4" \
  -F "audio=@music.mp3"

# Response:
{
  "jobId": "uuid-123",
  "status": "queued",
  "message": "Render job queued successfully"
}
```

### GET `/api/status/:jobId`
Status da renderização
```bash
curl http://localhost:3000/api/status/uuid-123

# Response:
{
  "jobId": "uuid-123",
  "status": "processing",
  "progress": 45,
  "error": null
}
```

### GET `/api/download/:jobId`
Download do vídeo finalizado
```bash
curl http://localhost:3000/api/download/uuid-123 > video.mp4
```

---

## 📈 Performance

| Métrica | Antes (WASM) | Depois (Backend) | Melhoria |
|---------|------------|-----------------|---------|
| **Tempo de Encode** | ~30 minutos | 5-10 minutos | **3-6x mais rápido** |
| **Tamanho Frontend** | 50MB+ | 10MB | **5x menor** |
| **UI Responsividade** | Trava | Fluida (API) | **Sempre responsivo** |
| **Usuários simultâneos** | 1 | ∞ | **Escalável** |
| **Progresso Real-time** | ❌ | ✅ | **Melhorado** |

---

## 🔐 Segurança

- ✅ CORS habilitado para localhost (dev)
- ✅ Limite de upload: 500MB por arquivo
- ✅ Validação de types em TypeScript
- ✅ Sanitização de paths (prevenção directory traversal)
- ✅ Health checks em Docker

---

## 📚 Documentação Adicional

Todos os documentos estão em `/doc/`:

| Documento | Descrição |
|-----------|-----------|
| [SUCCESS.md](./doc/SUCCESS.md) | Resumo do sucesso do projeto |
| [IMPLEMENTATION_SUMMARY.md](./doc/IMPLEMENTATION_SUMMARY.md) | Visão técnica completa |
| [BACKEND_CREATED.md](./doc/BACKEND_CREATED.md) | Detalhes do backend |
| [GCP_QUICK_START.md](./doc/GCP_QUICK_START.md) | Deploy no Google Cloud |
| [FFMPEG_INSTALLATION.md](./doc/FFMPEG_INSTALLATION.md) | Como instalar FFmpeg |

---

## 🛠️ Troubleshooting

### ❌ "FFmpeg not found"
```bash
# Ubuntu/Debian
sudo apt-get install -y ffmpeg

# macOS
brew install ffmpeg
```

### ❌ "Port 3000 already in use"
```bash
# Matar processo na porta 3000
lsof -ti:3000 | xargs kill -9

# Ou usar outra porta
PORT=3001 npm run dev
```

### ❌ "CORS error"
- Certificar que backend rodando em http://localhost:3000
- Frontend deve estar em http://localhost:5173 (dev) ou http://localhost:8080 (docker)

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 👨‍💻 Autor

**Deysi Lopes**
- GitHub: [@DeysiLopes](https://github.com/DeysiLopes)
- Projeto: [videoclip-gen](https://github.com/DeysiLopes/videoclip-gen)

---

## 📄 Licença

Este projeto é licenciado sob a **Apache License 2.0** - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 🎯 Roadmap

- [x] Frontend com React
- [x] Backend com Express
- [x] FFmpeg nativo integrado
- [x] SQLite database
- [x] API REST completa
- [ ] Redis queue para jobs paralelos
- [ ] S3/GCS para armazenamento de vídeos
- [ ] Autenticação com OAuth
- [ ] Dashboard de analytics
- [ ] Suporte para múltiplos formatos de output

---

## 📞 Suporte

Para dúvidas ou issues:

1. Verifique `/doc/` para documentação
2. Abra uma [Issue no GitHub](https://github.com/DeysiLopes/videoclip-gen/issues)
3. Veja [FFMPEG_INSTALLATION.md](./doc/FFMPEG_INSTALLATION.md) para problemas de setup

---

**Feito com ❤️ por Deysi Lopes**

[![Stars](https://img.shields.io/github/stars/DeysiLopes/videoclip-gen?style=social)](https://github.com/DeysiLopes/videoclip-gen)

