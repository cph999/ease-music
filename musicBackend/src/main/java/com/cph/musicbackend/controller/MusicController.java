package com.cph.musicbackend.controller;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.CollectionUtils;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.cph.musicbackend.entity.Music;
import com.cph.musicbackend.mapper.MusicMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;

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

    @PostMapping("/api/search")
    public Object search(@RequestBody Music music) {
        Assert.hasText(music.getTitle(), "歌曲名字不能为空");
        List<Music> musics = musicMapper.selectList(new QueryWrapper<Music>().like("title", music.getTitle()).isNotNull("last_update_time"));
        if (CollectionUtils.isNotEmpty(musics)) return musics;
        try{
            musicMapper.insert(music);
        }catch (Exception e){
            return e.getMessage();
        }
        return "您搜索的歌曲不在我们的曲库中，我们已经记录，请稍后重试！";

    }

}