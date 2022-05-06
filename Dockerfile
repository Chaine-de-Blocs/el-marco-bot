FROM node:18.1.0

RUN mkdir /home/node/app

COPY src/** /home/node/app
COPY node_modules /home/node/app/node_modules

EXPOSE 8888