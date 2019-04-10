FROM alpine

ENV CONSOLE_LOG=1

COPY ./ /app/
WORKDIR /app

RUN /sbin/apk add --no-cache build-base \
    openssl-dev \
    curl \
    nodejs-npm \
    nodejs-current \
    openssl \
    python \
    ca-certificates \
    && npm install

VOLUME /config
CMD ["npm", "start"]
