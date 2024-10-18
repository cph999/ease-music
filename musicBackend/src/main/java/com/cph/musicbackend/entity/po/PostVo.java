package com.cph.musicbackend.entity.po;

import lombok.Data;
import lombok.experimental.Accessors;

import java.util.List;

@Data
@Accessors(chain =true)
public class PostVo {
    private String  title;
    private String  content;
    private List<String> images;

}