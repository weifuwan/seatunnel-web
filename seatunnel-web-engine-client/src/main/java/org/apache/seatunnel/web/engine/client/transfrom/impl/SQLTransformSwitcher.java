package org.apache.seatunnel.web.engine.client.transfrom.impl;

import com.google.auto.service.AutoService;
import com.typesafe.config.Config;
import org.apache.seatunnel.web.engine.client.transfrom.TransformConfigSwitcher;
import org.apache.seatunnel.web.engine.client.transfrom.domain.Transform;
import org.apache.seatunnel.web.engine.client.transfrom.domain.TransformOptions;

@AutoService(TransformConfigSwitcher.class)
public class SQLTransformSwitcher implements TransformConfigSwitcher {
    @Override
    public Transform getTransform() {
        return Transform.SQL;
    }

    @Override
    public Config transform(TransformOptions transformOptions) {
        return null;
    }


}
