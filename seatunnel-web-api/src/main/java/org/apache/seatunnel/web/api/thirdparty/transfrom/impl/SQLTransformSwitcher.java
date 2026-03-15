package org.apache.seatunnel.web.api.thirdparty.transfrom.impl;

import com.google.auto.service.AutoService;
import com.typesafe.config.Config;
import org.apache.seatunnel.web.api.thirdparty.transfrom.TransformConfigSwitcher;
import org.apache.seatunnel.web.api.thirdparty.transfrom.domain.Transform;
import org.apache.seatunnel.web.api.thirdparty.transfrom.domain.TransformOptions;

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
