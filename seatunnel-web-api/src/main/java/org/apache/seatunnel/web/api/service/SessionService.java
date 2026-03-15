package org.apache.seatunnel.web.api.service;


import com.baomidou.mybatisplus.extension.service.IService;
import org.apache.seatunnel.web.common.bean.po.SessionPO;
import org.apache.seatunnel.web.common.bean.po.UserPO;

import jakarta.servlet.http.HttpServletRequest;

/**
 * session service
 */
public interface SessionService extends IService<SessionPO> {

    /**
     * get user session from request
     *
     * @param request request
     * @return session
     */
    SessionPO getSession(HttpServletRequest request);

    /**
     * create session
     *
     * @param userPO user
     * @param ip ip
     * @return session string
     */
    String createSession(UserPO userPO, String ip);

    /**
     * sign out
     * remove ip restrictions
     *
     * @param ip   no use
     * @param loginUserPO login user
     */
    void signOut(String ip, UserPO loginUserPO);
}
