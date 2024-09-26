package com.cph.musicbackend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cph.musicbackend.entity.Music;
import com.cph.musicbackend.mapper.MusicMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@CrossOrigin
public class MusicController {

    @Autowired
    MusicMapper musicMapper;

    @GetMapping("/api/musicList")
    public List<Music> getMusciList() {
        return musicMapper.selectList(new QueryWrapper<Music>());
    }
}