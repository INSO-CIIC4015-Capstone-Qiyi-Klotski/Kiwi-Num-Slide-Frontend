# ---- Build (Node 18) ----
FROM node:18-alpine AS build
WORKDIR /app

ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

COPY package.json package-lock.json* ./
RUN npm ci
COPY . .

RUN NEXT_PUBLIC_API_URL="$NEXT_PUBLIC_API_URL" npm run build

# ---- Runtime (Nginx) ----
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html
EXPOSE 80  
