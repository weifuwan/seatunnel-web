package org.apache.seatunnel.admin.init;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Arrays;
import java.util.Objects;

public class ConnectionUtils {

    public static final Logger logger = LoggerFactory.getLogger(ConnectionUtils.class);

    private ConnectionUtils() {
        throw new UnsupportedOperationException("Construct ConnectionUtils");
    }

    /**
     * release resource
     *
     * @param resources resources
     */
    public static void releaseResource(AutoCloseable... resources) {

        if (resources == null || resources.length == 0) {
            return;
        }
        Arrays.stream(resources).filter(Objects::nonNull)
                .forEach(resource -> {
                    try {
                        resource.close();
                    } catch (Exception e) {
                        logger.error(e.getMessage(), e);
                    }
                });
    }
}
