package org.apache.seatunnel.web.api.service;


import jakarta.servlet.http.HttpServletRequest;
import org.apache.seatunnel.web.dao.entity.Session;
import org.apache.seatunnel.web.dao.entity.User;

/**
 * session service
 */
public interface SessionService {

    /**
     * get user session from request
     *
     * @param request request
     * @return session
     */
    Session getSession(HttpServletRequest request);

    /**
     * create session
     *
     * @param userPO user
     * @param ip ip
     * @return session string
     */
    String createSession(User userPO, String ip);

    /**
     * sign out
     * remove ip restrictions
     *
     * @param ip   no use
     * @param loginUserPO login user
     */
    void signOut(String ip, User loginUserPO);
}
