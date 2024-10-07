package com.cph.musicbackend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cph.musicbackend.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface UserMapper extends BaseMapper<User> {
    /**
     * 用户个性化歌单
     * @return
     */
    public User getPersonalMuicList(@Param("u") User user);

    /**
     * 添加默认歌曲
     * @return
     */
    void addDefaultMusics(@Param("u") User user);
}
