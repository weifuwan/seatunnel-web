package org.apache.seatunnel.plugin.datasource.mysql.param;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.seatunnel.communal.BaseConnectionParam;
import org.apache.seatunnel.communal.KeyValuePair;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@EqualsAndHashCode(callSuper = true)
public class MySQLConnectionParam extends BaseConnectionParam {

    protected List<KeyValuePair> other;

    public Map<String, String> getOtherAsMap() {
        if (other == null) {
            return new HashMap<>();
        }
        return other.stream()
                .filter(item -> item != null && item.getKey() != null && item.getValue() != null)
                .collect(Collectors.toMap(KeyValuePair::getKey, KeyValuePair::getValue));
    }

    @Override
    public String toString() {
        return "MySQLConnectionParam{" +
                "user='" + user + '\'' +
                ", password='" + password + '\'' +
                ", database='" + database + '\'' +
                ", url='" + url + '\'' +
                ", driverLocation='" + driverLocation + '\'' +
                ", driver='" + driver + '\'' +
                ", dbType=" + dbType +
                ", other=" + other +
                '}';
    }
}
