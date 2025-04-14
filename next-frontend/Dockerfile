FROM node:23.0.0-slim

RUN apt update && \
    apt install openssl procps -y && \
    npm install -g npm@11.3.0

USER node

WORKDIR /home/node/app

CMD [ "tail", "-f", "/dev/null" ]
