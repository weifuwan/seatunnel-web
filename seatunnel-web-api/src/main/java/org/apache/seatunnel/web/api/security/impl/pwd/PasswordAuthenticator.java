package org.apache.seatunnel.web.api.security.impl.pwd;

import org.apache.seatunnel.web.api.security.impl.AbstractAuthenticator;
import org.apache.seatunnel.web.dao.entity.User;

public class PasswordAuthenticator extends AbstractAuthenticator {

    @Override
    public User login(String userId, String password, String extra) {
        return userService.queryUser(userId, password);
    }
}
