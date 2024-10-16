package com.cph.musicbackend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.Date;
import java.util.List;

@Data
@Accessors(chain = true)
@TableName("posts")
public class Posts {

    @TableId(type = IdType.AUTO, value = "id")
    private Integer id;
    private Integer userId;
    private Date createdTime;
    private String media;
    private String content;

    private String userIcon;
    private String userNickname;

    @TableField(exist = false)
    private Integer isLike;
    @TableField(exist = false)
    private List<String> images;

}