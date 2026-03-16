package org.apache.seatunnel.web.api.service;


import org.apache.seatunnel.web.dao.entity.User;

/**
 * users service
 */
public interface UsersService  {

    User queryUser(String userId, String password);

    User getUserInfo(User loginUser);

    User getById(int userId);
}
