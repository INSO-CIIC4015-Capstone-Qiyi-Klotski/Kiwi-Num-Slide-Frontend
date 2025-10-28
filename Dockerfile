# ---- Build ----
FROM node:18-alpine AS build
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

# Inyecta la URL en build-time (no hace falta copiar .env)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

# (opcional) verifica en logs
RUN echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"

# Con output:'export', next build ya crea /out
RUN npm run build

# ---- Runtime (Nginx) ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80
