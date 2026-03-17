package org.apache.seatunnel.web.api.controller;

import jakarta.annotation.Resource;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.commons.lang3.StringUtils;
import org.apache.seatunnel.web.api.aspect.AccessLogAnnotation;
import org.apache.seatunnel.web.api.security.Authenticator;
import org.apache.seatunnel.web.api.service.SessionService;
import org.apache.seatunnel.web.api.service.UsersService;
import org.apache.seatunnel.web.common.constants.Constants;
import org.apache.seatunnel.web.dao.entity.User;
import org.apache.seatunnel.web.spi.bean.dto.UserDTO;
import org.apache.seatunnel.web.spi.bean.entity.Result;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


/**
 * login controller
 */
@RestController
@RequestMapping("/api/v1")
public class LoginController extends BaseController {

    @Resource
    private SessionService sessionService;

    @Resource
    private Authenticator authenticator;

    @Resource
    private UsersService usersService;

    /**
     * login
     *
     * @param userDTO     userDTO
     * @param request      request
     * @param response     response
     * @return login result
     */

    @PostMapping(value = "/login")
    @AccessLogAnnotation(ignoreRequestArgs = {"userDTO", "request", "response"})
    public Result<Boolean> login(@RequestBody UserDTO userDTO,
                                 HttpServletRequest request,
                                 HttpServletResponse response) {
        // user name check
        if (StringUtils.isEmpty(userDTO.getUserName())) {
            throw new RuntimeException("user name is null");
        }

        String ip = getClientIpAddress(request);

        // verify username and password
        Map<String, String> cookieMap = authenticator.authenticate(userDTO.getUserName(), userDTO.getUserPassword(), ip);

        for (Map.Entry<String, String> cookieEntry : cookieMap.entrySet()) {
            Cookie cookie = new Cookie(cookieEntry.getKey(), cookieEntry.getValue());
            cookie.setHttpOnly(true);
            response.addCookie(cookie);
        }

        return Result.buildSuc();
    }

    /**
     * sign out
     *
     * @param loginUserPO login user
     * @param request   request
     * @return sign out result
     */
    @PostMapping(value = "/signOut")
    @AccessLogAnnotation(ignoreRequestArgs = {"loginUser", "request"})
    public Result<Boolean> signOut(User loginUserPO,
                                   HttpServletRequest request) {
        String ip = getClientIpAddress(request);
        sessionService.signOut(ip, loginUserPO);
        // clear session
        request.removeAttribute(Constants.SESSION_USER);
        return Result.buildSuc();
    }

}
