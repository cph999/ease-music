package com.cph.musicbackend.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.core.toolkit.StringUtils;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.cph.musicbackend.aspect.RecognizeAddress;
import com.cph.musicbackend.aspect.UserContext;
import com.cph.musicbackend.common.CommonResult;
import com.cph.musicbackend.entity.Message;
import com.cph.musicbackend.entity.Music;
import com.cph.musicbackend.entity.User;
import com.cph.musicbackend.entity.search.BaseSearch;
import com.cph.musicbackend.mapper.MessageMapper;
import com.cph.musicbackend.mapper.MusicMapper;
import com.cph.musicbackend.mapper.UserMapper;
import com.cph.musicbackend.utils.MD5Utils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.util.Assert;
import org.springframework.util.CollectionUtils;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.rmi.server.UID;
import java.util.*;
import java.util.stream.Collectors;

@RestController
public class UserController {

    @Autowired
    UserMapper userMapper;

    @Value("${md5.salt}")
    private String salt;

    @Autowired
    MusicMapper musicMapper;

    @Autowired
    MessageMapper messagesMapper;

    @Value("${file.upload.path}")
    private String path;

    @Value("${file.upload.url}")
    private String url;

    @PostMapping("/api/login")
    public CommonResult login(@RequestBody User loginUser) {
        User user = userMapper.selectOne(new QueryWrapper<User>().eq("username", loginUser.getUsername()));
        Assert.notNull(user, "用户不存在");
        String s = MD5Utils.MD5Lower(loginUser.getPassword(), salt);
        if (s.equals(user.getPassword())) {
            user.setToken(UUID.randomUUID().toString());
            userMapper.updateById(user);
            return new CommonResult(200, "登录成功", user);
        } else {
            return new CommonResult(400, "账号或密码错误", null);
        }
    }

    @PostMapping("/api/slogin")
    public CommonResult slogin(@RequestBody User loginUser) {
        User user = userMapper.selectOne(new QueryWrapper<User>().eq("username", loginUser.getUsername()));
        Assert.notNull(user, "用户不存在");
        String s = MD5Utils.MD5Lower(loginUser.getPassword(), salt);
        if (s.equals(user.getPassword())) {
            user.setSuperToken(UUID.randomUUID().toString());
            userMapper.updateById(user);
            return new CommonResult(200, "登录成功", user);
        } else {
            return new CommonResult(400, "账号或密码错误", null);
        }
    }

    @PostMapping("/api/register")
    public CommonResult register(@RequestBody User registerUser) {
        User user = userMapper.selectOne(new QueryWrapper<User>().eq("username", registerUser.getUsername()));
        Assert.isNull(user, "用户已存在");
        registerUser.setPassword(MD5Utils.MD5Lower(registerUser.getPassword(), salt));
        registerUser.setCover("https://yup1.oss-cn-hangzhou.aliyuncs.com/images/images/3.png");
        userMapper.insert(registerUser);
        List<Music> musics = musicMapper.selectList(new QueryWrapper<Music>()
                .like("url", "https://app102.acapp.acwing.com.cn").eq("is_save", 1).last("limit 20").orderByDesc("id"));
        registerUser.setMusics(musics);
        userMapper.addDefaultMusics(registerUser, new Date());
        return new CommonResult(200, "注册成功", null);
    }

    @PostMapping("/api/searchUser")
    @RecognizeAddress
    public CommonResult search(@RequestBody User user) {
        QueryWrapper<User> like = new QueryWrapper<User>().like("nickname", user.getNickname()).or().like("username", user.getUsername()).orderByDesc("id");
        return new CommonResult(200, "查询成功", userMapper.selectList(like));
    }

    @PostMapping("/api/addFriend")
    @RecognizeAddress
    public CommonResult addFriend(@RequestBody Message message) {
        if (message.getFromId().equals(message.getToId())) return new CommonResult(200, "请勿添加自己为好友", null);
        QueryWrapper<Message> messageQueryWrapper = new QueryWrapper<>();
        QueryWrapper<Message> wrapper = messageQueryWrapper.nested(w -> w.eq("from_id", message.getFromId())
                .and(x -> x.eq("to_id", message.getToId()))).or(w -> w.eq("to_id", message.getFromId()).and(x -> x.eq("from_id", message.getToId())));
        List<Message> messages = messagesMapper.selectList(wrapper);
        if (!CollectionUtils.isEmpty(messages)) return new CommonResult(200, "已经是好友了，无需重复添加", null);
        message.setCreatedTime(new Date());
        messagesMapper.insert(message);
        return new CommonResult(200, "查询成功", null);
    }

