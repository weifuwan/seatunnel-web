package org.apache.seatunnel.web.engine.client.exceptions;



public class SeatunnelClientException extends RuntimeException {
    private final int httpStatus;
    private final String responseBody;

    public SeatunnelClientException(String message, int httpStatus, String responseBody, Throwable cause) {
        super(message, cause);
        this.httpStatus = httpStatus;
        this.responseBody = responseBody;
    }

    public int getHttpStatus() { return httpStatus; }
    public String getResponseBody() { return responseBody; }
}