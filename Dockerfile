# ---- Base deps (instalar dependencias) ----
FROM node:18-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# ---- Build ----
FROM node:18-alpine AS build
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Inyecta la URL en build-time (variables NEXT_PUBLIC_ son válidas tanto en server como en client)
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}

RUN echo "NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL"

# Construye la app (next build)
RUN npm run build

# ---- Runtime ----
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copiamos lo mínimo necesario para correr next start
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000

# Asegúrate de que en package.json tengas: "start": "next start"
CMD ["npm", "start"]
