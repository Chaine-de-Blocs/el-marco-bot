FROM node:18.1.0

RUN mkdir /home/node/app

COPY src/** /home/node/app

EXPOSE 8888