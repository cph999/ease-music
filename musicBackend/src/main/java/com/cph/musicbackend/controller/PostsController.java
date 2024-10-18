package com.cph.musicbackend.controller;

import com.cph.musicbackend.aspect.RecognizeAddress;
import com.cph.musicbackend.aspect.UserContext;
import com.cph.musicbackend.common.CommonResult;
import com.cph.musicbackend.entity.Posts;
import com.cph.musicbackend.entity.User;
import com.cph.musicbackend.entity.po.PostVo;
import com.cph.musicbackend.mapper.PostsMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.stream.Collectors;

@RestController
public class PostsController {

    @Autowired
    PostsMapper postMapper;

    @PostMapping("/api/posts")
    @RecognizeAddress
    public CommonResult getPosts(){
        User currentUser = UserContext.getCurrentUser();
        List<Posts> posts = postMapper.getUserPosts(currentUser);
        posts.stream().forEach(p->{
            p.setImages(Arrays.asList(p.getMedia().split(",")));
        });
        return new CommonResult(200,"查询成功",posts);
    }

    @PostMapping("/api/likePost")
    @RecognizeAddress
    public CommonResult like(@RequestBody Posts p){
        User currentUser = UserContext.getCurrentUser();
        if(p.getIsLike() == 1){
            postMapper.addLike(currentUser,p);
        }else{
            postMapper.disLike(currentUser,p);
        }
        return new CommonResult(200,"操作成功",null);
    }

    @PostMapping("/api/publishPost")
    @RecognizeAddress
    public CommonResult publishPost(@RequestBody PostVo postVo){
        User currentUser = UserContext.getCurrentUser();
        Posts posts = new Posts();
        posts.setUserId(currentUser.getId()).setUserNickname(currentUser.getNickname()).setMedia(postVo.getImages().stream().collect(Collectors.joining(",")))
                .setContent(postVo.getContent()).setCreatedTime(new Date()).setUserIcon(currentUser.getCover());
        postMapper.insert(posts);
        return new CommonResult(200,"发布成功",null);
    }
}