package org.apache.seatunnel.admin;

import com.typesafe.config.Config;
import com.typesafe.config.ConfigFactory;
import com.typesafe.config.ConfigRenderOptions;

public class HoconNestedObject {

    public static void main(String[] args) throws Exception {

        Config config = ConfigFactory.parseString(
                "env.job.mode=\"BATCH\"\n" +
                        "env.job.parallelism=3"
        );

        String hocon = config.root().render(ConfigRenderOptions
                .defaults()
                .setOriginComments(false)
                .setJson(false));

        System.out.println(hocon);

        String mode = config.getString("env.job.mode");  // 返回 "BATCH"
        System.out.println("mode = " + mode);
        int parallelism = config.getInt("env.job.parallelism");  // 返回 3
    }
}