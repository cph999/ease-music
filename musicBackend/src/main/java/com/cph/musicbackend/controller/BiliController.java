package com.cph.musicbackend.controller;

import cn.hutool.http.HttpUtil;
import com.cph.musicbackend.aspect.RecognizeAddress;
import com.cph.musicbackend.aspect.UserContext;
import com.cph.musicbackend.common.CommonResult;
import com.cph.musicbackend.entity.Music;
import com.cph.musicbackend.entity.User;
import org.apache.http.client.CookieStore;
import org.apache.http.client.config.CookieSpecs;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.cookie.Cookie;
import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.bytedeco.javacv.FFmpegFrameGrabber;
import org.bytedeco.javacv.FFmpegFrameRecorder;
import org.bytedeco.javacv.Frame;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class BiliController {

    @Value("${file.upload.path}")
    private String path;

    /**
     * 移动端链接
     * @param url
     * @return
     */
    @GetMapping("/move")
    public String getMobileContent(@RequestParam("url") String url) {
        return HttpUtil.createGet(url).execute().body();
    }

    /**
     * 根据bv获取详细信息，其中avid和cid很重要
     * @return
     */
    @PostMapping("/api/av")
    public String getAv(@RequestBody Map map) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = buildHttpHeader();
        HttpEntity requestEntity = new HttpEntity(headers);
        if(map.containsKey("SESSDATA") && map.get("SESSDATA") != null) headers.set("cookie", map.get("SESSDATA").toString());
        ResponseEntity<String> bv = restTemplate.exchange("https://api.bilibili.com/x/web-interface/view?bvid=" + map.get("bv"), HttpMethod.GET, requestEntity, String.class);
        return bv.getBody();
    }

    /**
     * 根据avid和cid请求下载地址接口，获取视频地址
     * @return
     */
    @PostMapping("/api/download")
    public String getDownloadUrl(@RequestBody Map map) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = buildHttpHeader();
        HttpEntity requestEntity = new HttpEntity(headers);
        if(map.containsKey("SESSDATA") && map.get("SESSDATA") != null) headers.set("cookie", map.get("SESSDATA").toString());
        ResponseEntity<String> exchange = restTemplate.exchange("https://api.bilibili.com/x/player/playurl?avid=" + map.get("aid") + "&cid=" + map.get("cid") + "&qn="+map.get("qn") +
                        "&type=mp4&platform=html5&high_quality=1",
                HttpMethod.GET, requestEntity, String.class);
        return exchange.getBody();
    }


    @GetMapping("/api/getLoginUrl")
    public CommonResult getLoginUrl() {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = buildHttpHeader();
        HttpEntity requestEntity = new HttpEntity(headers);
        ResponseEntity<Map> loginUrl = restTemplate.exchange("https://passport.bilibili.com/x/passport-login/web/qrcode/generate?source=main-fe-header", HttpMethod.GET, requestEntity, Map.class);
        return new CommonResult(200, "获取b站二维码链接成功",loginUrl.getBody());
    }

    @PostMapping("/api/checkQrCode")
    public CommonResult checkQrCode(@RequestBody Map map){
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = buildHttpHeader();
        HttpEntity requestEntity = new HttpEntity(headers);
        String url = "https://passport.bilibili.com/x/passport-login/web/qrcode/poll?qrcode_key=" + map.get("qrcode_key") + "&source=main-fe-header";
        ResponseEntity<Map> loginStatus = restTemplate.exchange(url, HttpMethod.GET, requestEntity, Map.class);
        return new CommonResult(200, "二维码状态查询成功",loginStatus.getBody());
    }

    @PostMapping("/api/getcookie")
    public CommonResult getCookie(@RequestBody Map<String, Object> map) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("referer","https://www.bilibili.com/");
        headers.add("user-agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0");
        // 创建 CookieStore
        CookieStore cookieStore = new BasicCookieStore();

        // 创建 RequestConfig，设置 Cookie 规格
        RequestConfig defaultConfig = RequestConfig.custom()
                .setCookieSpec(CookieSpecs.STANDARD)
                .build();

        // 创建 HttpClient，并设置 CookieStore 和 RequestConfig
        CloseableHttpClient httpClient = HttpClients.custom()
                .setDefaultCookieStore(cookieStore)
                .setDefaultRequestConfig(defaultConfig)
                .build();

        // 创建 RestTemplate
        RestTemplate restTemplate = new RestTemplate(new HttpComponentsClientHttpRequestFactory(httpClient));

        HttpEntity<String> requestEntity = new HttpEntity<>(headers);

        // 发送 GET 请求
        String url = (String) map.get("url");
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);

        // 获取 cookies
        List<org.apache.http.cookie.Cookie> cookies = cookieStore.getCookies();
        for (org.apache.http.cookie.Cookie cookie : cookies) {
            System.out.println("Cookie: " + cookie.getName() + " = " + cookie.getValue());
        }

        return new CommonResult(200, "获取cookie成功", cookies);
    }


    public HttpHeaders buildHttpHeader(){
        HttpHeaders headers = new HttpHeaders();
        headers.add("referer","https://www.bilibili.com/");
        headers.add("user-agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0");
        return headers;
    }

    @PostMapping("/api/transfer")
    public ResponseEntity<byte[]> recognizeMusic(@RequestParam("video") MultipartFile video) throws IOException {
        if (video.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body("{\"error\": \"请选择一个文件上传\"}".getBytes());
        }

        ByteArrayOutputStream audioOutputStream = new ByteArrayOutputStream();

        try (FFmpegFrameGrabber frameGrabber = new FFmpegFrameGrabber(video.getInputStream())) {
            frameGrabber.start();

            // 设置录音器
            FFmpegFrameRecorder recorder = new FFmpegFrameRecorder(audioOutputStream, frameGrabber.getAudioChannels());
            recorder.setFormat("mp3");
            recorder.setSampleRate(frameGrabber.getSampleRate());
            recorder.setAudioQuality(0);
            recorder.start();

            Frame frame;
            while ((frame = frameGrabber.grabSamples()) != null) {
                if (frame.samples != null) {
                    recorder.recordSamples(frame.sampleRate, frame.audioChannels, frame.samples);
                }
            }

            recorder.stop();
            audioOutputStream.flush();
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(("{\"error\": \"发生错误: " + e.getMessage() + "\"}").getBytes());
        }

        // 返回音频文件
        byte[] audioBytes = audioOutputStream.toByteArray();
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=\"" + UUID.randomUUID() + ".mp3\"");
        headers.add("Content-Type", "audio/mpeg");

        return new ResponseEntity<>(audioBytes, headers, HttpStatus.OK);
    }
}