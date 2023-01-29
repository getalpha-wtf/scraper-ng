FROM node:16.14-alpine

WORKDIR /home/scraper
RUN addgroup -S scraper && adduser -S -G scraper scraper \
    && chown -R scraper:scraper /home/scraper
USER scraper


COPY --chown=scraper:scraper node_modules/ ./node_modules
COPY --chown=scraper:scraper apps/coins/index.js ./
COPY --chown=scraper:scraper apps/coins/models.js ./

CMD ["index.js"]