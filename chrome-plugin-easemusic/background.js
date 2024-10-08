chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.sendMessage(tab.id, {action: "togglePlayer"});
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "sendAudio") {
    fetch('https://app102.acapp.acwing.com.cn/api/uploadAudio', {
      method: 'POST',
      body: request.formData
    })
    .then(response => response.json())
    .then(data => {
      sendResponse({success: true, data: data});
    })
    .catch(error => {
      console.error('Error:', error);
      sendResponse({success: false, error: error.message});
    });
    return true;  // 保持消息通道开放
  }
  
  if (request.action === "addSong") {
    fetch('https://app102.acapp.acwing.com.cn/api/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request.data)
    })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      sendResponse({success: true, data: data});
    })
    .catch(error => {
      console.error('Error:', error);
      sendResponse({success: false, error: error.message});
    });
    return true;  // 保持消息通道开放
  }
});