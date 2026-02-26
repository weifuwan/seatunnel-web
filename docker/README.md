## build Docker image
```shell
docker  build  -t seatunnel-web:1.0.0 -f backend.dockerfile .

docker-compose up -d

docker run --name seatunnel-web \
        -d -p 9527:8080 \
        --privileged=true \
        --restart=always \
        seatunnel-web:1.0.0
```


```shell
docker  build  -t seatunnel-web-ui:1.0.0 -f fronted.dockerfile .
```
