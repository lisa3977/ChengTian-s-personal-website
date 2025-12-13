// blocks.js - 项目块管理系统

let blocks = JSON.parse(localStorage.getItem('portfolio_blocks')) || [
  { id: 'intro', title: '自我介绍', order: 0, height: 300 },
  { id: 'exp', title: '工作经历', order: 1, height: 300 },
  { id: 'skills', title: '技术能力', order: 2, height: 300 },
  { id: 'works', title: '作品集', order: 3, height: 300 },
  { id: 'contact', title: '联系我', order: 4, height: 300 }
];

// 渲染项目块
function renderBlocks() {
  const container = document.getElementById('blocks-container');
  container.innerHTML = '';
  
  blocks.sort((a, b) => a.order - b.order).forEach(block => {
    const blockEl = document.createElement('div');
    blockEl.className = 'block';
    blockEl.id = `block-${block.id}`; // 添加ID用于导航跳转
    blockEl.dataset.id = block.id;
    blockEl.style.minHeight = block.height + 'px';
    
    blockEl.innerHTML = `
      <div class="block-delete-btn" data-id="${block.id}">×</div>
      <div class="block-header" contenteditable="false">${block.title}</div>
      <div class="block-content" data-block-id="${block.id}"></div>
      <div class="block-resize-handle" data-id="${block.id}"></div>
    `;
    container.appendChild(blockEl);
    
    loadStickForBlock(block.id);
    initBlockInteractions(blockEl);
  });
  
  updateNavItems();
  renderSidebar();
  saveBlocks();
}

// 渲染左侧面板
function renderSidebar() {
  const sidebar = document.getElementById('edit-sidebar');
  const list = document.getElementById('block-list');
  if (!sidebar || !list) return;
  
  list.innerHTML = '';
  blocks.sort((a, b) => a.order - b.order).forEach(block => {
    const item = document.createElement('div');
    item.className = 'block-list-item';
    item.dataset.id = block.id;
    item.textContent = block.title;
    item.draggable = true;
    list.appendChild(item);
  });
  
  initSidebarDrag();
}

// 初始化左侧面板拖拽
function initSidebarDrag() {
  const list = document.getElementById('block-list');
  if (!list) return;
  
  let draggedItem = null;
  
  list.addEventListener('dragstart', (e) => {
    if (e.target.classList.contains('block-list-item')) {
      draggedItem = e.target;
      setTimeout(() => e.target.classList.add('dragging'), 0);
    }
  });
  
  list.addEventListener('dragend', (e) => {
    if (draggedItem) {
      draggedItem.classList.remove('dragging');
      document.querySelectorAll('.insert-indicator').forEach(el => el.remove());
      draggedItem = null;
    }
  });
  
  list.addEventListener('dragover', (e) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    const afterElement = getDragAfterElement(list, e.clientY);
    document.querySelectorAll('.insert-indicator').forEach(el => el.remove());
    
    const indicator = document.createElement('div');
    indicator.className = 'insert-indicator';
    
    if (afterElement) {
      list.insertBefore(indicator, afterElement);
    } else {
      list.appendChild(indicator);
    }
  });
  
  list.addEventListener('drop', (e) => {
    e.preventDefault();
    if (!draggedItem) return;
    
    const indicator = document.querySelector('.insert-indicator');
    if (indicator) {
      if (indicator.nextElementSibling) {
        list.insertBefore(draggedItem, indicator.nextElementSibling);
      } else {
        list.appendChild(draggedItem);
      }
      indicator.remove();
      updateBlockOrderFromSidebar();
    }
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.block-list-item:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// 根据左侧面板更新顺序
function updateBlockOrderFromSidebar() {
  const newOrder = Array.from(document.querySelectorAll('#block-list .block-list-item')).map((el, index) => ({
    id: el.dataset.id,
    newIndex: index
  }));
  
  newOrder.forEach(({id, newIndex}) => {
    const block = blocks.find(b => b.id === id);
    if (block) block.order = newIndex;
  });
  
  renderBlocks();
}

// 初始化块交互
function initBlockInteractions(blockEl) {
  const id = blockEl.dataset.id;
  
  // 删除按钮
  const deleteBtn = blockEl.querySelector('.block-delete-btn');
  if (deleteBtn) {
    deleteBtn.onclick = (e) => {
      e.stopPropagation();
      if (confirm('确定要删除这个项目块吗？此操作不可恢复。')) {
        deleteBlock(id);
      }
    };
  }
  
  // 缩放手柄
  const resizeHandle = blockEl.querySelector('.block-resize-handle');
  if (resizeHandle) {
    makeBlockResizable(resizeHandle, blockEl);
  }
}

function deleteBlock(id) {
  blocks = blocks.filter(b => b.id !== id);
  blocks.forEach((b, i) => b.order = i);
  renderBlocks();
}

function makeBlockResizable(handle, blockEl) {
  let isResizing = false;
  let startY;
  let startHeight;
  
  handle.addEventListener('mousedown', (e) => {
    if (!document.body.classList.contains('edit-mode')) return;
    isResizing = true;
    startY = e.clientY;
    startHeight = parseInt(getComputedStyle(blockEl).minHeight);
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });
  
  document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    
    const delta = e.clientY - startY;
    let newHeight = startHeight + delta;
    if (newHeight < 200) newHeight = 200;
    
    blockEl.style.minHeight = newHeight + 'px';
    
    handle.classList.remove('resizing-up', 'resizing-down');
    if (delta > 5) {
      handle.classList.add('resizing-down');
    } else if (delta < -5) {
      handle.classList.add('resizing-up');
    }
    
    const id = blockEl.dataset.id;
    const block = blocks.find(b => b.id === id);
    if (block) block.height = newHeight;
  });
  
  document.addEventListener('mouseup', () => {
    if (isResizing) {
      isResizing = false;
      handle.classList.remove('resizing-up', 'resizing-down');
      document.body.style.userSelect = '';
      saveBlocks();
    }
  });
}

function updateNavItems() {
  const nav = document.getElementById('nav-items');
  if (!nav) return;
  
  nav.innerHTML = '';
  blocks.sort((a, b) => a.order - b.order).forEach(block => {
    const a = document.createElement('a');
    a.href = `#block-${block.id}`;
    a.textContent = block.title;
    nav.appendChild(a);
  });
}

// 添加新块
function addNewBlock() {
  const newId = 'block-' + Date.now();
  blocks.push({ 
    id: newId, 
    title: '项目块', 
    order: blocks.length,
    height: 300
  });
  renderBlocks();
}

function saveBlocks() {
  localStorage.setItem('portfolio_blocks', JSON.stringify(blocks));
}

function toggleSidebar(show) {
  const sidebar = document.getElementById('edit-sidebar');
  if (sidebar) {
    sidebar.classList.toggle('hidden', !show);
  }
}

// 全局函数
window.addNewBlock = addNewBlock;
window.toggleSidebar = toggleSidebar;

document.addEventListener('DOMContentLoaded', () => {
  renderBlocks();
});
