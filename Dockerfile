FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json .
RUN npm install --production

# Copy server
COPY server.js .

# Expose MCP port
EXPOSE 3456

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3456/health || exit 1

ENV PORT=3456
ENV NODE_ENV=production

CMD ["node", "server.js"]
