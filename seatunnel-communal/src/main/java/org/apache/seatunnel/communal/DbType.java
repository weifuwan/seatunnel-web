package org.apache.seatunnel.communal;

import com.baomidou.mybatisplus.annotation.EnumValue;
import lombok.Getter;

import java.util.Arrays;
import java.util.Map;
import java.util.function.Function;

import static java.util.stream.Collectors.toMap;

@Getter
public enum DbType {

    MYSQL("MYSQL", "MYSQL", "MYSQL"),
    PGSQL("PGSQL", "PGSQL", "PGSQL");

    private static final Map<String, DbType> DB_TYPE_MAP =
            Arrays.stream(DbType.values()).collect(toMap(DbType::getCode, Function.identity()));

    @EnumValue
    private final String code;
    private final String name;
    private final String descp;

    DbType(String code, String name, String descp) {
        this.code = code;
        this.name = name;
        this.descp = descp;
    }

    public static DbType of(String type) {
        if (DB_TYPE_MAP.containsKey(type)) {
            return DB_TYPE_MAP.get(type);
        }
        return null;
    }
}

