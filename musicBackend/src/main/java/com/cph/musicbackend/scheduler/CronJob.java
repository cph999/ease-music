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
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.util.CollectionUtils;

import javax.annotation.PostConstruct;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class CronJob {

    @Autowired
    MusicMapper musicMapper;
    private final String url = "https://www.gequbao.com/s/";

    //    @Scheduled(cron = "*/10 * * * * ?")
    @Scheduled(cron = "0 0 */1 * * ?")
    public void sayHello() throws InterruptedException {
        // 获取当前时间前1小时
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.HOUR_OF_DAY, -1);
        Date oneHourAgo = calendar.getTime();

        // SQL 查询条件，获取 last_update_time 为 NULL 或 last_update_time 超过1小时的记录
        QueryWrapper<Music> queryWrapper = new QueryWrapper<>();
        queryWrapper.isNull("last_update_time")
                .or()
                .lt("last_update_time", oneHourAgo)
                .or()
                .notLike("url", "https");

        List<Music> musics = musicMapper.selectList(queryWrapper);
        if (!CollectionUtils.isEmpty(musics)) {
            musics = musics.subList(0, Math.min(musics.size() , 7));
        }
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
                        String asString = jsonElement.getAsString();
                        System.out.println("请求的 URL: " + asString);
                        music.setUrl(asString);
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


                Thread.sleep(10000);
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

    @PostConstruct
    public void init() throws InterruptedException {
        sayHello();
    }

}