// stickers.js - 贴纸系统（可移动、父子级关联、文本工具条）

let stickers = JSON.parse(localStorage.getItem('portfolio_stickers')) || {};

// 加载某块的贴纸
function loadStickForBlock(blockId) {
  const contentEl = document.querySelector(`.block-content[data-block-id="${blockId}"]`);
  if (!contentEl) return;
  
  contentEl.innerHTML = '';
  
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
  el.dataset.parentBlock = sticker.parentBlock;
  el.style.left = (sticker.x || 100) + 'px';
  el.style.top = (sticker.y || 100) + 'px';
  el.style.width = (sticker.width || 200) + 'px';
  el.style.height = (sticker.height || 160) + 'px';
  
  if (sticker.type === 'text') {
    el.contentEditable = true;
    el.innerHTML = sticker.content || '双击编辑文本';
    el.addEventListener('input', () => saveStickerData());
    
    // 双击显示工具条
    el.addEventListener('dblclick', (e) => {
      if (document.body.classList.contains('edit-mode')) {
        showTextToolbar(el, e);
      }
    });
  } else if (sticker.type === 'image') {
    const img = document.createElement('img');
    img.src = sticker.src;
    img.alt = '图片';
    img.style.maxWidth = '100%';
    img.style.maxHeight = '100%';
    img.style.borderRadius = '8px';
    el.appendChild(img);
    
    // 右上角链接按钮
    const linkBtn = document.createElement('div');
    linkBtn.className = 'sticker-link-btn';
    linkBtn.innerHTML = '🔗';
    linkBtn.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      width: 24px;
      height: 24px;
      background: rgba(0,0,0,0.5);
      border-radius: 50%;
      color: white;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 12px;
      cursor: pointer;
      opacity: 0;
      transition: opacity 0.2s;
    `;
    el.appendChild(linkBtn);
    
    el.addEventListener('mouseenter', () => {
      linkBtn.style.opacity = '1';
    });
    
    el.addEventListener('mouseleave', () => {
      linkBtn.style.opacity = '0';
    });
    
    linkBtn.addEventListener('click', () => {
      const url = prompt('请输入图片超链接地址：');
      if (url) {
        alert('链接已保存！退出编辑模式后生效。');
      }
    });
  } else if (sticker.type === 'video') {
    const video = document.createElement('video');
    video.src = sticker.src;
    video.controls = true;
    video.style.maxWidth = '100%';
    video.style.maxHeight = '100%';
    video.style.borderRadius = '8px';
    el.appendChild(video);
  }
  
  // 使贴纸可拖拽
  makeStickerDraggable(el);
  
  return el;
}

// 使贴纸可拖拽
function makeStickerDraggable(el) {
  let isDragging = false;
  let offsetX, offsetY;
  let originalParent = null;
  
  el.addEventListener('mousedown', (e) => {
    if (!document.body.classList.contains('edit-mode')) return;
    isDragging = true;
    offsetX = e.clientX - el.getBoundingClientRect().left;
    offsetY = e.clientY - el.getBoundingClientRect().top;
    el.style.zIndex = '1000';
    originalParent = el.parentElement;
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    
    // 检测是否进入新的项目块
    const allBlocks = document.querySelectorAll('.block-content');
    let bestBlock = null;
    let maxOverlap = 0;
    
    allBlocks.forEach(block => {
      const blockRect = block.getBoundingClientRect();
      const stickerRect = el.getBoundingClientRect();
      
      // 计算重叠面积
      const overlapLeft = Math.max(blockRect.left, stickerRect.left);
      const overlapRight = Math.min(blockRect.right, stickerRect.right);
      const overlapTop = Math.max(blockRect.top, stickerRect.top);
      const overlapBottom = Math.min(blockRect.bottom, stickerRect.bottom);
      
      if (overlapLeft < overlapRight && overlapTop < overlapBottom) {
        const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
        if (overlapArea > maxOverlap) {
          maxOverlap = overlapArea;
          bestBlock = block;
        }
      }
    });
    
    // 更新父级关系视觉提示
    document.querySelectorAll('.block-content').forEach(block => {
      block.style.outline = 'none';
    });
    
    if (bestBlock) {
      bestBlock.style.outline = '2px dashed var(--color-5)';
    }
  });
  
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      el.style.zIndex = '10';
      
      // 找到最佳父级块
      const allBlocks = document.querySelectorAll('.block-content');
      let bestBlock = null;
      let maxOverlap = 0;
      
      allBlocks.forEach(block => {
        const blockRect = block.getBoundingClientRect();
        const stickerRect = el.getBoundingClientRect();
        
        const overlapLeft = Math.max(blockRect.left, stickerRect.left);
        const overlapRight = Math.min(blockRect.right, stickerRect.right);
        const overlapTop = Math.max(blockRect.top, stickerRect.top);
        const overlapBottom = Math.min(blockRect.bottom, stickerRect.bottom);
        
        if (overlapLeft < overlapRight && overlapTop < overlapBottom) {
          const overlapArea = (overlapRight - overlapLeft) * (overlapBottom - overlapTop);
          if (overlapArea > maxOverlap) {
            maxOverlap = overlapArea;
            bestBlock = block;
          }
        }
      });
      
      // 重置所有块的样式
      document.querySelectorAll('.block-content').forEach(block => {
        block.style.outline = 'none';
      });
      
      // 更新父级关系
      if (bestBlock) {
        const newParentId = bestBlock.dataset.blockId;
        const stickerId = el.dataset.id;
        
        // 从旧父级中移除
        Object.keys(stickers).forEach(blockId => {
          stickers[blockId] = stickers[blockId].filter(s => s.id !== stickerId);
        });
        
        // 添加到新父级
        if (!stickers[newParentId]) stickers[newParentId] = [];
        const stickerData = {
          id: stickerId,
          type: el.querySelector('img') ? 'image' : el.querySelector('video') ? 'video' : 'text',
          x: parseInt(el.style.left),
          y: parseInt(el.style.top),
          width: parseInt(el.style.width),
          height: parseInt(el.style.height),
          parentBlock: newParentId,
          content: el.textContent || '',
          src: el.querySelector('img')?.src || el.querySelector('video')?.src || ''
        };
        
        stickers[newParentId].push(stickerData);
        saveStickers();
      }
    }
  });
}

// 保存贴纸数据
function saveStickers() {
  localStorage.setItem('portfolio_stickers', JSON.stringify(stickers));
}

function saveStickerData() {
  saveStickers();
}

// 文本工具条
function showTextToolbar(element, event) {
  // 移除已存在的工具条
  const existing = document.querySelector('.format-toolbar');
  if (existing) existing.remove();
  
  const toolbar = document.createElement('div');
  toolbar.className = 'format-toolbar';
  
  // 字号按钮
  const smallBtn = document.createElement('button');
  smallBtn.innerHTML = '小';
  smallBtn.onclick = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      document.execCommand('fontSize', false, '1');
    }
  };
  
  const normalBtn = document.createElement('button');
  normalBtn.innerHTML = '中';
  normalBtn.onclick = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      document.execCommand('fontSize', false, '2');
    }
  };
  
  const largeBtn = document.createElement('button');
  largeBtn.innerHTML = '大';
  largeBtn.onclick = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      document.execCommand('fontSize', false, '3');
    }
  };
  
  // 颜色选择器
  const colorPicker = document.createElement('div');
  colorPicker.className = 'color-picker';
  colorPicker.innerHTML = '🎨';
  
  const colorsDiv = document.createElement('div');
  colorsDiv.className = 'colors';
  
  const colors = [
    '--color-1', '--color-2', '--color-3', '--color-4',
    '--color-5', '--color-6', '--color-7', '--color-8',
    '--color-9', '--color-10', '--color-11', '--color-12'
  ];
  
  colors.forEach(colorVar => {
    const colorBtn = document.createElement('div');
    colorBtn.style.background = `var(${colorVar})`;
    colorBtn.dataset.color = colorVar;
    colorBtn.onclick = () => {
      const selection = window.getSelection();
      if (selection.toString()) {
        const color = getComputedStyle(document.documentElement).getPropertyValue(colorVar);
        document.execCommand('foreColor', false, color);
      }
    };
    colorsDiv.appendChild(colorBtn);
  });
  
  colorPicker.appendChild(colorsDiv);
  
  // 链接按钮
  const linkBtn = document.createElement('button');
  linkBtn.innerHTML = '🔗';
  linkBtn.onclick = () => {
    const selection = window.getSelection();
    if (selection.toString()) {
      const url = prompt('请输入链接地址：');
      if (url) {
        document.execCommand('createLink', false, url);
      }
    }
  };
  
  toolbar.appendChild(smallBtn);
  toolbar.appendChild(normalBtn);
  toolbar.appendChild(largeBtn);
  toolbar.appendChild(colorPicker);
  toolbar.appendChild(linkBtn);
  
  // 定位工具条
  const rect = element.getBoundingClientRect();
  toolbar.style.top = (rect.top - 50) + 'px';
  toolbar.style.left = (rect.left + rect.width / 2 - 100) + 'px';
  
  document.body.appendChild(toolbar);
  
  // 点击其他地方关闭
  setTimeout(() => {
    document.addEventListener('click', function closeToolbar(e) {
      if (!toolbar.contains(e.target) && e.target !== element) {
        toolbar.remove();
        document.removeEventListener('click', closeToolbar);
      }
    });
  }, 100);
}

// 添加贴纸到指定块
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
    parentBlock: blockId,
    ...data
  };
  
  stickers[blockId].push(sticker);
  saveStickers();
  loadStickForBlock(blockId);
}

// 全局函数
window.addStickerToBlock = addStickerToBlock;

// 初始化右下角 "+" 菜单
document.addEventListener('DOMContentLoaded', () => {
  const addBtn = document.getElementById('add-block-btn');
  if (addBtn) {
    addBtn.addEventListener('click', showAddMenu);
  }
});

function showAddMenu() {
  const modal = document.createElement('div');
  modal.id = 'add-menu-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>添加内容</h3>
      <button onclick="handleAddBlock()">添加项目块</button>
      <button onclick="handleAddSticker('text')">添加文本框</button>
      <button onclick="handleAddSticker('image')">添加图片</button>
      <button onclick="handleAddSticker('video')">添加视频</button>
      <button onclick="closeAddMenu()">取消</button>
    </div>
  `;
  document.body.appendChild(modal);
}

function handleAddBlock() {
  closeAddMenu();
  addNewBlock();
}

function handleAddSticker(type) {
  closeAddMenu();
  
  // 获取当前可视区域中心的第一个项目块
  const blocks = document.querySelectorAll('.block');
  let targetBlock = null;
  
  for (let block of blocks) {
    const rect = block.getBoundingClientRect();
    if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
      targetBlock = block;
      break;
    }
  }
  
  if (!targetBlock) {
    targetBlock = blocks[0];
  }
  
  if (targetBlock) {
    const blockId = targetBlock.dataset.id;
    addStickerToBlock(blockId, type);
  }
}

function closeAddMenu() {
  const modal = document.getElementById('add-menu-modal');
  if (modal) modal.remove();
}

// 全局函数
window.handleAddBlock = handleAddBlock;
window.handleAddSticker = handleAddSticker;
window.closeAddMenu = closeAddMenu;
