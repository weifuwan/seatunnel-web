package org.apache.seatunnel.copilot.intent;

import lombok.Data;

@Data
public class SyncIntent implements Intent {

    private String sourceId;
    private String sourceTable;
    private String sinkId;

    @Override
    public IntentType getType() {
        return IntentType.SYNC;
    }

}
