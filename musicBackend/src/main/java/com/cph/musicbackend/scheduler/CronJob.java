package com.cph.musicbackend.scheduler;

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

import javax.annotation.PostConstruct;
import java.util.*;

@Component
public class CronJob {

    @Autowired
    MusicMapper musicMapper;
    private final String url = "https://www.gequbao.com/s/";

    //    @Scheduled(cron = "*/10 * * * * ?")
    @Scheduled(cron = "0 0 */1 * * ?")
    public void sayHello() throws InterruptedException {
        List<Music> musics = musicMapper.selectList(null);
        for (Music music : musics) {
            WebDriver driver = null;
            try{
                if (music.getLastUpdateTime() == null || dateJudge(music.getLastUpdateTime()) || !music.getUrl().startsWith("https")) {
                    System.setProperty("webdriver.chrome.driver", "D:\\chromedriver-win64\\chromedriver.exe");
//                    System.setProperty("webdriver.chrome.driver", "/usr/bin/chromedriver");
                    ChromeOptions options = new ChromeOptions();
                    options.addArguments("--auto-open-devtools-for-tabs");
//                    options.addArguments("--headless"); // 添加无头模式
//                    options.addArguments("--no-sandbox");
                    options.addArguments("--disable-dev-shm-usage");
//                    options.setBinary("/root/projects/ease-music/chrome-linux64/chrome");
                    Map<String, Object> loggingPrefs = new HashMap<>();
                    loggingPrefs.put("performance", "ALL");
                    options.setCapability("goog:loggingPrefs", loggingPrefs); // 启用性能日志
                    driver = new ChromeDriver(options);
                    driver.get(url + music.getTitle());
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
                            music.setLastUpdateTime(new Date());
                            musicMapper.updateById(music);
                            break;
                        }
                    }


                    Thread.sleep(10000);
                    driver.close();

                }
            }catch (Exception e){
                e.printStackTrace();
            }finally {
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

    public boolean dateJudge(Date date) {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        calendar.add(java.util.Calendar.HOUR_OF_DAY, -1);
        return date.before(calendar.getTime());
    }
}