package com.cph.musicbackend.handler;

import com.cph.musicbackend.entity.Message;
import com.cph.musicbackend.mapper.MessageMapper;
import com.cph.musicbackend.utils.SpringContextUtil;
import com.google.gson.Gson;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.util.Arrays;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;


public class ChatWebSocketHandler extends TextWebSocketHandler {

    // 存储所有活跃的WebSocket会话
    private static ConcurrentHashMap<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        Map<String, String> params = getQueryParams(session);
        String userId = params.get("userId");
        if (userId != null) {
            // 在session的属性中存储userId
            session.getAttributes().put("userId", userId);
            sessions.put(userId, session); // 将新的会话添加到map中
        }
    }

    @Override
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        MessageMapper messageMapper = SpringContextUtil.getBean(MessageMapper.class);
        String payload = message.getPayload();
        Gson gson = new Gson();
        Message m = gson.fromJson(payload, Message.class);
        messageMapper.insert(m);

        // 将接收到的消息发送给指定用户
        WebSocketSession targetSession = sessions.get(m.getToId().toString());
        if (targetSession != null && targetSession.isOpen()) {
            targetSession.sendMessage(new TextMessage(gson.toJson(m)));
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        // 获取存储在session中的userId
        String userId = (String) session.getAttributes().get("userId");
        if (userId != null) {
            sessions.remove(userId); // 移除对应的会话
        }
    }

    private Map<String, String> getQueryParams(WebSocketSession session) {
        String query = session.getUri().getQuery();
        return Arrays.stream(query.split("&"))
                .map(param -> param.split("="))
                .collect(Collectors.toMap(
                        keyValue -> keyValue[0],
                        keyValue -> keyValue[1]
                ));
    }
}
