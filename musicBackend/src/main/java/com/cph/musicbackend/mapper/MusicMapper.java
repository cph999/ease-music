package com.cph.musicbackend.mapper;

import com.cph.musicbackend.entity.Music;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MusicMapper extends BaseMapper<Music>{

    boolean saveBatchByNative(@Param("list") List<Music> list);

}
