package org.apache.seatunnel.plugin.datasource.connection.driver;


import java.io.Closeable;
import java.sql.Driver;

public final class DriverHandle implements Closeable {
    private final Driver driver;
    private final ClassLoaderStrategy.ManagedClassLoader managedClassLoader;
    private final String identifier;

    public DriverHandle(Driver driver, ClassLoaderStrategy.ManagedClassLoader managedClassLoader, String identifier) {
        this.driver = driver;
        this.managedClassLoader = managedClassLoader;
        this.identifier = identifier;
    }

    public Driver driver() { return driver; }
    public String identifier() { return identifier; }

    @Override
    public void close() {
    }
}
