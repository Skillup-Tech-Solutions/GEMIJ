# Multi-stage build for Academic Journal Platform
FROM node:18-alpine AS base

# Build server
FROM base AS server-builder
WORKDIR /app/server
COPY server/package*.json ./
COPY server/prisma ./prisma/
RUN npm ci --only=production
COPY server/ ./
RUN npx prisma generate
RUN npm run build

# Build client  
FROM base AS client-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm ci --only=production
COPY client/ ./
ARG VITE_API_URL=http://localhost:5000/api
ARG VITE_STRIPE_PUBLISHABLE_KEY
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_STRIPE_PUBLISHABLE_KEY=$VITE_STRIPE_PUBLISHABLE_KEY
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Install Node.js for the API server
RUN apk add --no-cache nodejs npm dumb-init

# Create app directory
WORKDIR /app

# Copy server build
COPY --from=server-builder /app/server/dist ./server/dist
COPY --from=server-builder /app/server/node_modules ./server/node_modules
COPY --from=server-builder /app/server/package*.json ./server/
COPY --from=server-builder /app/server/prisma ./server/prisma

# Copy client build to nginx
COPY --from=client-builder /app/client/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/nginx.conf /etc/nginx/nginx.conf

# Create uploads directory
RUN mkdir -p /app/uploads

# Create startup script
RUN echo '#!/bin/sh' > /start.sh && \
    echo 'cd /app/server && node dist/index.js &' >> /start.sh && \
    echo 'nginx -g "daemon off;"' >> /start.sh && \
    chmod +x /start.sh

# Expose ports
EXPOSE 80 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:80/ || exit 1

# Start both services
CMD ["/start.sh"]