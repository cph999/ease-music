package com.cph.musicbackend.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import lombok.Data;

import java.util.Date;

@Data
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
}