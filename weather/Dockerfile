# Build stage for React app
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# Production stage
FROM node:20-alpine
WORKDIR /app
COPY package.json ./
RUN npm ci --only=production || npm install --production
COPY server.js ./
COPY --from=builder /app/dist ./dist
EXPOSE 5000
CMD ["node", "server.js"]
