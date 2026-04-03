# ========================================
# Build Stage
# ========================================
FROM node:20.11.1-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# ========================================
# Runtime Stage
# ========================================
FROM nginx:1.27.0-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user for nginx (already in nginx image, but ensure it)
# nginx user already exists in nginx:alpine

# Copy built application from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration
COPY --chown=nginx:nginx nginx.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script for dynamic env variables (if needed later)
RUN mkdir -p /app && chown -R nginx:nginx /app /usr/share/nginx/html /etc/nginx

# Create nginx cache directory with proper permissions
RUN mkdir -p /var/cache/nginx && chown -R nginx:nginx /var/cache/nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:80/index.html || exit 1

# Expose port
EXPOSE 80

# Run as non-root user
USER nginx

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
