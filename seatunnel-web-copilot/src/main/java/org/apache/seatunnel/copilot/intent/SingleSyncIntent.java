package org.apache.seatunnel.copilot.intent;

public class SingleSyncIntent implements Intent {

    private String intentType;
    private Endpoint source;
    private Endpoint sink;

    public SingleSyncIntent() {
    }

    public SingleSyncIntent(String intentType, Endpoint source, Endpoint sink) {
        this.intentType = intentType;
        this.source = source;
        this.sink = sink;
    }

    public void setIntentType(String intentType) {
        this.intentType = intentType;
    }

    public Endpoint getSource() {
        return source;
    }

    public void setSource(Endpoint source) {
        this.source = source;
    }

    public Endpoint getSink() {
        return sink;
    }

    public void setSink(Endpoint sink) {
        this.sink = sink;
    }

    @Override
    public String toString() {
        return "SingleSyncIntent{" +
                "intentType='" + intentType + '\'' +
                ", source=" + source +
                ", sink=" + sink +
                '}';
    }

    @Override
    public String intentType() {
        return intentType;
    }
}