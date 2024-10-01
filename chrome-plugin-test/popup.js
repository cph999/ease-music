document.addEventListener('DOMContentLoaded', function() {
  const toggleButton = document.getElementById('togglePlayer');
  const statusDiv = document.getElementById('status');

  toggleButton.addEventListener('click', function() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {action: "togglePlayer"});
    });
  });

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.type === 'playerStatus') {
      statusDiv.textContent = '状态: ' + (request.isVisible ? '显示' : '隐藏');
    }
  });

  console.log('popup.js 已加载');
});
