package org.apache.seatunnel.web.api.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import org.apache.seatunnel.web.api.dao.UserMapper;
import org.apache.seatunnel.web.api.service.UsersService;
import org.apache.seatunnel.web.api.utils.EncryptionUtils;
import org.apache.seatunnel.web.common.bean.po.UserPO;
import org.apache.seatunnel.web.common.enums.UserType;
import org.springframework.stereotype.Service;

@Service
public class UsersServiceImpl extends ServiceImpl<UserMapper, UserPO>
        implements UsersService {

    @Override
    public UserPO queryUser(String name, String password) {
        String md5 = EncryptionUtils.getMd5(password);
        LambdaQueryWrapper<UserPO> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserPO::getUserName, name)
                .eq(UserPO::getUserPassword, md5);
        return getBaseMapper().selectOne(wrapper);
    }

    @Override
    public UserPO getUserInfo(UserPO loginUserPO) {
        UserPO userPO;
        if (loginUserPO.getUserType() == UserType.ADMIN_USER) {
            userPO = loginUserPO;
        } else {
            userPO = getById(loginUserPO.getId());
        }
        return userPO;
    }
}
