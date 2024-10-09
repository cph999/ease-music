package com.cph.musicbackend.rd3;

import com.acrcloud.utils.ACRCloudRecognizer;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class AcrCloudUtil {
    @Autowired
    public ACRCloudRecognizer re;

    public Map<String, String> recongizeByFile(String filename) {
        HashMap<String, String> resultMap = new HashMap<>();
        String result = re.recognizeByFile(filename, 1);
        // 使用示例结果进行解析
        System.out.println(result);

        try {
            JsonObject jsonObject = JsonParser.parseString(result).getAsJsonObject();
            JsonObject metadata = jsonObject.getAsJsonObject("metadata");
            JsonElement musicElement = metadata.get("music");

            if (musicElement != null && musicElement.isJsonArray() && musicElement.getAsJsonArray().size() > 0) {
                JsonObject musicObject = musicElement.getAsJsonArray().get(0).getAsJsonObject();
                
                String title = musicObject.get("title").getAsString();
                String artist = musicObject.getAsJsonArray("artists").get(0).getAsJsonObject().get("name").getAsString();

                resultMap.put("title", title);
                resultMap.put("artist", artist);
            }
        } catch (Exception e) {
            System.err.println("解析结果时发生错误: " + e.getMessage());
        }

        return resultMap;
    }
}