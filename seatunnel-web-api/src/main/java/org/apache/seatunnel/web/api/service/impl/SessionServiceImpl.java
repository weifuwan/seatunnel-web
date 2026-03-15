package org.apache.seatunnel.web.api.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.commons.collections.CollectionUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.controller.BaseController;
import org.apache.seatunnel.web.api.dao.SessionMapper;
import org.apache.seatunnel.web.api.service.SessionService;
import org.apache.seatunnel.web.common.bean.po.SessionPO;
import org.apache.seatunnel.web.common.bean.po.UserPO;
import org.apache.seatunnel.web.common.constant.Constant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.WebUtils;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class SessionServiceImpl extends ServiceImpl<SessionMapper, SessionPO>
        implements SessionService {
    private static final Logger logger = LoggerFactory.getLogger(SessionService.class);

    @Override
    public SessionPO getSession(HttpServletRequest request) {
        String sessionId = request.getHeader(Constant.SESSION_ID);

        if (StringUtils.isBlank(sessionId)) {
            Cookie cookie = WebUtils.getCookie(request, Constant.SESSION_ID);

            if (cookie != null) {
                sessionId = cookie.getValue();
            }
        }

        if (StringUtils.isBlank(sessionId)) {
            return null;
        }

        String ip = BaseController.getClientIpAddress(request);
        logger.debug("get session: {}, ip: {}", sessionId, ip);

        return getById(sessionId);
    }

    @Override
    @Transactional
    public String createSession(UserPO userPO, String ip) {
        SessionPO sessionPO = null;

        LambdaQueryWrapper<SessionPO> sessionLambdaQueryWrapper = new LambdaQueryWrapper<>();
        sessionLambdaQueryWrapper.eq(SessionPO::getUserId, userPO.getId());
        // logined
        List<SessionPO> sessionPOList = getBaseMapper().selectList(sessionLambdaQueryWrapper);

        Date now = new Date();

        /*
         * if you have logged in and are still valid, return directly
         */
        if (CollectionUtils.isNotEmpty(sessionPOList)) {
            // is session list greater 1 ， delete other ，get one
            if (sessionPOList.size() > 1) {
                for (int i = 1; i < sessionPOList.size(); i++) {
                    removeById(sessionPOList.get(i).getId());
                }
            }
            sessionPO = sessionPOList.get(0);
            if (now.getTime() - sessionPO.getLastLoginTime().getTime() <= Constant.SESSION_TIME_OUT * 1000) {
                /*
                 * updateProcessInstance the latest login time
                 */
                sessionPO.setLastLoginTime(now);
                getBaseMapper().updateById(sessionPO);

                return sessionPO.getId();

            } else {
                /*
                 * session expired, then delete this session first
                 */
                removeById(sessionPO.getId());
            }
        }

        // assign new session
        sessionPO = new SessionPO();

        sessionPO.setId(UUID.randomUUID().toString());
        sessionPO.setIp(ip);
        sessionPO.setUserId(userPO.getId());
        sessionPO.setLastLoginTime(now);

        save(sessionPO);

        return sessionPO.getId();
    }

    @Override
    public void signOut(String ip, UserPO loginUserPO) {
        try {
            /*
             * query session by user id and ip
             */
            LambdaQueryWrapper<SessionPO> sessionLambdaQueryWrapper = new LambdaQueryWrapper<>();
            sessionLambdaQueryWrapper.eq(SessionPO::getUserId, loginUserPO.getId());
            sessionLambdaQueryWrapper.eq(SessionPO::getIp, ip);
            SessionPO sessionPO = getBaseMapper().selectOne(sessionLambdaQueryWrapper);

            //delete session
            removeById(sessionPO.getId());
        } catch (Exception e) {
            logger.warn("userId : {} , ip : {} , find more one session", loginUserPO.getId(), ip);
        }
    }
}
