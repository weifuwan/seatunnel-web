package org.apache.seatunnel.plugin.datasource.connection.driver;

import org.apache.seatunnel.plugin.datasource.connection.config.DriverConfig;
import org.apache.seatunnel.plugin.datasource.connection.config.DriverEntry;

import java.io.File;
import java.net.MalformedURLException;
import java.net.URL;
import java.net.URLClassLoader;
import java.sql.*;
import java.util.Map;
import java.util.Objects;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;


public class IDriverManager {
    private static final Map<String, ClassLoader> CLASS_LOADER_MAP = new ConcurrentHashMap<>();
    private static final Map<String, DriverEntry> DRIVER_ENTRY_MAP = new ConcurrentHashMap<>();
    private static final String SQL_STATE_CODE = "08001";

    public static Connection getConnection(String url, DriverConfig driver) throws SQLException {
        Properties info = new Properties();
        return getConnection(url, info, driver);
    }

    public static Connection getConnection(String url, String user, String password, DriverConfig driver)
            throws SQLException {
        Properties info = new Properties();
        if (user != null) {
            info.put("user", user);
        }

        if (password != null) {
            info.put("password", password);
        }

        return getConnection(url, info, driver);
    }

    public static Connection getConnection(String url, String user, String password, DriverConfig driver,
                                           Map<String, Object> properties)
            throws SQLException {
        Properties info = new Properties();
        if (user != null && !user.equals("")) {
            info.put("user", user);
        }
        if (password != null && !password.equals("")) {
            info.put("password", password);
        }
        if (properties != null && !properties.isEmpty()) {
            for (Map.Entry<String, Object> entry : properties.entrySet()) {
                if (entry.getKey() != null && entry.getValue() != null) {
                    info.put(entry.getKey(), entry.getValue());
                }
            }
        }
        return getConnection(url, info, driver);
    }

    public static Connection getConnection(String url, Properties info, DriverConfig driver)
            throws SQLException {
        if (Objects.isNull(url)) {
            throw new SQLException("The url cannot be null", SQL_STATE_CODE);
        }

         DriverEntry driverEntry = DRIVER_ENTRY_MAP.get(driver.getJdbcDriver());
        if (Objects.isNull(driverEntry)) {
            driverEntry = getJDBCDriver(driver);
        }
        Connection connection;
        try {
            connection = driverEntry.getDriver().connect(url, info);
            if (Objects.isNull(connection)) {
                throw new SQLException(String.format("driver.connect return null , No suitable driver found for url %s", url), SQL_STATE_CODE);

            }
            return connection;
        } catch (SQLException sqlException) {
            Connection con = tryConnectionAgain(driverEntry, url, info);

            if (Objects.isNull(con)) {
                throw new SQLException(String.format("Cannot create connection (%s)", sqlException.getMessage()), SQL_STATE_CODE,
                        sqlException);
            }

            return con;
        }
    }

    public static DriverPropertyInfo[] getProperty(DriverConfig driver)
            throws SQLException {
        if (Objects.isNull(driver)) {
            return null;
        }
        DriverEntry driverEntry = DRIVER_ENTRY_MAP.get(driver.getJdbcDriver());
        try {
            if (driverEntry == null) {
                driverEntry = getJDBCDriver(driver);
            }
            String url = Objects.isNull(driver.getUrl()) ? "" : driver.getUrl();
            return driverEntry.getDriver().getPropertyInfo(url, null);
        } catch (Exception var7) {
            return null;
        }
    }


    private static Connection tryConnectionAgain(DriverEntry driverEntry, String url,
                                                 Properties info) throws SQLException {
        if (url.contains("mysql")) {
            if (!info.containsKey("useSSL")) {
                info.put("useSSL", "false");
            }
            return driverEntry.getDriver().connect(url, info);
        }
        return null;
    }

    private static DriverEntry getJDBCDriver(DriverConfig driver)
            throws SQLException {
        synchronized (driver) {
            try {
                if (DRIVER_ENTRY_MAP.containsKey(driver.getJdbcDriver())) {
                    return DRIVER_ENTRY_MAP.get(driver.getJdbcDriver());
                }
                ClassLoader cl = getClassLoader(driver);
                Driver d = (Driver) cl.loadClass(driver.getJdbcDriverClass()).newInstance();

                DriverEntry driverEntry = new DriverEntry(driver, d);
                DRIVER_ENTRY_MAP.put(driver.getJdbcDriver(), driverEntry);
                return driverEntry;
            } catch (Exception e) {
                throw new RuntimeException("connection.driver.load.error", e);
            }
        }

    }

    public static ClassLoader getClassLoader(DriverConfig driverConfig) throws MalformedURLException, ClassNotFoundException {
        String jarPath = driverConfig.getJdbcDriver();
        if (CLASS_LOADER_MAP.containsKey(jarPath)) {
            return CLASS_LOADER_MAP.get(jarPath);
        } else {
            synchronized (jarPath) {
                if (CLASS_LOADER_MAP.containsKey(jarPath)) {
                    return CLASS_LOADER_MAP.get(jarPath);
                }
                String[] jarPaths = jarPath.split(",");
                URL[] urls = new URL[jarPaths.length];
                for (int i = 0; i < jarPaths.length; i++) {
                    System.out.println("load driver full path is " + getFullPath(jarPaths[i]));
                    File driverFile = new File(getFullPath(jarPaths[i]));
                    urls[i] = driverFile.toURI().toURL();
                }

                URLClassLoader cl = new URLClassLoader(urls, ClassLoader.getSystemClassLoader());
                System.out.println("ClassLoader class: " + cl.hashCode());

                try {
                    cl.loadClass(driverConfig.getJdbcDriverClass());
                } catch (Exception e) {
                    throw new RuntimeException("load driver class failed", e);
                }
                CLASS_LOADER_MAP.put(jarPath, cl);
                return cl;
            }
        }
    }

    public static String PATH;

    static {
        if (System.getProperty("os.name").toLowerCase().contains("windows")) {
            // Windows 系统使用 D 盘
            PATH = "D:\\jdbc-lib" + File.separator;
        } else {
            // 非 Windows 系统使用用户目录或其他路径
            PATH = "/home/admin" + File.separator + "jdbc-lib" + File.separator;
        }
    }

    public static String getFullPath(String jarPath) {
        return PATH + jarPath;
    }
}
