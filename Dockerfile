# Dockerfile - Frontend
# Multi-stage build para DreamDirector AI Frontend (React + Vite)
# Contexto: . (raiz do projeto)

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json da raiz
COPY package*.json ./

# Instalar dependências da raiz (workspace)
RUN npm install --legacy-peer-deps

# Copiar código fonte frontend (TODOS os arquivos do frontend)
COPY frontend ./frontend


# Instalar dependências do frontend
WORKDIR /app/frontend
RUN npm install --legacy-peer-deps

# Build da aplicação React + Vite
RUN npm run build

# Verificar que dist foi criado
RUN if [ ! -d "dist" ]; then echo "ERROR: dist directory not created!"; ls -la /app/frontend; exit 1; fi

# Stage 2: Runtime stage (produção)
FROM nginx:alpine

# Remover default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Copiar arquivos de build do stage anterior
COPY --from=builder /app/frontend/dist /usr/share/nginx/html/

# Copiar nginx config da raiz
COPY nginx.conf /etc/nginx/nginx.conf

# Verificar config
RUN nginx -t

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]



