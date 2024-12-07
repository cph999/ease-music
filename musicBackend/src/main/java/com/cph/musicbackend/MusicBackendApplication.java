package com.cph.musicbackend;

import com.cph.musicbackend.utils.QueryHelper;
import com.cph.musicbackend.utils.SnowflakeIdGenerator;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import java.util.Date;

@SpringBootApplication
@EnableScheduling
@MapperScan("com.cph.musicbackend.mapper")
public class MusicBackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(MusicBackendApplication.class, args);
    }

//    public static void main(String[] args) {
//        SnowflakeIdGenerator idGenerator = new SnowflakeIdGenerator(1l, 9l);  // 传入合适的数据中心标识和机器标识
//        for (int i = 0; i < 1000; i++) {
//            long id = idGenerator.generateId();
//            System.out.println(Long.toBinaryString(id) + " " +id);  // 输出二进制形式的ID，便于查看
//        }
//    }
}
