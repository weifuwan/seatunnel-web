## build Docker image
```shell
docker  build  -t seatunnel-web:1.0.0-beta.1 -f backend.dockerfile .

docker-compose up -d

docker-compose down


docker run -it --rm seatunnel-web-ui:1.0.0-beta.1 sh

docker run --name seatunnel-web \
        -d -p 9527:8080 \
        --privileged=true \
        --restart=always \
        seatunnel-web:1.0.0
```

```shell
docker  build  -t seatunnel-web-ui:1.0.0-beta.1 -f fronted.dockerfile .


docker  build  -t seatunnel-web-ui:1.0.0-beta.1 .
```
