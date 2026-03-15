package org.apache.seatunnel.web.api.service;

public interface BaseService {
    /**
     * check checkDescriptionLength
     *
     * @param description input String
     * @return ture if Length acceptable, Length exceeds return false
     */
    boolean checkDescriptionLength(String description);
}
