# Dockerfile - Backend Express + FFmpeg
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files do backend
COPY package*.json ./

# Instalar dependências
RUN npm install --legacy-peer-deps

# Copiar source do backend
COPY src ./src
COPY tsconfig.json ./

# Build TypeScript
RUN npm run build 2>/dev/null || echo "Build script not found, skipping..."

# Runtime stage
FROM node:18-alpine

WORKDIR /app

# Instalar FFmpeg (necessário para backend renderizar vídeos)
RUN apk add --no-cache ffmpeg

# Copiar package files
COPY package*.json ./

# Instalar apenas dependências de produção
RUN npm install --production --legacy-peer-deps

# Copiar build do stage anterior
COPY --from=builder /app/dist ./dist

# Criar diretórios para dados
RUN mkdir -p data tmp renders

# Criar script de inicialização que limpa tmp e renders
RUN cat > /app/entrypoint.sh << 'EOF'
#!/bin/sh
# Limpar diretórios tmp e renders ao iniciar
echo "🧹 Limpando diretórios tmp e renders..."
rm -rf /app/tmp/* /app/renders/*
mkdir -p /app/tmp /app/renders
echo "✅ Diretórios limpos"

# Iniciar aplicação
exec node dist/index.js
EOF

RUN chmod +x /app/entrypoint.sh

# Expor porta
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:3000/health || exit 1

# Start
CMD ["/app/entrypoint.sh"]

