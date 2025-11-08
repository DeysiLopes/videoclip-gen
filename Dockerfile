FROM node:18-alpine AS build

WORKDIR /app

# copia package.json e package-lock.json (se existir)
COPY package*.json ./

# se package-lock.json existir, npm ci será usado; caso contrário, fallback para npm install
RUN if [ -f package-lock.json ]; then npm ci --silent --prefer-offline; else npm install --silent --prefer-offline; fi

# copia o resto do código
COPY . .

# build do app (assume script "build" no package.json que gera /build ou /dist dependendo do setup)
RUN npm run build

FROM nginx:stable-alpine

# usa nginx que escuta na porta 8080 (Cloud Run espera PORT=8080)
COPY nginx.conf /etc/nginx/nginx.conf

# ajuste conforme a pasta de saída do seu build (ex: build, dist)
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]