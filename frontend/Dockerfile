# Dockerfile - Frontend
# Multi-stage build para DreamDirector AI Frontend (React + Vite)

# Stage 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar package.json
COPY package*.json ./

# Instalar dependências usando npm install
RUN npm install --legacy-peer-deps

# Copiar código fonte
COPY . .

# Build da aplicação React + Vite
RUN npm run build || true

# Verificar que dist foi criado
RUN if [ ! -d "dist" ]; then echo "ERROR: dist directory not created!"; exit 1; fi

# Stage 2: Runtime stage (produção)
FROM nginx:alpine

# Remover default nginx config
RUN rm -rf /etc/nginx/conf.d/*

# Copiar arquivos de build do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html/

# Usar nginx config padrão que já vem no nginx:alpine
# Ou se precisar de config customizada, passar via -v ou usar dockerfile na raiz

# Criar config nginx simples inline
RUN printf '%s\n' \
  'user nginx;' \
  'worker_processes auto;' \
  'error_log /var/log/nginx/error.log warn;' \
  'pid /var/run/nginx.pid;' \
  '' \
  'events { worker_connections 1024; }' \
  '' \
  'http {' \
  '  include /etc/nginx/mime.types;' \
  '  default_type application/octet-stream;' \
  '  sendfile on;' \
  '  tcp_nopush on;' \
  '  tcp_nodelay on;' \
  '  keepalive_timeout 65;' \
  '  types_hash_max_size 2048;' \
  '  client_max_body_size 500M;' \
  '  gzip on;' \
  '  gzip_vary on;' \
  '  gzip_comp_level 6;' \
  '  gzip_types text/plain text/css text/xml text/javascript application/json;' \
  '  server {' \
  '    listen 8080;' \
  '    server_name _;' \
  '    root /usr/share/nginx/html;' \
  '    index index.html;' \
  '    add_header X-Frame-Options "SAMEORIGIN" always;' \
  '    add_header X-Content-Type-Options "nosniff" always;' \
  '    add_header Cross-Origin-Embedder-Policy "require-corp" always;' \
  '    add_header Cross-Origin-Resource-Policy "cross-origin" always;' \
  '    location / {' \
  '      try_files $uri $uri/ /index.html;' \
  '    }' \
  '    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {' \
  '      expires 1y;' \
  '      add_header Cache-Control "public, immutable";' \
  '    }' \
  '    location /health {' \
  '      return 200 "healthy";' \
  '      add_header Content-Type text/plain;' \
  '    }' \
  '  }' \
  '}' > /etc/nginx/nginx.conf

# Verificar config
RUN nginx -t

# Expor porta
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://localhost:8080/health || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]

