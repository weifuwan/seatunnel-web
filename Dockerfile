FROM node:20-alpine

WORKDIR /app/seatunnel-ui

COPY ./seatunnel-ui .

RUN yarn install

EXPOSE 8000
CMD ["yarn", "start"]