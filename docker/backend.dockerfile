FROM java:8u111

ENV DOCKER true
ENV TZ Asia/Shanghai
ENV SEATUNNEL_WEB_HOME /opt/app/seatunnel-web

WORKDIR $SEATUNNEL_WEB_HOME

RUN mkdir -p $SEATUNNEL_WEB_HOME/bin

ADD ./seatunnel-admin.jar $SEATUNNEL_WEB_HOME/
ADD ./seatunnel-web-backend-daemon.sh $SEATUNNEL_WEB_HOME/bin

RUN chmod +x $SEATUNNEL_WEB_HOME/bin/seatunnel-web-backend-daemon.sh

EXPOSE 8080

CMD [ "/bin/sh", "/opt/app/seatunnel-web/bin/seatunnel-web-backend-daemon.sh", "start" ]