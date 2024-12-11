package com.cph.musicbackend.controller;

import com.cph.musicbackend.common.CommonResult;
import org.apache.rocketmq.spring.core.RocketMQTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.Message;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.websocket.SendResult;

@RestController
public class NormalProduceController {

    @Autowired
    private RocketMQTemplate rocketmqTemplate;

    @GetMapping("/test")
    public CommonResult test() {
        Message<String> msg = MessageBuilder.withPayload("Hello,RocketMQ").build();
         rocketmqTemplate.convertAndSend("musicBackend", msg);
         return new CommonResult();
    }
}
