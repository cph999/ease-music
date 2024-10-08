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
//        String result = "{\"status\":{\"msg\":\"Success\",\"version\":\"1.0\",\"code\":0},\"metadata\":{\"timestamp_utc\":\"2024-10-08 12:08:34\",\"music\":[{\"lan\":\"国语\",\"duration_ms\":200000,\"external_ids\":{},\"db_begin_time_offset_ms\":4080,\"artists\":[{\"name\":\"周杰伦\"}],\"db_end_time_offset_ms\":14600,\"sample_begin_time_offset_ms\":0,\"sample_end_time_offset_ms\":10520,\"play_offset_ms\":15540,\"result_from\":3,\"title\":\"前世情人\",\"label\":\"JVR\",\"score\":100,\"acrid\":\"e3c887cf408db8991a68a843f1afd5a0\",\"language\":\"zh\",\"external_metadata\":{},\"release_date\":\"2016-06-24\",\"album\":{\"name\":\"周杰伦的床边故事\"}},{\"duration_ms\":200460,\"external_ids\":{},\"db_begin_time_offset_ms\":4060,\"artists\":[{\"name\":\"周杰伦\"}],\"label\":\"杰威尔音乐有限公司\",\"db_end_time_offset_ms\":14500,\"sample_begin_time_offset_ms\":0,\"sample_end_time_offset_ms\":10440,\"play_offset_ms\":15520,\"result_from\":3,\"title\":\"前世情人\",\"score\":100,\"language\":\"zh\",\"acrid\":\"0eb1c19384ec445e15c6cb3c11c706ba\",\"release_date\":\"2016-06-24\",\"external_metadata\":{},\"album\":{\"name\":\"周杰伦的床边故事\"}}]},\"result_type\":0,\"cost_time\":0.029999971389771}";
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