package com.cph.musicbackend.controller;

import cn.hutool.http.HttpUtil;
import com.cph.musicbackend.common.CommonResult;
import org.apache.http.client.CookieStore;
import org.apache.http.client.config.CookieSpecs;
import org.apache.http.client.config.RequestConfig;
import org.apache.http.cookie.Cookie;
import org.apache.http.impl.client.BasicCookieStore;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@RestController
public class BiliController {

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
        HttpHeaders headers = new HttpHeaders();
        headers.add("referer","https://www.bilibili.com/");
        headers.add("user-agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0");
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
        HttpHeaders headers = new HttpHeaders();
        headers.add("referer","https://www.bilibili.com/");
        headers.add("user-agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0");
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
        HttpHeaders headers = new HttpHeaders();
        headers.add("referer","https://www.bilibili.com/");
        headers.add("user-agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0");
        HttpEntity requestEntity = new HttpEntity(headers);
        ResponseEntity<Map> loginUrl = restTemplate.exchange("https://passport.bilibili.com/x/passport-login/web/qrcode/generate?source=main-fe-header", HttpMethod.GET, requestEntity, Map.class);
        return new CommonResult(200, "获取b站二维码链接成功",loginUrl.getBody());
    }

    @PostMapping("/api/checkQrCode")
    public CommonResult checkQrCode(@RequestBody Map map){
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.add("referer","https://www.bilibili.com/");
        headers.add("user-agent","Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36 Edg/119.0.0.0");
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
//
//    /**
//     * 根据bv获取详细信息，其中avid和cid很重要
//     * @return
//     */
//    @GetMapping("/av/{bv}")
//    public String getAv(@PathVariable("bv") String bv ) {
//        return HttpUtil.createGet("https://api.bilibili.com/x/web-interface/view?bvid=" + bv).execute().body();
//    }
//
//    /**
//     * 根据avid和cid请求下载地址接口，获取视频地址
//     * @param avid
//     * @param cid
//     * @return
//     */
//    @GetMapping("/download/{avid}/{cid}")
//    public String getDownloadUrl1(@PathVariable("avid") String avid, @PathVariable("cid") String cid) {
//        return HttpUtil.createGet("https://api.bilibili.com/x/player/playurl?avid=" + avid + "&cid=" + cid + "&qn=80&type=mp4&platform=html5&high_quality=1").execute().body();
//    }
}