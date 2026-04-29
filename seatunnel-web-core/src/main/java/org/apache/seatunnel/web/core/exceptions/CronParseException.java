package org.apache.seatunnel.web.core.exceptions;

public class CronParseException extends Exception {

    public CronParseException(String message) {
        super(message);
    }

    public CronParseException(String message, Throwable throwable) {
        super(message, throwable);
    }
}
