package com.cph.musicbackend.entity.search;

import lombok.Data;
import lombok.experimental.Accessors;

@Data
@Accessors(chain =true)
public class MusicSearch extends BaseSearch{
    private String title;
    private String artist;
}