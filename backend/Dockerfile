# Dockerfile - Backend
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY backend/package*.json ./

# Instalar dependências
RUN npm ci

# Copiar source
COPY backend/src ./src
COPY backend/tsconfig.json ./

# Build TypeScript
RUN npm run build

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Instalar FFmpeg (necessário para backend)
RUN apk add --no-cache ffmpeg

# Copiar package files
COPY backend/package*.json ./

# Instalar apenas dependências de produção
RUN npm ci --only=production

# Copiar build do stage anterior
COPY --from=builder /app/dist ./dist

# Criar diretórios para dados
RUN mkdir -p data tmp renders

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start
CMD ["node", "dist/index.js"]

