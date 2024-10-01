package com.cph.musicbackend;

import com.dingtalk.api.DefaultDingTalkClient;
import com.dingtalk.api.DingTalkClient;
import com.dingtalk.api.request.OapiRobotSendRequest;
import com.dingtalk.api.response.OapiRobotSendResponse;
import com.dingtalk.open.app.api.OpenDingTalkStreamClientBuilder;
import com.dingtalk.open.app.api.security.AuthClientCredential;
import com.taobao.api.ApiException;
import shade.com.alibaba.fastjson2.JSONObject;

import java.util.Arrays;

public class Main {
    public static void main(String[] args) throws Exception {
        OpenDingTalkStreamClientBuilder
                .custom()
                .credential(new AuthClientCredential("dingsacctehjz14jkffh", "oar9OgoBYixkFrUoj0DoSCILZRM5qfL0uUyay6aFqlXUvDqt3mE1li6KI9v9gtdN"))
                //注册机器人监听器/v1.0/im/bot/messages/get

                .registerCallbackListener("/v1.0/im/bot/messages/get", robotMessage -> {
                    System.out.println(("receive robotMessage, {}"+ robotMessage));
                    //开发者根据自身业务需求，处理机器人回调
                    return new JSONObject();

                })
                .build().start();
    }
}