FROM alpine

ENV CONSOLE_LOG=1

COPY ./ /app/
WORKDIR /app

RUN /sbin/apk add --no-cache openssl-dev \
    curl \
    nodejs-npm \
    nodejs-current \
    openssl \
    ca-certificates \
    && npm install

VOLUME /config
CMD ["npm", "start"]
