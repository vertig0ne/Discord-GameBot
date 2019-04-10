FROM alpine

ENV CONSOLE_LOG=1

COPY ./ /app/
WORKDIR /app

RUN apk add --no-cache build-base \
        openssl-dev \
        curl \
        git \
        su-exec \
        python \
        nodejs-current \
        nodejs-npm \
        ffmpeg \
    && npm install

VOLUME /config
CMD ["npm", "start"]
