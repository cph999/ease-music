package com.cph.musicbackend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.CollectionUtils;
import com.cph.musicbackend.aspect.RecognizeAddress;
import com.cph.musicbackend.aspect.UserContext;
import com.cph.musicbackend.common.CommonResult;
import com.cph.musicbackend.entity.Music;
import com.cph.musicbackend.entity.User;
import com.cph.musicbackend.mapper.MusicMapper;
import com.cph.musicbackend.mapper.UserMapper;
import com.cph.musicbackend.rd3.AcrCloudUtil;
import com.cph.musicbackend.rd3.xunfei.MusicRecUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.Assert;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
public class MusicController {


    @Autowired
    MusicMapper musicMapper;

    @Value("${file.upload.path}")
    private String path;

    @Autowired
    UserMapper userMapper;

    @Autowired
    AcrCloudUtil acrCloudUtil;

    @GetMapping("/api/musicList")
    @RecognizeAddress
    public List<Music> getMusciList() {
        User currentUser = UserContext.getCurrentUser();
        User personalMuicList = userMapper.getPersonalMuicList(currentUser);
        return personalMuicList.getMusics();
    }

    @PostMapping("/api/search")
    @RecognizeAddress
    public Object search(@RequestBody Music music) {
        User currentUser = UserContext.getCurrentUser();
        Assert.hasText(music.getTitle(), "歌曲名字不能为空");
        List<Music> musics = musicMapper.selectList(new QueryWrapper<Music>().like("title", music.getTitle()).eq("is_save", 1)
                .isNotNull("last_update_time"));
        List<Integer> followedMusic = userMapper.getFollowedMusic(currentUser);
        List<Music> insertMusics = musics.stream().filter(m -> !followedMusic.contains(m.getId())).collect(Collectors.toList());
        List<Music> updateMusics = musics.stream().filter(m -> followedMusic.contains(m.getId())).collect(Collectors.toList());
        if (CollectionUtils.isNotEmpty(musics)) {
            if (CollectionUtils.isNotEmpty(insertMusics)) {
                currentUser.setMusics(insertMusics);
                userMapper.addDefaultMusics(currentUser, new Date());
            }
            if (CollectionUtils.isNotEmpty(updateMusics)) {
                userMapper.updateExistMusic(updateMusics.stream().map(Music::getId).collect(Collectors.toList()), new Date());
            }
            return musics;
        }
        try {
            musicMapper.insert(music);
        } catch (Exception e) {
            return e.getMessage();
        }
        return "您搜索的歌曲不在我们的曲库中，我们已经记录，请稍后重试！";
    }

    @PostMapping("/api/add")
    public Object add(@RequestBody Music music) {
        Assert.hasText(music.getTitle(), "歌曲名字不能为空");
        List<Music> musics = musicMapper.selectList(new QueryWrapper<Music>().eq("title", music.getTitle()).isNotNull("last_update_time"));
        if (CollectionUtils.isNotEmpty(musics)) return music.getTitle() + "歌曲已添加";
        try {
            musicMapper.insert(music);
        } catch (Exception e) {
            return e.getMessage();
        }
        return "添加成功";
    }

    /**
     * 我的喜欢列表
     * @return
     */
    @PostMapping("/api/likeList")
    @RecognizeAddress
    public CommonResult likeList() {
        User currentUser = UserContext.getCurrentUser();
        User personalMuicList = userMapper.getLikeMuicList(currentUser);
        return new CommonResult(200,"查新成功",null,personalMuicList.getMusics());
    }

    @PostMapping("/api/like")
    @RecognizeAddress
    public Object like(@RequestBody Music song) {
        User currentUser = UserContext.getCurrentUser();
        userMapper.updateLikeState(currentUser.getId(), song.getId(),song.getLikeState());
        if(song.getLikeState() == 1)return "已添加我的收藏！";
        else return "取消收藏成功！";
    }

    @PostMapping("/api/uploadAudio")
    @RecognizeAddress
    public Object recongnizeMusic(@RequestParam("audio") MultipartFile file) {
        if (file.isEmpty()) {
            return "{\"error\": \"请选择一个文件上传\"}";
        }
        try {
            String fileName = file.getOriginalFilename();
            // 指定文件保存路径
            String uploadDir = path;
            File dir = new File(uploadDir);
            if (!dir.exists()) {
                dir.mkdirs();
            }
            // 保存文件
            File destFile = new File(dir.getAbsolutePath() + File.separator + fileName);
            file.transferTo(destFile);
            Map<String, String> resultMap = acrCloudUtil.recongizeByFile(dir.getAbsolutePath() + File.separator + fileName);
            if(resultMap.containsKey("artist") && resultMap.containsKey("title")){
                User currentUser = UserContext.getCurrentUser();
                Music music = new Music().setArtist(resultMap.get("artist")).setTitle(resultMap.get("title")).setTriggerId(currentUser.getId());
                musicMapper.insert(music);
            }
            return resultMap;
//            return MusicRecUtil.recongnizeFile(dir.getAbsolutePath() + File.separator + fileName);

        } catch (IOException e) {
            return "{\"error\": \"" + e.getMessage() + "\"}";
        }
    }
}