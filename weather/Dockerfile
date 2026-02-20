# Build stage for React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
LABEL org.opencontainers.image.source="https://github.com/JongoDB/sliver-weather"
LABEL org.opencontainers.image.description="Cover weather app for sliver-weather training lab. React SPA with live Open-Meteo data and OS-aware implant delivery disguised as software downloads."
RUN apk add --no-cache zip
WORKDIR /app
COPY package.json ./
RUN npm ci --only=production || npm install --production
COPY server.js ./
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["node", "server.js"]
