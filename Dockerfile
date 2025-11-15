# Dockerfile
# Multi-stage build para DreamDirector AI

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && \
    npm cache clean --force

# Copiar source code
COPY . .

# Build da aplicação React + Vite
RUN npm run build

# Stage 2: Runtime stage (produção)
FROM node:18-alpine

WORKDIR /app

# Instalar nginx para servir a app
RUN apk add --no-cache nginx

# Copiar arquivos de build do stage anterior
COPY --from=builder /app/dist ./dist

# Copiar nginx config
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar package.json para referência
COPY package*.json ./

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

