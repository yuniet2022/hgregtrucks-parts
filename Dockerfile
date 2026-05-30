FROM node:20-slim
WORKDIR /app

# Install nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Install deps
COPY package*.json ./
RUN npm install

# Create uploads directory
RUN mkdir -p /app/uploads

# Copy source and build
COPY . .
RUN npm run build

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -f /etc/nginx/sites-enabled/default

# Copy start script
COPY start.sh /start.sh
RUN chmod +x /start.sh

# Railway provides PORT env var (default 3000)
EXPOSE 3000

CMD ["/start.sh"]
