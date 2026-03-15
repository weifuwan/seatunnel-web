package org.apache.seatunnel.web.api.security.impl.pwd;


import org.apache.seatunnel.web.api.security.impl.AbstractAuthenticator;
import org.apache.seatunnel.web.common.bean.po.UserPO;

public class PasswordAuthenticator extends AbstractAuthenticator {

    @Override
    public UserPO login(String userId, String password, String extra) {
        return userService.queryUser(userId, password);
    }
}
