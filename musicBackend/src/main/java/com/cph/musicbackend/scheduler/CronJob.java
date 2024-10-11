package com.cph.musicbackend.scheduler;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.cph.musicbackend.entity.Music;
import com.cph.musicbackend.entity.User;
import com.cph.musicbackend.mapper.MusicMapper;
import com.cph.musicbackend.mapper.UserMapper;
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

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.io.InputStream;
import java.io.FileOutputStream;
import java.net.URL;
import java.nio.channels.Channels;
import java.nio.channels.ReadableByteChannel;

@Component
public class CronJob {

    @Autowired
    MusicMapper musicMapper;

    @Autowired
    UserMapper userMapper;
    private final String url = "https://www.gequbao.com/s/";

    @Value("${file.upload.url}")
    private String uploadUrl;

    @Value("${file.upload.path}")
    private String path;
    @Scheduled(cron = "0 0 */1 * * ?")
    public void sayHello() throws InterruptedException {
        // SQL 查询条件，获取 last_update_time 为 NULL 或 last_update_time 超过2小时的记录
        QueryWrapper<Music> queryWrapper = new QueryWrapper<>();
        queryWrapper.isNull("is_save")
                .or().eq("is_save",0).last("limit 8");

        List<Music> musics = musicMapper.selectList(queryWrapper);

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
                WebElement elementToClick = driver.findElements(By.className("music-link")).get(0);
                elementToClick.click();
                String originalWindow = driver.getWindowHandle();

                for (String windowHandle : driver.getWindowHandles()) {
                    if (!windowHandle.equals(originalWindow)) {
                        driver.switchTo().window(windowHandle); // 切换到新窗口
                        break;
                    }
                }
                WebDriverWait wait = new WebDriverWait(driver, 10); // 等待最长10秒
                WebElement nextElementToClick = wait.until(ExpectedConditions.elementToBeClickable(By.xpath("/html/body/div[1]/div[1]/div[1]/div[1]")));

                WebElement backgroundUrl = driver.findElement(By.className("aplayer-pic"));
                WebElement author = driver.findElement(By.className("aplayer-author"));

                nextElementToClick.click(); // 执行点击
                Thread.sleep(5000);

                LogEntries logEntries = driver.manage().logs().get(LogType.PERFORMANCE);
                for (LogEntry entry : logEntries) {
                    String message = entry.getMessage();
                    // 检查请求是否包含特定 URL 或特定关键字
                    if (message.contains("sycdn.kuwo.cn")) {
                        JsonObject jsonMessage = JsonParser.parseString(message).getAsJsonObject();
                        JsonElement jsonElement = jsonMessage.getAsJsonObject("message").getAsJsonObject("params").getAsJsonObject("request").get("url");
                        String mp3Url = jsonElement.getAsString();
                        // 下载并保存MP3文件
                        String fileName = music.getId() + ".mp3";
                        System.out.println("请求的 URL: " + mp3Url);
                        music.setUrl(uploadUrl + fileName);
                        String filePath = path + fileName; // 请根据实际情况修改保存路径
                        downloadFile(mp3Url, filePath);
                        User user = new User().setId(music.getTriggerId());
                        user.setMusics(Arrays.asList(music));
                        if(music.getTriggerId() != null) userMapper.addDefaultMusics(user,new Date());
                        music.setIsSave(1);

                        if (author != null) music.setArtist(author.getText());
                        if (backgroundUrl != null) {
                            String style = backgroundUrl.getAttribute("style");
                            Pattern pattern = Pattern.compile("(https?|ftp|file)://[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]");
                            Matcher matcher = pattern.matcher(style);
                            while (matcher.find()) {
                                music.setCover(matcher.group());
                                break;
                            }
                        }
                        music.setLastUpdateTime(new Date());
                        musicMapper.updateById(music);
                        break;
                    }
                }

                Thread.sleep(15000);
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

    // 新增方法：下载文件并保存到本地
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

//    @PostConstruct
//    public void init() throws InterruptedException {
//        sayHello();
//    }

}