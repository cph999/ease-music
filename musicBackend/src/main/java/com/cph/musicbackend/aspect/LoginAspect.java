package com.cph.musicbackend.aspect;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.cph.musicbackend.entity.Music;
import com.cph.musicbackend.entity.User;
import com.cph.musicbackend.mapper.MusicMapper;
import com.cph.musicbackend.mapper.UserMapper;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Pointcut;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import javax.servlet.http.HttpServletRequest;
import java.util.Date;
import java.util.List;

@Aspect
@Component
public class LoginAspect {

    @Autowired
    UserMapper userMapper;

    @Autowired
    MusicMapper musicMapper;
    /**
     * 声明切面点拦截那些类
     */
    @Pointcut("@annotation(com.cph.musicbackend.aspect.RecognizeAddress)")
    private void pointCutMethodController() {}

    /**
     * 环绕通知前后增强
     */
    @Around(value = "pointCutMethodController()")
    public Object doAroundService(ProceedingJoinPoint joinPoint) throws Throwable {
        ServletRequestAttributes requestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        if (requestAttributes != null) {
            HttpServletRequest request = requestAttributes.getRequest();

            // 获取 IP 地址
            String ipAddress = request.getHeader("X-Forwarded-For");
            if (ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getHeader("Proxy-Client-IP");
            }
            if (ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getHeader("WL-Proxy-Client-IP");
            }
            if (ipAddress == null || ipAddress.length() == 0 || "unknown".equalsIgnoreCase(ipAddress)) {
                ipAddress = request.getRemoteAddr();
            }
            ipAddress = ipAddress.split(",")[0]; // 如果有多个代理IP，取第一个

            String token = request.getHeader("authorization");
            if(StringUtils.isBlank(token)){
                throw new Exception("请先登录");
            }
            User user = userMapper.selectOne(new QueryWrapper<User>().eq("token", token));
            if(user == null )throw new Exception("请先登录");
            user.setIpAddress(ipAddress);
            UserContext.setCurrentUser(user);
        }
        // 执行方法
        Object result = joinPoint.proceed();
        return result;
    }


}
