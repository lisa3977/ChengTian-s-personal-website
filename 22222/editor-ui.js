// editor-ui.js - 编辑UI系统

let isEditMode = false;

// 进入编辑模式
function enableEditMode() {
  isEditMode = true;
  document.body.classList.add('edit-mode');
  document.getElementById('edit-fab').classList.remove('hidden');
  
  // 使块标题可编辑
  document.querySelectorAll('.block-header').forEach(header => {
    header.contentEditable = true;
    header.addEventListener('input', saveBlockTitles);
  });
  
  // 初始化贴纸拖拽已在 stickers.js 中处理
}

// 退出编辑模式
function disableEditMode() {
  isEditMode = false;
  document.body.classList.remove('edit-mode');
  document.getElementById('edit-fab').classList.add('hidden');
  
  // 恢复块标题不可编辑
  document.querySelectorAll('.block-header').forEach(header => {
    header.contentEditable = false;
  });
}

// 保存块标题
function saveBlockTitles() {
  document.querySelectorAll('.block').forEach(block => {
    const id = block.dataset.id;
    const title = block.querySelector('.block-header').textContent;
    const blockObj = blocks.find(b => b.id === id);
    if (blockObj) {
      blockObj.title = title;
    }
  });
  saveBlocks(); // blocks.js 中定义
  updateNavItems(); // blocks.js 中定义
}

// 绑定退出按钮
document.addEventListener('DOMContentLoaded', () => {
  const exitBtn = document.getElementById('exit-edit-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', disableEditMode);
  }
});

// 全局函数
window.enableEditMode = enableEditMode;
window.disableEditMode = disableEditMode;
