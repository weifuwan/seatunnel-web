FROM nginx:latest

RUN rm -rf /etc/nginx/conf.d/*

COPY ./nginx.conf /etc/nginx/nginx.conf

COPY ./dist/ /usr/share/nginx/html/

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]