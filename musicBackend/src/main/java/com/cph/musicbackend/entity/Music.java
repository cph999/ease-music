package com.cph.musicbackend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;
import lombok.experimental.Accessors;

import java.util.Date;

@Data
@Accessors(chain =true)
public class Music {

    @TableId(type = IdType.AUTO, value = "id")
    private Integer id;
    private String title;
    private String artist;
    private String duration;
    private String url;
    private String cover;
    private Date lastUpdateTime;

    //是否还保存过，报错过1，没保存过0
    private Integer isSave;

    //触发人id，可以是空
    @TableField(value = "trigger_id")
    private Integer triggerId;

    // 点赞状态 1：喜欢，0：不喜欢
    @TableField(exist = false)
    private Integer likeState;
}