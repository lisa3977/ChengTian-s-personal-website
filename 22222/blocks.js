// blocks.js - 项目块管理系统

let blocks = JSON.parse(localStorage.getItem('portfolio_blocks')) || [
  { id: 'intro', title: '自我介绍', order: 0 },
  { id: 'exp', title: '工作经历', order: 1 },
  { id: 'skills', title: '技术能力', order: 2 },
  { id: 'works', title: '作品集', order: 3 },
  { id: 'contact', title: '联系我', order: 4 }
];

// 渲染所有项目块
function renderBlocks() {
  const container = document.getElementById('blocks-container');
  container.innerHTML = '';
  
  blocks.forEach(block => {
    const blockEl = document.createElement('div');
    blockEl.className = 'block';
    blockEl.dataset.id = block.id;
    blockEl.innerHTML = `
      <div class="block-header" contenteditable="false">${block.title}</div>
      <div class="block-content" data-block-id="${block.id}">
        <!-- 贴纸将插入此处 -->
      </div>
    `;
    container.appendChild(blockEl);
    
    // 加载该块的贴纸
    loadStickForBlock(block.id);
  });
  
  updateNavItems();
  saveBlocks();
}

// 更新导航栏
function updateNavItems() {
  const nav = document.getElementById('nav-items');
  nav.innerHTML = '';
  blocks.forEach(block => {
    const a = document.createElement('a');
    a.href = `#${block.id}`;
    a.textContent = block.title;
    nav.appendChild(a);
  });
}

// 添加新项目块
function addNewBlock() {
  const newId = 'block-' + Date.now();
  blocks.push({ 
    id: newId, 
    title: '项目块', 
    order: blocks.length 
  });
  renderBlocks();
}

// 保存块数据到 localStorage
function saveBlocks() {
  localStorage.setItem('portfolio_blocks', JSON.stringify(blocks));
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  renderBlocks();
  
  // 绑定添加块按钮
  document.getElementById('add-block-btn')?.addEventListener('click', addNewBlock);
});
