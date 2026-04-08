package org.apache.seatunnel.web.core.utils;

public final class SeaTunnelClientUrlUtils {

    private SeaTunnelClientUrlUtils() {
    }

    /** Build normalized baseUrl from address and port. */
    public static String buildBaseUrl(String address, String port) {
        if (port == null) {
            throw new IllegalArgumentException("clientPort不能为空");
        }

        if (address == null || address.trim().isEmpty()) {
            throw new IllegalArgumentException("clientAddress不能为空");
        }

        address = address.trim();

        if (!address.startsWith("http://") && !address.startsWith("https://")) {
            address = "http://" + address;
        }

        if (address.endsWith("/")) {
            address = address.substring(0, address.length() - 1);
        }

        if (!port.trim().isEmpty()) {
            return address + ":" + port.trim();
        }

        return address;
    }
}
