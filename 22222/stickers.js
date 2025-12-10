// stickers.js - 贴纸系统

let stickers = JSON.parse(localStorage.getItem('portfolio_stickers')) || {};

// 加载某块的贴纸
function loadStickForBlock(blockId) {
  const contentEl = document.querySelector(`.block-content[data-block-id="${blockId}"]`);
  if (!contentEl) return;
  
  contentEl.innerHTML = ''; // 清空现有贴纸
  
  const blockStickers = stickers[blockId] || [];
  blockStickers.forEach(sticker => {
    const stickerEl = createStickerElement(sticker);
    contentEl.appendChild(stickerEl);
  });
}

// 创建贴纸元素
function createStickerElement(sticker) {
  const el = document.createElement('div');
  el.className = 'sticker';
  el.dataset.id = sticker.id;
  el.style.left = sticker.x + 'px';
  el.style.top = sticker.y + 'px';
  el.style.width = sticker.width + 'px';
  el.style.height = sticker.height + 'px';
  
  if (sticker.type === 'text') {
    el.contentEditable = true;
    el.innerHTML = sticker.content || '双击编辑文本';
    el.addEventListener('input', () => saveStickerData());
  } else if (sticker.type === 'image') {
    const img = document.createElement('img');
    img.src = sticker.src;
    img.alt = '图片';
    el.appendChild(img);
    // 双击添加链接
    el.addEventListener('dblclick', () => promptImageLink(sticker.id));
  } else if (sticker.type === 'video') {
    const video = document.createElement('video');
    video.src = sticker.src;
    video.controls = true;
    el.appendChild(video);
  }
  
  // 使贴纸可拖拽（仅编辑模式）
  makeDraggable(el);
  
  return el;
}

// 使元素可拖拽
function makeDraggable(el) {
  let isDragging = false;
  let offsetX, offsetY;
  
  el.addEventListener('mousedown', (e) => {
    if (!document.body.classList.contains('edit-mode')) return;
    isDragging = true;
    offsetX = e.clientX - el.getBoundingClientRect().left;
    offsetY = e.clientY - el.getBoundingClientRect().top;
    el.style.zIndex = '1000';
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      el.style.zIndex = '10';
      saveStickerPosition(el);
    }
  });
}

// 保存贴纸位置
function saveStickerPosition(stickerEl) {
  const blockId = stickerEl.closest('.block-content').dataset.blockId;
  const id = stickerEl.dataset.id;
  const rect = stickerEl.getBoundingClientRect();
  const parentRect = stickerEl.parentElement.getBoundingClientRect();
  
  if (!stickers[blockId]) stickers[blockId] = [];
  const sticker = stickers[blockId].find(s => s.id === id);
  if (sticker) {
    sticker.x = rect.left - parentRect.left;
    sticker.y = rect.top - parentRect.top;
    sticker.width = rect.width;
    sticker.height = rect.height;
    saveStickers();
  }
}

// 保存所有贴纸
function saveStickers() {
  localStorage.setItem('portfolio_stickers', JSON.stringify(stickers));
}

// 保存单个贴纸内容
function saveStickerData() {
  // 此处简化：实际需遍历所有 editable 贴纸
  saveStickers();
}

// 添加贴纸（通过右键菜单或未来扩展）
function addStickerToBlock(blockId, type, data = {}) {
  if (!stickers[blockId]) stickers[blockId] = [];
  
  const id = 'sticker-' + Date.now();
  const sticker = {
    id,
    type,
    x: 100,
    y: 100,
    width: 200,
    height: 160,
    ...data
  };
  
  stickers[blockId].push(sticker);
  saveStickers();
  loadStickForBlock(blockId);
}

// 图片链接弹窗
function promptImageLink(stickerId) {
  const url = prompt('请输入图片超链接地址：');
  if (url) {
    // 保存链接（简化：实际需关联到 sticker）
    alert('链接已保存！退出编辑模式后生效。');
  }
}

// 全局函数
window.addStickerToBlock = addStickerToBlock;
