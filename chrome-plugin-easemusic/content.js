// 在文件顶部添加这行代码来进行调试
console.log('Content script loaded');

let playerVisible = false;
let player;
let mediaRecorder;
let audioChunks = [];
let recordingTimeout;
let isRecording = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "togglePlayer") {
    if (!player) {
      createPlayer();
    }
    togglePlayer();
  }
});

function createPlayer() {
  player = document.createElement('div');
  player.id = 'ease-music-player';

  const targetUrl = "https://app102.acapp.acwing.com.cn";

  player.innerHTML = `
    <div id="ease-music-header">拖动此处移动播放器</div>
    <iframe src="${targetUrl}"></iframe>
    <div class="ease-music-controls">
      <button id="ease-music-record">开始识别</button>
      <button id="ease-music-close">关闭播放器</button>
    </div>
  `;
  document.body.appendChild(player);

  document.getElementById('ease-music-close').addEventListener('click', togglePlayer);
  document.getElementById('ease-music-record').addEventListener('click', toggleRecording);

  makeDraggable(player, document.getElementById('ease-music-header'));
}

function togglePlayer() {
  playerVisible = !playerVisible;
  player.style.display = playerVisible ? 'block' : 'none';

  // 移除这行代码，不再修改body的overflow
  // document.body.style.overflowY = playerVisible ? 'hidden' : '';
}

function toggleRecording() {
  const recordButton = document.getElementById('ease-music-record');
  if (isRecording) {
    stopRecording();
    recordButton.textContent = '开始识别';
    isRecording = false;
  } else {
    startRecording();
    recordButton.textContent = '识别中...';
    isRecording = true;
  }
}

function startRecording() {
  console.log('startRecording function called');
  audioChunks = [];

  navigator.mediaDevices.getUserMedia({ audio: true })
    .then(stream => {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)({
        sampleRate: 16000
      });

      const source = audioContext.createMediaStreamSource(stream);
      const destination = audioContext.createMediaStreamDestination();

      // 创建一个 ScriptProcessorNode 用于重采样
      const bufferSize = 4096;
      const scriptNode = audioContext.createScriptProcessor(bufferSize, 1, 1);

      scriptNode.onaudioprocess = (audioProcessingEvent) => {
        const inputBuffer = audioProcessingEvent.inputBuffer;
        const outputBuffer = audioProcessingEvent.outputBuffer;

        for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
          const inputData = inputBuffer.getChannelData(channel);
          const outputData = outputBuffer.getChannelData(channel);

          // 简单的线性插值重采样
          for (let i = 0; i < outputBuffer.length; i++) {
            const index = i * inputBuffer.sampleRate / 16000;
            const indexFloor = Math.floor(index);
            const indexCeil = Math.ceil(index);
            const fraction = index - indexFloor;

            outputData[i] = (1 - fraction) * inputData[indexFloor] + fraction * inputData[indexCeil];
          }
        }
      };

      source.connect(scriptNode);
      scriptNode.connect(destination);

      mediaRecorder = new MediaRecorder(destination.stream);

      mediaRecorder.ondataavailable = event => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        convertToWav(audioBlob).then(wavBlob => {
          sendAudioToServer(wavBlob);
        });
      };

      mediaRecorder.start();
      console.log('Recording started, actual sample rate:', audioContext.sampleRate);
    })
    .catch(error => {
      console.error('Error accessing microphone:', error);
    });
}

function stopRecording() {
  console.log('stopRecording function called');  // 添加这行来调试
  if (mediaRecorder && mediaRecorder.state === 'recording') {
    mediaRecorder.stop();
    clearTimeout(recordingTimeout);
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    console.log('Recording stopped');
  } else {
    console.log('No active recording to stop');
  }
}

function convertToWav(webmBlob) {
  return new Promise((resolve, reject) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const fileReader = new FileReader();

    fileReader.onload = function (event) {
      const audioData = event.target.result;
      console.log('音频数据大小:', audioData.byteLength, '字节');

      audioContext.decodeAudioData(audioData, function (buffer) {
        console.log('音频解码成功，采样率:', buffer.sampleRate);
        const wavBlob = audioBufferToWav(buffer);
        resolve(wavBlob);
      }, function (e) {
        console.error('音频解码失败:', e);
        // 如果解码失败，我们可以尝试直接发送原始的 WebM 数据
        resolve(new Blob([audioData], { type: 'audio/webm' }));
      });
    };

    fileReader.onerror = function (error) {
      console.error('文件读取失败:', error);
      reject('文件读取失败');
    };

    fileReader.readAsArrayBuffer(webmBlob);
  });
}

function audioBufferToWav(buffer, opt) {
  opt = opt || {};

  const numChannels = buffer.numberOfChannels;
  const sampleRate = buffer.sampleRate;
  const format = opt.float32 ? 3 : 1;
  const bitDepth = format === 3 ? 32 : 16;

  let result;
  if (numChannels === 2) {
    result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
  } else {
    result = buffer.getChannelData(0);
  }

  return encodeWAV(result, format, sampleRate, numChannels, bitDepth);
}

