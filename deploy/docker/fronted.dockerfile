FROM node:20-alpine

WORKDIR /app

COPY ../../seatunnel-ui/* ./seatunnel-ui/

RUN yarn start

EXPOSE 8000