FROM node:18-alpine AS build

WORKDIR /app

# copia package.json (e package-lock.json se existir)
COPY package*.json ./

# usa npm ci quando houver lockfile, senão npm install
RUN if [ -f package-lock.json ]; then npm ci --silent --prefer-offline --omit=dev; else npm install --silent --prefer-offline; fi

# copia restante do código e builda
COPY . .
RUN npm run build && \
    if [ -d dist ]; then mv dist out; elif [ -d build ]; then mv build out; else echo "Build output not found (expected dist/ or build/)"; exit 1; fi

FROM nginx:stable-alpine

# nginx deve escutar 8080 (Cloud Run)
COPY nginx.conf /etc/nginx/nginx.conf

# copia saída padronizada
COPY --from=build /app/out /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]