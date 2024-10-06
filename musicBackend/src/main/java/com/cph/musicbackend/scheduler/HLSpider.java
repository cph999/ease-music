package com.cph.musicbackend.scheduler;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cph.musicbackend.entity.Music;
import com.cph.musicbackend.mapper.MusicMapper;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.logging.LogEntries;
import org.openqa.selenium.logging.LogEntry;
import org.openqa.selenium.logging.LogType;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import javax.annotation.PostConstruct;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Component
public class HLSpider {
    @Autowired
    MusicMapper musicMapper;
    private final String url = "https://www.qtings.com/search/filter/tracks/";

    @Value("${file.upload.url}")
    private String uploadUrl;

    @Value("${file.upload.path}")
    private String path;

    @Scheduled(cron = "0 0 */1 * * ?")
    public void startSpider() throws InterruptedException {
        // SQL 查询条件，获取 last_update_time 为 NULL 或 last_update_time 超过2小时的记录
        QueryWrapper<Music> queryWrapper = new QueryWrapper<>();
        queryWrapper.isNull("is_save")
                .or().eq("is_save", 0).last("limit 6");

        List<Music> musics = musicMapper.selectList(queryWrapper);
        musics = musics.stream().filter(m -> !judgeContainsStr(m.getTitle())).collect(Collectors.toList());
        for (Music music : musics) {
            WebDriver driver = null;
            try {
//                System.setProperty("webdriver.chrome.driver", "D:\\chromedriver-win64\\chromedriver.exe");
                System.setProperty("webdriver.chrome.driver", "/usr/bin/chromedriver");
                ChromeOptions options = new ChromeOptions();
                options.addArguments("--auto-open-devtools-for-tabs");
                options.addArguments("--headless"); // 添加无头模式
                options.addArguments("--no-sandbox");
                options.addArguments("--disable-dev-shm-usage");
                options.setBinary("/root/projects/ease-music/chrome-linux64/chrome");
                Map<String, Object> loggingPrefs = new HashMap<>();
                loggingPrefs.put("performance", "ALL");
                options.setCapability("goog:loggingPrefs", loggingPrefs); // 启用性能日志
                driver = new ChromeDriver(options);
                driver.get(url + music.getTitle());
                Thread.sleep(2000);
                WebElement playDiv = driver.findElements(By.className("song-play-btn")).get(0);
                playDiv.click();
                Thread.sleep(10000);
                List<WebElement> elements = driver.findElements(By.xpath("/html/body/div[4]/div[1]/div/div/div[1]/div[3]/div[1]/a/img"));
                if(!CollectionUtils.isEmpty(elements)) {
                    WebElement element = elements.get(0);
                    music.setCover(element.getAttribute("src"));
                }
                WebElement element = driver.findElement(By.xpath("/html/body/div[4]/div[1]/div/div/div[1]/div[3]/div[2]/div[3]/div[1]/a"));
                if(element != null) music.setArtist(element.getText());
                LogEntries logEntries = driver.manage().logs().get(LogType.PERFORMANCE);
                for (LogEntry entry : logEntries) {
                    String message = entry.getMessage();
                    // 检查请求是否包含特定 URL 或特定关键字
                    if (!message.contains("get.php") && (message.contains("qqmusic") || (message.contains("www.qtings.com") && message.contains("mp3")))) {
                        JsonObject jsonMessage = JsonParser.parseString(message).getAsJsonObject();
                        JsonElement jsonElement = null;
                        try{
                            jsonElement = jsonMessage.getAsJsonObject("message").getAsJsonObject("params").getAsJsonObject("headers").get("location");
                        }catch (Exception e){
                            jsonElement = jsonMessage.getAsJsonObject("message").getAsJsonObject("params").getAsJsonObject("request").get("url");
                        }
                        String mp3Url = jsonElement.getAsString();
                        // 下载并保存MP3文件
                        String fileName = music.getId() + ".mp3";
                        System.out.println("请求的 URL: " + mp3Url);
                        music.setUrl(uploadUrl + fileName);
                        String filePath = path + fileName; // 请根据实际情况修改保存路径
                        downloadFile(mp3Url, filePath);
                        music.setIsSave(1);

                        music.setLastUpdateTime(new Date());
                        musicMapper.updateById(music);
                        break;

                    }
                }
                driver.close();

            } catch (Exception e) {
                e.printStackTrace();
            } finally {
                if (driver != null) {
                    driver.quit(); // 确保关闭 WebDriver 实例
                }
            }
        }
    }

    private void downloadFile(String fileUrl, String saveFilePath) {
        try {
            URL url = new URL(fileUrl);
            try (InputStream in = url.openStream();
                 ReadableByteChannel rbc = Channels.newChannel(in);
                 FileOutputStream fos = new FileOutputStream(saveFilePath)) {
                fos.getChannel().transferFrom(rbc, 0, Long.MAX_VALUE);
            }
            System.out.println("文件已保存: " + saveFilePath);
        } catch (Exception e) {
            System.err.println("下载文件时出错: " + e.getMessage());
        }
    }

    @PostConstruct
    public void init() throws InterruptedException {
        startSpider();
    }

    public boolean judgeContainsStr(String str) {
        String regex=".*[a-zA-Z]+.*";
        Matcher m=Pattern.compile(regex).matcher(str);
        return m.matches();
    }
}