package com.cph.musicbackend.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.cph.musicbackend.entity.Message;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface MessageMapper extends BaseMapper<Message> {
}
