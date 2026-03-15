package org.apache.seatunnel.web.api.service;


import com.baomidou.mybatisplus.extension.service.IService;
import org.apache.seatunnel.web.common.bean.po.UserPO;

/**
 * users service
 */
public interface UsersService extends IService<UserPO> {


    UserPO queryUser(String userId, String password);

    UserPO getUserInfo(UserPO loginUserPO);
}
