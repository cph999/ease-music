package com.cph.musicbackend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.Date;
import java.util.List;

@Data
@Accessors(chain = true)
public class User {
    @TableId(type = IdType.AUTO, value = "id")
    private Integer id;
    private String username;
    private String mac;
    private String ipAddress;
    private String age;
    private String address;

    private String password;
    private String phone;
    private String email;
    private String nickname;
    private String cover;

    private String token;
    private String superToken;
    private Integer isSuper;

    @TableField(exist = false)
    private List<Music> musics;

}