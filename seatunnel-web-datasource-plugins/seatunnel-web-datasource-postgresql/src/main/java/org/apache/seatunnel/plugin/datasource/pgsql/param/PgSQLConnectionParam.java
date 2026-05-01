package org.apache.seatunnel.plugin.datasource.pgsql.param;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.commons.collections4.MapUtils;
import org.apache.seatunnel.web.common.KeyValuePair;
import org.apache.seatunnel.web.common.deserializer.KeyValuePairListDeserializer;
import org.apache.seatunnel.web.spi.datasource.BaseConnectionParam;
import org.apache.seatunnel.web.spi.form.FieldType;
import org.apache.seatunnel.web.spi.form.FormField;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * PostgreSQL Connection Parameters
 */
@Data
@EqualsAndHashCode(callSuper = true)
public class PgSQLConnectionParam extends BaseConnectionParam {

    /**
     * Database Host
     */
    @FormField(label = "Host", order = 2, placeholder = "Please enter the host")
    protected String host;

    /**
     * Database Port
     */
    @FormField(label = "Port", defaultValue = "5432", order = 3, type = FieldType.NUMBER, placeholder = "Please enter the port")
    protected String port;

    /**
     * Connection parameters
     */
    @FormField(label = "Connection Parameters", order = 7, type = FieldType.CUSTOM_SELECT,
            defaultValue = "[{\"key\":\"ssl\",\"value\":\"false\"},{\"key\":\"stringtype\",\"value\":\"unspecified\"}]")
    protected List<KeyValuePair> other;

    /**
     * Schema Name
     */
    @FormField(label = "Schema", order = 9, defaultValue = "public", placeholder = "Please enter the schema name")
    protected String schemaName;

    /**
     * Convert other parameters to Map
     */
    public Map<String, String> getOtherAsMap() {
        Map<String, String> result = new HashMap<>();
        if (other != null && !other.isEmpty()) {
            for (KeyValuePair kv : other) {
                if (kv != null && kv.getKey() != null && kv.getValue() != null) {
                    result.put(kv.getKey(), kv.getValue());
                }
            }
        }
        return result;
    }

    /**
     * Set other parameters from Map
     */
    public void setOtherFromMap(Map<String, String> map) {
        List<KeyValuePair> list = new ArrayList<>();
        if (MapUtils.isNotEmpty(map)) {
            map.forEach((k, v) -> list.add(new KeyValuePair(k, v)));
        }
        this.other = list;
    }

    @Override
    public String toString() {
        return "PgSQLConnectionParam{" +
                "user='" + user + '\'' +
                ", password='" + password + '\'' +
                ", database='" + database + '\'' +
                ", schemaName='" + schemaName + '\'' +
                ", url='" + url + '\'' +
                ", driverLocation='" + driverLocation + '\'' +
                ", driver='" + driver + '\'' +
                ", dbType=" + dbType +
                '}';
    }
}
