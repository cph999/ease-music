package com.cph.musicbackend.rd3.xunfei;

import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.util.HashMap;
import java.util.Map;
import java.net.SocketTimeoutException;

public class MusicRecUtil {
    // webapi接口地址
    private static final String WEBSING_URL = "https://webqbh.xfyun.cn/v1/service/v1/qbh";
    // 应用ID
    private static final String APPID = "af8f461c";
    // 接口密钥
    private static final String API_KEY = "77ae606deb9b94ef49756d5ca5622160";

    private static final String ENGINE_TYPE = "afs";


    private static final String AUE = "raw";

    /*客户端传输一个audio_url参数时，Http Request Body需为空*/

    private static final String AUDIO_PATH = "/root/nginx/share/nginx/media";


    /**
     * @throws IOException
     */
    public static JsonNode recongnizeUrl(String fileAddress) throws IOException {   
        HttpHeaders header = buildHttpHeader();

        // 将HashMap改为MultiValueMap
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("audio_url", fileAddress);

        RestTemplate restTemplate = new RestTemplate();

        // 使用HttpEntity<MultiValueMap<String, String>>
        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, header);

        // 使用String.class接收响应
        ResponseEntity<String> responseEntity = restTemplate.postForEntity(WEBSING_URL, entity, String.class);

        // 使用 Jackson 的 ObjectMapper 将响应转换为 JsonNode
        ObjectMapper objectMapper = new ObjectMapper();
        return objectMapper.readTree(responseEntity.getBody());
    }

    /**
     * @throws IOException
     */
    public static String recongnizeFile(String audioPath) throws IOException {
        int maxRetries = 3;
        int retryCount = 0;
        while (retryCount < maxRetries) {
            try {
                Map<String, String> header = buildHttpHeader1();
                byte[] audioByteArray = FileUtil.read(audioPath);
                String result = HttpUtil.doPost(WEBSING_URL, header, audioByteArray);
                System.out.println("WebAPI 接口调用结果：" + result);
                return result;
            } catch (SocketTimeoutException e) {
                retryCount++;
                if (retryCount >= maxRetries) {
                    throw e;
                }
                System.out.println("请求超时，正在进行第 " + retryCount + " 次重试...");
                try {
                    Thread.sleep(2000); // 等待2秒后重试
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        throw new IOException("达到最大重试次数，请求仍然失败");
    }

    /**
     * 组装http请求头
     */
    private static HttpHeaders buildHttpHeader() throws UnsupportedEncodingException {
        String curTime = System.currentTimeMillis() / 1000L + "";
        // 如果使用audio_url传输音频，须在param中添加audio_url参数
        String param = "{\"aue\":\"" + AUE + "\",\"engine_type\":\"" + ENGINE_TYPE + "\"}";
        String paramBase64 = new String(Base64.encodeBase64(param.getBytes("UTF-8")));
        String checkSum = DigestUtils.md5Hex(API_KEY + curTime + paramBase64);
        HttpHeaders header = new HttpHeaders();
        header.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        header.add("X-Param", paramBase64);
        header.add("X-CurTime", curTime);
        header.add("X-CheckSum", checkSum);
        header.add("X-Appid", APPID);
        return header;
    }

    private static Map<String, String> buildHttpHeader1() throws UnsupportedEncodingException {
        String curTime = System.currentTimeMillis() / 1000L + "";
        // 如果使用audio_url传输音频，须在param中添加audio_url参数
        String param = "{\"aue\":\"" + AUE + "\",\"engine_type\":\"" + ENGINE_TYPE + "\"}";
        String paramBase64 = new String(Base64.encodeBase64(param.getBytes("UTF-8")));
        String checkSum = DigestUtils.md5Hex(API_KEY + curTime + paramBase64);
        Map<String, String> header = new HashMap<String, String>();
        header.put("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
        header.put("X-Param", paramBase64);
        header.put("X-CurTime", curTime);
        header.put("X-CheckSum", checkSum);
        header.put("X-Appid", APPID);
        return header;
    }
}
