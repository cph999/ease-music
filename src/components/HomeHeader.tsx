import React from 'react';
import { ServiceO } from '@react-vant/icons';
import { instance } from '../utils/api';
import { Image, Toast, Search, Popup, PopupPosition, ConfigProvider, List, Cell } from 'react-vant'
import { useState, useEffect, useCallback } from 'react';
import defaultIcon from '../assets/images/3.png';
import './HomeHeader.css'
import { Like } from '@react-vant/icons';


const HomeHeader = ({ setCurrentSong, search, setSearch, userinfo, list, setList }) => {
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [audioContext, setAudioContext] = useState(null);
    const [audioInput, setAudioInput] = useState(null);
    const [recorder, setRecorder] = useState(null);
    const [state, setState] = useState<PopupPosition>('')
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    const [finished, setFinished] = useState<boolean>(false)

    const onLoad = async () => {
        const data = await instance.post('/likeList')
        if (data.data.code === 200) {
            setList(data.data.datas);
            setFinished(true);
        }
    }

    const theme = {
        // '--rv-popup-title-color': '#ffffff',
        '--rv-popup-background-color': '#FFB6C1',
    }

    const handleLikeClick = (music) => {
        console.log("click song", music)
        setCurrentSong(music);
    }

    function writeString(view, offset, string) {
        for (let i = 0; i < string.length; i++) {
            view.setUint8(offset + i, string.charCodeAt(i));
        }
    }
    function floatTo16BitPCM(output, offset, input) {
        for (let i = 0; i < input.length; i++, offset += 2) {
            let s = Math.max(-1, Math.min(1, input[i]));
            output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }
    }
    function writeAudioBufferToWav(audioBuffer, numChannels, sampleRate) {
        const buffer = new ArrayBuffer(44 + audioBuffer.length * 2);
        const view = new DataView(buffer);
        writeString(view, 0, 'RIFF');
        view.setUint32(4, 36 + audioBuffer.length * 2, true);
        writeString(view, 8, 'WAVE');
        writeString(view, 12, 'fmt ');
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, numChannels, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * numChannels * 2, true);
        view.setUint16(32, numChannels * 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, 'data');
        view.setUint32(40, audioBuffer.length * 2, true);
        floatTo16BitPCM(view, 44, audioBuffer);
        return new Blob([view], { type: 'audio/wav' });
    }
    const stopRecording = async () => {
        if (audioContext && audioInput && recorder && mediaRecorder && isRecording) {
            setIsRecording(false); // 立即设置为非录音状态
            if (mediaRecorder.stream) {
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
            recorder.disconnect();
            audioInput.disconnect();
            if (audioContext.state !== 'closed') {
                await audioContext.close();
            }
            const audioData = mediaRecorder.audioChunks.reduce((acc, chunk) => {
                return new Float32Array([...acc, ...chunk]);
            }, new Float32Array());
            const wavBlob = writeAudioBufferToWav(audioData, 1, audioContext.sampleRate);
            setAudioContext(null);
            setAudioInput(null);
            setRecorder(null);
            setMediaRecorder(null);
            Toast.success('识别中...');
            await sendAudioToBackend(wavBlob);
        }
    };
    const startRecording = useCallback(async () => {
        if (isRecording) {
            await stopRecording();
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const source = context.createMediaStreamSource(stream);
            const node = context.createScriptProcessor(4096, 1, 1);
            let audioChunks = [];
            node.onaudioprocess = (e) => {
                const inputBuffer = e.inputBuffer;
                const channelData = inputBuffer.getChannelData(0);
                audioChunks.push(new Float32Array(channelData));
            };
            source.connect(node);
            node.connect(context.destination);
            setAudioContext(context);
            setAudioInput(source);
            setRecorder(node);
            setMediaRecorder({ audioChunks, stream });
            setIsRecording(true);
            Toast.success('开始识别，再次点击右上角按钮结束识别');
        } catch (error) {
            console.error('录音失败:', error);
            Toast.fail('无法访问麦克风');
        }
    }, [isRecording, stopRecording]);
    const sendAudioToBackend = async (audioBlob) => {
        try {
            const formData = new FormData();
            const timestamp = Date.now();
            formData.append('audio', audioBlob, `recording_${timestamp}.wav`);
            const response = await instance.post('/uploadAudio', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            Toast.success({
                message: "识别结果：《" + response.data.title + "》，" + response.data.artist,
                duration: 5000 // 设置持续时间为 5000 毫秒（5 秒）
            });
        } catch (error) {
            console.error('音频上传失败:', error);
            Toast.fail({
                message: '音频上传失败',
                duration: 5000 // 错误消息也设置为 5 秒
            });
        }
    };
    useEffect(() => {
        return () => {
            if (audioContext && audioContext.state !== 'closed') {
                audioContext.close();
            }
            if (audioInput) {
                audioInput.disconnect();
            }
            if (recorder) {
                recorder.disconnect();
            }
            if (mediaRecorder && mediaRecorder.stream) {
                mediaRecorder.stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [audioContext, audioInput, recorder, mediaRecorder]);

    return <>
        {
            userinfo !== null && JSON.stringify(userinfo) !== '{}' && (
                <ConfigProvider themeVars={theme}>
                    <div ref={wrapperRef} className='self-container'>
                        <Popup
                            teleport={() => wrapperRef.current}
                            visible={state === 'left'}
                            title='个人中心'
                            style={{ width: '43%', height: '100%' }}
                            position='left'
                            round
                            onClose={() => setState('')}
                        >
                            <List finished={true}>
                                <Image round fit='cover' width='50%' height='50%' src={(userinfo && userinfo.cover) || defaultIcon} />
                                <div className='self-container-header'>
                                    <p>{userinfo.nickname}</p>
                                    <p>{userinfo.username}</p>
                                </div>
                                <div className="like-list">

                                    <List finished={finished} onLoad={onLoad}>
                                        {list.map((a, i) => (
                                            <Cell key={i} onClick={() => { handleLikeClick(a) }}>{a.title} {a.artist}  <Like className="control-icon control-side" style={{ "color": "red" }} fontSize="1em" /></Cell>
                                        ))}
                                    </List>
                                </div>

                            </List>

                        </Popup>
                    </div>
                </ConfigProvider>
            )
        }


        <div
            style={{
                position: 'absolute',
                top: '16px',
                left: '5px',
                right: '10px',
                zIndex: 1000,
                display: 'flex',
                textAlign: 'center',
                paddingLeft: '6px',
            }}
        >
            <Image round fit='cover' width='10%' height='10%' src={(userinfo && userinfo.cover) || defaultIcon} onClick={() => setState('left')} style={{
                marginTop: '6px',
            }} />
            <Search
                style={{ width: '100%' }}
                value={search}
                shape='round'
                background='#00000000'
                onChange={setSearch}
                placeholder="请输入搜索关键词"
                // showAction
                onSearch={async (val) => {
                    const response = await instance.post("/search", { "title": val });
                    if (response.data instanceof Array) {
                        if (response.data.length > 0) {
                            setCurrentSong(response.data[0]);
                        }
                    } else {
                        Toast.fail(response.data)
                    }
                }}
                onCancel={() => {
                    setSearch('');
                }}
                onClear={() => {
                    setSearch('');
                }}
            />

            <ServiceO fontSize="2.5em" onClick={!isRecording ? startRecording : stopRecording} />
        </div>
    </>
}

export default HomeHeader;