function interleave(inputL, inputR) {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);

  let index = 0;
  let inputIndex = 0;

  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function encodeWAV(samples, format, sampleRate, numChannels, bitDepth) {
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;

  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * bytesPerSample, true);
  if (format === 1) { // Raw PCM
    floatTo16BitPCM(view, 44, samples);
  } else {
    writeFloat32(view, 44, samples);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}

function writeString(view, offset, string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

function floatTo16BitPCM(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function writeFloat32(output, offset, input) {
  for (let i = 0; i < input.length; i++, offset += 4) {
    output.setFloat32(offset, input[i], true);
  }
}

function sendAudioToServer(audioBlob) {
  const formData = new FormData();
  var timestamp = Date.parse(new Date());
  const fileName = audioBlob.type === 'audio/wav' ? `${timestamp}.wav` : `${timestamp}.webm`;
  formData.append('audio', audioBlob, fileName);
  
  console.log('发送到服务器的文件类型:', audioBlob.type);
  console.log('文件大小:', audioBlob.size, '字节');

  fetch('https://app102.acapp.acwing.com.cn/api/uploadAudio', {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Origin': 'chrome-extension://' + chrome.runtime.id
    },
    body: formData
  })
  .then(response => {
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  })
  .then(data => {
    console.log('服务器响应:', data);
    if (data.artist && data.title) {
      displaySongResult(data);
    } else {
      console.error('未能识别到歌曲');
    }
  })
  .catch(error => {
    console.error('上传错误:', error);
    console.error('Error stack:', error.stack);
    // 在这里添加错误处理逻辑，比如显示一个错误消息给用户
  });
}

function displaySongResult(song) {
  const resultDiv = document.createElement('div');
  resultDiv.id = 'song-recognition-result';
  resultDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0,0,0,0.5);
    width: 300px;
    z-index: 10001;
    font-family: Arial, sans-serif;
    font-size: 14px;
  `;

  let html = '<div id="result-header" style="cursor: move; background-color: #f0f0f0; padding: 5px; margin-bottom: 10px;">拖动此处移动结果</div>';
  html += '<h2 style="color: #333; margin-bottom: 10px; font-size: 16px;">识别结果</h2>';

  html += `
    <div style="margin-bottom: 8px; padding: 8px; background-color: #f0f0f0; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;">
      <div>
        <strong style="color: #4a4a4a;">${song.title}</strong><br>
        <span style="color: #777;">${song.artist}</span>
      </div>
      <button id="add-song-info" style="
        background-color: #4CAF50;
        border: none;
        color: white;
        padding: 4px 8px;
        text-align: center;
        text-decoration: none;
        display: inline-block;
        font-size: 12px;
        cursor: pointer;
        border-radius: 3px;
        transition: background-color 0.3s;
      ">添加</button>
    </div>`;

  const closeButton = document.createElement('button');
  closeButton.id = 'close-result';
  closeButton.textContent = '关闭';
  closeButton.style.cssText = `
    background-color: #4CAF50;
    border: none;
    color: white;
    padding: 8px 16px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 14px;
    margin: 4px 2px;
    cursor: pointer;
    border-radius: 4px;
    transition: background-color 0.3s;
  `;

  resultDiv.innerHTML = html;
  resultDiv.appendChild(closeButton);
  document.body.appendChild(resultDiv);

  closeButton.addEventListener('mouseover', () => {
    closeButton.style.backgroundColor = '#45a049';
  });

  closeButton.addEventListener('mouseout', () => {
    closeButton.style.backgroundColor = '#4CAF50';
  });

  closeButton.addEventListener('click', () => {
    document.body.removeChild(resultDiv);
  });

  // 为"添加"按钮添加点击事件
  document.getElementById('add-song-info').addEventListener('click', function () {
    sendSongInfo(song.title, song.artist);

    // 点击后变灰并禁用
    this.style.backgroundColor = '#cccccc';
    this.style.cursor = 'default';
    this.disabled = true;
    this.textContent = '已添加';
  });

  makeDraggable(resultDiv, document.getElementById('result-header'));
}

function sendSongInfo(songName, singerName) {
  console.log(`添加歌曲信息：${songName} - ${singerName}`);
  chrome.runtime.sendMessage({
    action: "addSong",
    data: { title: songName, artist: singerName }
  }, response => {
    if (response.success) {
      console.log('API response:', response.data);
    } else {
      console.error('Error:', response.error);
    }
  });
}

function makeDraggable(element, dragHandle) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  dragHandle.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    // 获取鼠标光标的初始位置
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    // 当鼠标移动时调用函数
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    // 计算新的光标位置
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    // 设置元素的新位置
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    // 停止移动时，释放鼠标事件
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

// 检测当前网站并改变文字颜色的函数保持不变
// ...

// 在页面加载完成后执行
window.addEventListener('load', detectWebsiteAndChangeColor);