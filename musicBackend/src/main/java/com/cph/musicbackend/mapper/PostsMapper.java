package com.cph.musicbackend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cph.musicbackend.entity.Music;
import com.cph.musicbackend.entity.Posts;
import com.cph.musicbackend.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PostsMapper extends BaseMapper<Posts> {
    public List<Posts> getUserPosts(@Param("u") User user);

    public void like(@Param("u") User user, @Param("p") Posts p);
}
