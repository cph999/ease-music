package com.cph.musicbackend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cph.musicbackend.entity.Music;
import com.cph.musicbackend.entity.User;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.Date;
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
    void addDefaultMusics(@Param("u") User user,@Param("ct") Date ct);

    /**
     * 获取uid下的所有歌曲
     * @return
     */
    List<Integer> getFollowedMusic(@Param("u") User user);

    /**
     * 更新关系表中已经存在的歌曲
     * @param ct
     */
    void updateExistMusic(@Param("eids")List<Integer> eids ,@Param("ct") Date ct);
}
