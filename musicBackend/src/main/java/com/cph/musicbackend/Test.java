package com.cph.musicbackend;

import java.io.*;
import java.util.Map;
import java.util.HashMap;

import com.acrcloud.utils.ACRCloudRecognizer;

public class Test {

    public static void main(String[] args) {
        Map<String, Object> config = new HashMap<String, Object>();

        config.put("host", "identify-cn-north-1.acrcloud.cn");
        config.put("access_key", "3076056eb203a361d9341411191e1e25");
        config.put("access_secret", "TRlwfLkzv8orvm7gIePYvaM8wJvLWMJBBTrJujvQ");

        config.put("debug", false);
        config.put("timeout", 10); // seconds

        ACRCloudRecognizer re = new ACRCloudRecognizer(config);

        // It will skip 80 seconds.
        String filename = "D:\\audio\\1.mp3";
        String result = re.recognizeByFile(filename, 1);
        System.out.println(result);

        File file = new File(filename);
        byte[] buffer = new byte[3 * 1024 * 1024];
        if (!file.exists()) {
            return;
        }
        FileInputStream fin = null;
        int bufferLen = 0;
        try {
            fin = new FileInputStream(file);
            bufferLen = fin.read(buffer, 0, buffer.length);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                if (fin != null) {
                    fin.close();
                }
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        System.out.println("bufferLen=" + bufferLen);

        if (bufferLen <= 0)
            return;

        // It will skip 80 seconds from the begginning of (buffer).
        result = re.recognizeByFileBuffer(buffer, bufferLen, 1);
        System.out.println(result);
    }
}