FROM node:16.14-alpine

RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser \
    CHROMIUM_FLAGS=--no-sandbox

WORKDIR /home/scraper

COPY ./ ./

CMD ["apps/nfts/opensea-rankings/index.js"]