package com.cph.musicbackend.aspect;

import com.cph.musicbackend.entity.User;

public class UserContext {

    // 定义 ThreadLocal 来存储每个线程的用户信息
    private static ThreadLocal<User> userThreadLocal = new ThreadLocal<>();

    // 设置当前线程的用户
    public static void setCurrentUser(User user) {
        userThreadLocal.set(user);
    }

    // 获取当前线程的用户
    public static User getCurrentUser() {
        return userThreadLocal.get();
    }

    // 清除当前线程的用户信息
    public static void clear() {
        userThreadLocal.remove();
    }
}
