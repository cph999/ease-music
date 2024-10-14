package com.cph.musicbackend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cph.musicbackend.aspect.RecognizeAddress;
import com.cph.musicbackend.aspect.UserContext;
import com.cph.musicbackend.common.CommonResult;
import com.cph.musicbackend.entity.Message;
import com.cph.musicbackend.entity.User;
import com.cph.musicbackend.mapper.MessageMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

import java.text.SimpleDateFormat;
import java.util.*;
import java.util.stream.Collectors;

@RestController
public class MessageController {

    @Autowired
    MessageMapper messagesMapper;

    @PostMapping("/api/messages")
    @RecognizeAddress
    public CommonResult getAllMessages() {
        User currentUser = UserContext.getCurrentUser();
        List<Message> messages = messagesMapper.selectList(
                new QueryWrapper<Message>()
                        .eq("from_id", currentUser.getId())
                        .or()
                        .eq("to_id", currentUser.getId())
        );

        // 将对话按照无序的 from_id 和 to_id 进行分组
        Map<String, List<Message>> collect = messages.stream()
                .collect(Collectors.groupingBy(m -> {
                    Long minId = (long) Math.min(m.getFromId(), m.getToId());
                    Long maxId = (long) Math.max(m.getFromId(), m.getToId());
                    return minId + " " + maxId;
                }));

        ArrayList<List<Message>> lists = new ArrayList<>();
        SimpleDateFormat sdf = new SimpleDateFormat("MM月dd日");

        collect.values().forEach(temp -> {
            if (!CollectionUtils.isEmpty(temp)) {
                lists.add(temp.stream()
                        .sorted(Comparator.comparing(Message::getCreatedTime))  // 按照创建时间排序
                        .map(m -> {
                            String formattedDate = sdf.format(m.getCreatedTime());
                            m.setShowTime(formattedDate);
                            return m;
                        })
                        .collect(Collectors.toList()));
            }
        });

        // 最终按照最新消息的创建时间对对话框进行排序
        List<List<Message>> messageList = lists.stream()
                .sorted((a, b) -> b.get(0).getCreatedTime().compareTo(a.get(0).getCreatedTime()))
                .collect(Collectors.toList());

        return new CommonResult(200, "success", messageList);
    }
}