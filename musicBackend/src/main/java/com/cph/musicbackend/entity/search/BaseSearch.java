package com.cph.musicbackend.entity.search;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain =true)
public class BaseSearch {
    private Integer pageNum;
    private Integer pageSize;
    private String search;
}