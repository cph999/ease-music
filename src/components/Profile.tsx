import React, { useEffect, useState } from "react";
import { Uploader, Image, Divider, Button, Input, Form, Flex, Toast, Card, Space, List } from 'react-vant';
import { instance } from '../utils/api.js'
import './Profile.css'
import LocalStorageUtil from "../utils/LocalStorageUtil";
import { Arrow, Like, AddO } from '@react-vant/icons'

function Profile({ setUserinfox }) {
    const userinfo = LocalStorageUtil.getItem("userinfo");
    const [image, setImage] = useState(userinfo.cover)
    const [form] = Form.useForm()
    const [friends, setFriends] = useState([])

    useEffect(() => {
        instance.post('/friends').then(res => {
            setFriends(res.data.datas)
        })
    }, [])
    const onFinish = values => {
        console.log(values)
    }
    const upload = async (file) => {
        try {
            const formData = new FormData();
            const timestamp = Date.now();
            formData.append('file', file, timestamp + '.png');
            const response = await instance.post('/uploadFile', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setImage(response.data.data.url)
            userinfo.cover = response.data.data.url;
            setUserinfox(userinfo)
            LocalStorageUtil.setItem("userinfo", userinfo);
            return response.data.data;
        } catch (error) {
            return { url: userinfo.cover }
        }
    }
    const handleUpdate = async () => {
        const nickname = form.getFieldValue("nickname");
        const age = form.getFieldValue("age");
        const address = form.getFieldValue("address");
        const phone = form.getFieldValue("phone");

        await instance.post('/user/update', {
            nickname,
            age,
            address,
            phone,
        }).then(res => {
            if (res.data.code === 200) {
                const userinfo = LocalStorageUtil.getItem("userinfo");
                userinfo.nickname = nickname;
                userinfo.age = age;
                userinfo.address = address;
                userinfo.phone = phone;
                LocalStorageUtil.setItem("userinfo", userinfo);
                Toast.success(res.data.message);
            }
        })
    }

    return (
        <div className="profile-container">
            <div>
                <div className="heder-box">
                    <Image round fit='cover' width='30%' height='30%' src={image} />
                    <Uploader uploadIcon={<AddO />} upload={upload} accept='*' maxCount={1} style={{ position: 'absolute', bottom: '10%', right: 0 }} />
                    <Divider />
                    <Button className="button-custom" nativeType='submit' type='primary' block onClick={() => { handleUpdate() }}>
                        保存
                    </Button>
                </div>

                <div className="form-container">
                    <Form
                        form={form}
                        onFinish={onFinish}
                        initialValues={{
                            nickname: userinfo.nickname || '',
                            phone: userinfo.phone || '',
                            age: userinfo.age || 0,
                            address: userinfo.address || '',
                        }}
                    >
                        <Flex>
                            <Flex.Item span={10}>
                                <Form.Item
                                    labelWidth="3em"
                                    name='nickname'
                                    label='昵称'
                                >
                                    <Input placeholder='昵称' />
                                </Form.Item>
                            </Flex.Item>
                            <Flex.Item span={14}>
                                <Form.Item
                                    labelWidth="4em"
                                    name='phone'
                                    label='联系方式'
                                >
                                    <Input placeholder='联系方式' />
                                </Form.Item></Flex.Item>
                        </Flex>
                        <Flex>
                            <Flex.Item span={10}>
                                <Form.Item
                                    name='age'
                                    label='年龄'
                                    labelWidth="3em"
                                >
                                    <Input placeholder='年龄' />
                                </Form.Item>
                            </Flex.Item>
                            <Flex.Item span={14}>
                                <Form.Item
                                    name='address'
                                    labelWidth="3em"
                                    label='居住地'
                                >
                                    <Input placeholder='居住地' />
                                </Form.Item></Flex.Item>
                        </Flex>
                    </Form>
                    <Divider />

                    好友列表
                    <List>
                        {friends.map((obj, i) => (
                            <Card key={i} round style={{ marginBottom: 20 }}>
                                <Card.Cover onClick={() => Toast.info('点击了Cover区域')}>
                                    <Image src={obj.cover} />
                                </Card.Cover>
                                <Card.Header
                                    extra={<Arrow />}
                                    onClick={() => Toast.info('点击了Header区域')}
                                >
                                    {obj.nickname || obj.username}
                                </Card.Header>
                                <Card.Body onClick={() => Toast.info('点击了Body区域')}>
                                    {obj.age || 20}  {obj.address || "河北省"}   {obj.phone || "8208208820"}
                                </Card.Body>
                                <Card.Footer>
                                    <Space>
                                        <Button round size='small'>
                                            更多
                                        </Button>
                                        <Button
                                            icon={<Like />}
                                            round
                                            color='linear-gradient(to right, #ff6034, #ee0a24)'
                                            size='small'
                                        >
                                            Like
                                        </Button>
                                    </Space>
                                </Card.Footer>
                            </Card>
                        ))}
                    </List>

                </div>
            </div>
        </div>
    )
}

export default Profile;
