# Frontend build stage
FROM node:20-alpine AS frontend-builder

WORKDIR /app

# Copy from root context
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Final stage - nginx serving the built frontend
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config from frontend directory
COPY --chown=nginx:nginx frontend/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
