package org.apache.seatunnel.web.api.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import jakarta.annotation.Resource;
import org.apache.seatunnel.web.api.service.UsersService;
import org.apache.seatunnel.web.api.utils.EncryptionUtils;
import org.apache.seatunnel.web.common.enums.UserType;
import org.apache.seatunnel.web.dao.entity.User;
import org.apache.seatunnel.web.dao.mapper.UserMapper;
import org.springframework.stereotype.Service;

@Service
public class UsersServiceImpl implements UsersService {

    @Resource
    private UserMapper userMapper;

    @Override
    public User queryUser(String name, String password) {
        String md5 = EncryptionUtils.getMd5(password);
        LambdaQueryWrapper<User> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(User::getUserName, name)
                .eq(User::getUserPassword, md5);
        return userMapper.selectOne(wrapper);
    }

    @Override
    public User getUserInfo(User loginUser) {
        User User;
        if (loginUser.getUserType() == UserType.ADMIN_USER) {
            User = loginUser;
        } else {
            User = userMapper.selectById(loginUser.getId());
        }
        return User;
    }

    @Override
    public User getById(int userId) {
        return userMapper.selectById(userId);
    }
}
