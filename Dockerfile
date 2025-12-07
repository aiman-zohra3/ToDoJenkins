
FROM node:18-alpine as base

RUN apk add --no-cache \
    chromium \
    chromium-chromedriver \
    ca-certificates \
    git \
    python3 \
    make \
    g++ \
    && rm -rf /var/cache/apk/*

WORKDIR /usr/src/app


COPY package*.json ./


RUN npm install --production --silent


COPY . .


ENV CHROME_BIN=/usr/bin/chromium-browser
ENV CHROMEDRIVER_PATH=/usr/bin/chromedriver


ENV NODE_ENV=production
ENV TEST_BASE_URL=http://localhost:5000


EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:5000', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})"

# Default command
CMD ["node", "app.js"]
