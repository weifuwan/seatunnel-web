package org.apache.seatunnel.copilot.intent;



public class ValidationError {

    private String code;
    private String path;
    private String message;
    private ErrorLevel level;

    public ValidationError() {
    }

    public ValidationError(String code, String path, String message, ErrorLevel level) {
        this.code = code;
        this.path = path;
        this.message = message;
        this.level = level;
    }

    public String getCode() {
        return code;
    }

    public String getPath() {
        return path;
    }

    public String getMessage() {
        return message;
    }

    public ErrorLevel getLevel() {
        return level;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setLevel(ErrorLevel level) {
        this.level = level;
    }

    @Override
    public String toString() {
        return "ValidationError{" +
                "code='" + code + '\'' +
                ", path='" + path + '\'' +
                ", message='" + message + '\'' +
                ", level=" + level +
                '}';
    }
}
