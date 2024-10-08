package com.cph.musicbackend.config;

import com.acrcloud.utils.ACRCloudRecognizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class ACRCloudRecognizerConfig {
    @Bean
    public ACRCloudRecognizer acrCloudRecognizer()
    {
        Map<String, Object> config = new HashMap<String, Object>();

        config.put("host", "identify-cn-north-1.acrcloud.cn");
        config.put("access_key", "3076056eb203a361d9341411191e1e25");
        config.put("access_secret", "TRlwfLkzv8orvm7gIePYvaM8wJvLWMJBBTrJujvQ");

        config.put("debug", false);
        config.put("timeout", 10); // seconds

        return new ACRCloudRecognizer(config);
    }
}