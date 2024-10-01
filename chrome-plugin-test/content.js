let playerVisible = false;
let player;

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
  player.innerHTML = `
    <iframe src="${chrome.runtime.getURL('player.html')}" allowfullscreen></iframe>
    <button id="ease-music-close">关闭播放器</button>
  `;
  document.body.appendChild(player);

  document.getElementById('ease-music-close').addEventListener('click', togglePlayer);
}

function togglePlayer() {
  playerVisible = !playerVisible;
  player.style.display = playerVisible ? 'block' : 'none';
  
  // 移除这行代码，不再修改body的overflow
  // document.body.style.overflowY = playerVisible ? 'hidden' : '';
}

// 检测当前网站并改变文字颜色的函数保持不变
// ...

// 在页面加载完成后执行
window.addEventListener('load', detectWebsiteAndChangeColor);