package com.cph.musicbackend.utils;

public class SnowflakeIdGenerator {
    // 起始时间戳，这里设定为2024-01-01 00:00:00 UTC对应的毫秒数，可按需调整
    private static final long START_TIMESTAMP = 1704067200000L;

    // 机器标识位数，5位可以表示0 - 31台机器，可根据实际机器数量调整
    private static final int WORKER_ID_BITS = 5;

    // 数据中心标识位数，5位可以表示0 - 31个数据中心，可按需配置
    private static final int DATA_CENTER_ID_BITS = 5;

    // 序列号位数，12位可以在同一毫秒内表示0 - 4095个不同ID，用于同一时间区分不同请求
    private static final int SEQUENCE_BITS = 12;

    // 机器标识左移位数
    private static final int WORKER_ID_SHIFT = SEQUENCE_BITS;

    // 数据中心标识左移位数
    private static final int DATA_CENTER_ID_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS;

    // 时间戳左移位数
    private static final int TIMESTAMP_LEFT_SHIFT = SEQUENCE_BITS + WORKER_ID_BITS + DATA_CENTER_ID_BITS;

    // 最大机器标识，通过位运算确定，用于限定机器标识取值范围
    private static final int MAX_WORKER_ID = ~(-1 << WORKER_ID_BITS);

    // 最大数据中心标识，同理限定数据中心标识取值范围
    private static final int MAX_DATA_CENTER_ID = ~(-1 << DATA_CENTER_ID_BITS);

    // 最大序列号，限定同一毫秒内序列号的取值范围
    private static final int MAX_SEQUENCE = ~(-1 << SEQUENCE_BITS);

    // 数据中心标识，自行配置，范围0 - 31，这里初始化为0，可通过构造函数等方式传入实际值
    private long dataCenterId = 0;

    // 机器标识，自行配置，范围0 - 31，这里初始化为0，同样可通过构造函数传入合适值
    private long workerId = 0;

    // 上次时间戳，用于和当前时间戳对比判断是否在同一毫秒内
    private long lastTimestamp = -1L;

    // 序列号，同一毫秒内用于区分不同ID生成请求，初始化为0
    private int sequence = 0;


    // 构造函数，用于传入数据中心标识和机器标识并进行合法性校验
    public SnowflakeIdGenerator(long dataCenterId, long workerId) {
        if (dataCenterId > MAX_DATA_CENTER_ID || dataCenterId < 0) {
            throw new IllegalArgumentException("Data center ID can't be greater than " + MAX_DATA_CENTER_ID + " or less than 0");
        }
        if (workerId > MAX_WORKER_ID || workerId < 0) {
            throw new IllegalArgumentException("Worker ID can't be greater than " + MAX_WORKER_ID + " or less than 0");
        }
        this.dataCenterId = dataCenterId;
        this.workerId = workerId;
    }

    // 生成下一个唯一ID的核心方法
    public synchronized long generateId() {
        long currentTimestamp = System.currentTimeMillis();
        // 处理时间回拨情况，如果当前时间戳小于上次时间戳，说明时间倒退了，这里简单抛出异常，实际可做更复杂处理，比如等待时间追平等
        if (currentTimestamp < lastTimestamp) {
            throw new RuntimeException("Clock moved backwards. Refusing to generate id.");
        }

        if (currentTimestamp == lastTimestamp) {
            // 在同一毫秒内，序列号自增
            sequence = (sequence + 1) & MAX_SEQUENCE;
            // 如果序列号达到最大值，说明同一毫秒内生成ID数量超过上限，需要等待到下一毫秒
            if (sequence == 0) {
                currentTimestamp = tilNextMillis(lastTimestamp);
            }
        } else {
            // 进入新的一毫秒，序列号重置为0
            sequence = 0;
        }

        lastTimestamp = currentTimestamp;

        // 通过位运算组合各部分信息生成64位的唯一ID
        return ((currentTimestamp - START_TIMESTAMP) << TIMESTAMP_LEFT_SHIFT) |
                (dataCenterId << DATA_CENTER_ID_SHIFT) |
                (workerId << WORKER_ID_SHIFT) |
                sequence;
    }

    // 等待到下一毫秒的方法，不断循环获取时间戳，直到大于上次时间戳
    private long tilNextMillis(long lastTimestamp) {
        long timestamp = System.currentTimeMillis();
        while (timestamp <= lastTimestamp) {
            timestamp = System.currentTimeMillis();
        }
        return timestamp;
    }
}