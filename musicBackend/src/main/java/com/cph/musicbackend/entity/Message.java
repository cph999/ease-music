package com.cph.musicbackend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.Date;

@Data
@Accessors(chain =true)
@TableName("user_message")
public class Message {

    @TableId(type = IdType.AUTO, value = "id")
    private Integer id;

    private Integer fromId;
    private String fromNickname;
    private String fromIcon;
    private Integer toId;
    private String toNickname;
    private String toIcon;

    private String message;
    private Date createdTime;

    @TableField(exist = false)
    private String showTime;

}