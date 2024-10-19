package com.cph.musicbackend.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class QueryHelper {

    /**
     * txt|jsonp|xml
     */
    public  String DATATYPE="text";

    public  String get(String urlString,String token) {
        try {
            URL url = new URL(urlString);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setConnectTimeout(5 * 1000);
            conn.setReadTimeout(5 * 1000);
            conn.setDoInput(true);
            conn.setDoOutput(true);
            conn.setUseCaches(false);
            conn.setInstanceFollowRedirects(false);
            conn.setRequestMethod("GET");
            conn.setRequestProperty("token",token);
            int responseCode = conn.getResponseCode();
            if (responseCode == 200) {
                StringBuilder builder = new StringBuilder();
                BufferedReader br = new BufferedReader(
                        new InputStreamReader(conn.getInputStream(),"utf-8"));
                for (String s = br.readLine(); s != null; s = br
                        .readLine()) {
                    builder.append(s);
                }
                br.close();
                return builder.toString();
            }
        } catch (IOException e) {
            e.printStackTrace();
        }
        return null;
    }
    public  String queryIP(String ip){
        String url="https://api.ip138.com/ip/?ip="+ip+"&datatype="+DATATYPE;
        String token="f02642637dbd63aaa25a737afcd6d343";
        return get(url,token);
    }

    public QueryHelper() {
    }

    public String getDATATYPE() {
        return DATATYPE;
    }

    public void setDATATYPE(String DATATYPE) {
        this.DATATYPE = DATATYPE;
    }
}

