
package org.apache.seatunnel.plugin.datasource.connection.config;

import java.io.Serializable;
import java.sql.Driver;


public class DriverEntry implements Serializable {
    private static final long serialVersionUID = 1L;

    private DriverConfig driverConfig;

    private Driver driver;

    public DriverEntry(DriverConfig driverConfig, Driver driver) {
        this.driverConfig = driverConfig;
        this.driver = driver;
    }

    public static long getSerialVersionUID() {
        return serialVersionUID;
    }

    public DriverConfig getDriverConfig() {
        return driverConfig;
    }

    public void setDriverConfig(DriverConfig driverConfig) {
        this.driverConfig = driverConfig;
    }

    public Driver getDriver() {
        return driver;
    }

    public void setDriver(Driver driver) {
        this.driver = driver;
    }
}