    /**
     * 修改头像
     * @param file
     * @return
     * @throws IOException
     */
    @PostMapping("/api/uploadCover")
    @RecognizeAddress
    public Object updateCover(@RequestParam("file") MultipartFile file) throws IOException {

        String fileName = storageFile(file);
        User currentUser = UserContext.getCurrentUser();
        currentUser.setCover(url + file.getOriginalFilename());
        userMapper.updateById(currentUser);
        HashMap<String, String> res = new HashMap<>();
        res.put("url", url + fileName);
        return new CommonResult(200, "修改成功", res);
    }

    @PostMapping("/api/uploadFile")
    @RecognizeAddress
    public Object uploadFile(@RequestParam("file") MultipartFile file) throws IOException {

        String fileName = storageFile(file);
        HashMap<String, String> res = new HashMap<>();
        res.put("url", url + fileName);
        return new CommonResult(200, "上传成功", res);
    }

    public String storageFile(MultipartFile file) throws IOException {

        if (file.isEmpty()) {
            return "{\"error\": \"请选择一个文件上传\"}";
        }

        String fileName = file.getOriginalFilename();
        // 指定文件保存路径
        String uploadDir = path;
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }
        // 保存文件
        File destFile = new File(dir.getAbsolutePath() + File.separator + fileName);
        file.transferTo(destFile);
        return fileName;
    }

    @PostMapping("/api/user/update")
    @RecognizeAddress
    public Object update(@RequestBody User user) throws IOException {
        User currentUser = UserContext.getCurrentUser();
        user.setId(currentUser.getId());
        userMapper.updateById(user);
        return new CommonResult(200, "修改成功", null);
    }

    /**
     * 当前用户的所有朋友
     * @return
     * @throws IOException
     */
    @PostMapping("/api/friends")
    @RecognizeAddress
    public CommonResult friends() throws IOException {
        User currentUser = UserContext.getCurrentUser();
        QueryWrapper<Message> wrapper = new QueryWrapper<>();
        wrapper.eq("from_id", currentUser.getId()).or().eq("to_id", currentUser.getId());
        List<Message> messages = messagesMapper.selectList(wrapper);
        List<Integer> ids = messages.stream().map(m -> {
            if (m.getFromId().equals(currentUser.getId())) return m.getToId();
            else {
                return m.getFromId();
            }
        }).collect(Collectors.toList());
        HashSet<Integer> sets = new HashSet<Integer>(ids);
        sets.remove(currentUser.getId());
        List<User> users = userMapper.selectList(new QueryWrapper<User>().in("id", sets));
        return new CommonResult(200, "修改成功", users);
    }

    /**
     * 获取全部用户
     * @return
     * @throws IOException
     */
    @PostMapping("/api/getFriendsList")
    @RecognizeAddress
    public CommonResult getFriendsList(@RequestBody BaseSearch baseSearch) throws IOException {
        User currentUser = UserContext.getCurrentUser();
        if( currentUser.getIsSuper() == 1){
            Page<User> userPage = new Page<>(baseSearch.getPageNum(), baseSearch.getPageSize());
            QueryWrapper<User> wrapper = new QueryWrapper<User>().like(StringUtils.isNotBlank(baseSearch.getSearch()), "nickname", baseSearch.getSearch())
                    .or().like(StringUtils.isNotBlank(baseSearch.getSearch()), "username", baseSearch.getSearch());
            IPage<User> userIPage = userMapper.selectPage(userPage, wrapper);
            return new CommonResult(200, "查询成功", null,userIPage.getRecords(), userIPage.getTotal());
        }
        return new CommonResult(401, "权限不足", null);
    }

    /**
     * 删除用户
     * @return
     * @throws IOException
     */
    @PostMapping("/api/deleteUser")
    @RecognizeAddress
    public CommonResult deleteUser(@RequestBody User user) throws IOException {
        User currentUser = UserContext.getCurrentUser();
        if( currentUser.getIsSuper() == 1){
            userMapper.deleteById(user.getId());
            return new CommonResult(200, "删除用户成功", null);
        }
        return new CommonResult(401, "权限不足", null);
    }


    /**
     * 修改用户信息
     * @return
     * @throws IOException
     */
    @PostMapping("/api/updateUser")
    @RecognizeAddress
    public CommonResult updateUser(@RequestBody User user) throws IOException {
        User currentUser = UserContext.getCurrentUser();
        if( currentUser.getIsSuper() == 1){
            userMapper.updateById(user);
            return new CommonResult(200, "修改用户信息成功", null);
        }
        return new CommonResult(401, "权限不足", null);
    }
}