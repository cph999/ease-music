package com.cph.musicbackend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cph.musicbackend.aspect.RecognizeAddress;
import com.cph.musicbackend.common.CommonResult;
import com.cph.musicbackend.entity.Music;
import com.cph.musicbackend.entity.User;
import com.cph.musicbackend.mapper.MusicMapper;
import com.cph.musicbackend.mapper.UserMapper;
import com.cph.musicbackend.utils.MD5Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.rmi.server.UID;
import java.util.Date;
import java.util.List;
import java.util.UUID;

@RestController
public class UserController {

    @Autowired
    UserMapper userMapper;

    @Value("${md5.salt}")
    private String salt;

    @Autowired
    MusicMapper musicMapper;

    @PostMapping("/api/login")
    public CommonResult login(@RequestBody User loginUser) {
        User user = userMapper.selectOne(new QueryWrapper<User>().eq("username", loginUser.getUsername()));
        Assert.notNull(user,"用户不存在");
        String s = MD5Utils.MD5Lower(loginUser.getPassword(), salt);
        if(s.equals(user.getPassword())){
            user.setToken( UUID.randomUUID().toString());
            userMapper.updateById(user);
            return new CommonResult(200,"登录成功",user);
        }else{
            return new CommonResult(400,"账号或密码错误",null);
        }
    }

    @PostMapping("/api/register")
    public CommonResult register(@RequestBody User registerUser) {
        User user = userMapper.selectOne(new QueryWrapper<User>().eq("username", registerUser.getUsername()));
        Assert.isNull(user,"用户已存在");
        registerUser.setPassword(MD5Utils.MD5Lower(registerUser.getPassword(), salt));
        registerUser.setCover("https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/3.png");
        userMapper.insert(registerUser);
        List<Music> musics = musicMapper.selectList(new QueryWrapper<Music>()
                .like("url", "https://app102.acapp.acwing.com.cn").eq("is_save",1).last("limit 20").orderByDesc("id"));
        registerUser.setMusics(musics);
        userMapper.addDefaultMusics(registerUser, new Date());
        return new CommonResult(200,"注册成功",null);
    }
}