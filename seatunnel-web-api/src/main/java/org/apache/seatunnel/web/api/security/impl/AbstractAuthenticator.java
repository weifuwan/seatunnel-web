package org.apache.seatunnel.web.api.security.impl;

import jakarta.annotation.Resource;
import org.apache.seatunnel.web.api.security.Authenticator;
import org.apache.seatunnel.web.api.security.SecurityConfig;
import org.apache.seatunnel.web.api.service.SessionService;
import org.apache.seatunnel.web.api.service.UsersService;
import org.apache.seatunnel.web.common.bean.po.UserPO;
import org.apache.seatunnel.web.common.constant.Constant;
import org.apache.seatunnel.web.common.enums.Flag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

public abstract class AbstractAuthenticator implements Authenticator {

    private static final Logger logger = LoggerFactory.getLogger(AbstractAuthenticator.class);

    @Resource
    protected UsersService userService;

    @Resource
    private SessionService sessionService;

    @Resource
    private SecurityConfig securityConfig;

    @Override
    public Map<String, String> authenticate(String userId, String password, String extra) {
        UserPO userPO = login(userId, password, extra);
        if (userPO == null) {
            throw new RuntimeException("user name or password error");
        }

        if (userPO.getState() == Flag.NO.ordinal()) {
            throw new RuntimeException("The current user is disabled");
        }

        // create session
        String sessionId = sessionService.createSession(userPO, extra);
        if (sessionId == null) {
            throw new RuntimeException("create session failed!");
        }

        logger.info("sessionId : {}", sessionId);
        Map<String, String> data = new HashMap<>();
        data.put(Constant.SESSION_ID, sessionId);
        data.put(Constant.SECURITY_CONFIG_TYPE, securityConfig.getType());
        return data;

    }

    /**
     * user login and return user in db
     *
     * @param userId   user identity field
     * @param password user login password
     * @param extra    extra user login field
     * @return user object in databse
     */
    public abstract UserPO login(String userId, String password, String extra);
}
