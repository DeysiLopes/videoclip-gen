# Dockerfile
# Multi-stage build para DreamDirector AI - Estrutura Monorepo

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files da raiz (monorepo)
COPY package*.json ./

# Copiar package files do frontend
COPY frontend/package*.json ./frontend/

# Instalar dependências (npm ci é mais seguro que npm install em produção)
RUN npm ci

# Copiar código fonte
COPY frontend ./frontend

# Build da aplicação React + Vite
RUN npm run build:frontend

# Stage 2: Runtime stage (produção)
FROM nginx:alpine

WORKDIR /usr/share/nginx/html

# Remover default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Copiar arquivos de build do stage anterior
COPY --from=builder /app/frontend/dist ./

# Copiar FFmpeg files do node_modules para servir localmente (corrige CORS)
COPY --from=builder /app/frontend/node_modules/@ffmpeg/core/dist/esm ./ffmpeg/

# Copiar nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]



