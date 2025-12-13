// editor-ui.js - 编辑UI系统

let isEditMode = false;

// 进入编辑模式
function enableEditMode() {
  isEditMode = true;
  document.body.classList.add('edit-mode');
  document.getElementById('edit-fab').classList.remove('hidden');
  
  // 显示左侧面板
  toggleSidebar(true);
  
  // 使块标题可编辑
  document.querySelectorAll('.block-header').forEach(header => {
    header.contentEditable = true;
    header.addEventListener('input', saveBlockTitles);
  });
  
  // 首页标题可编辑
  document.querySelectorAll('.editable-hero-text').forEach(el => {
    el.addEventListener('dblclick', function() {
      const key = this.dataset.key;
      const currentColor = this.dataset.color || 'var(--color-8)';
      
      const newValue = prompt('请输入新内容：', this.textContent);
      if (newValue !== null) {
        this.textContent = newValue;
        saveHeroText(key, newValue);
      }
      
      // 颜色选择
      const colorChoice = confirm('是否修改颜色？');
      if (colorChoice) {
        const colors = [
          '--color-1', '--color-2', '--color-3', '--color-4',
          '--color-5', '--color-6', '--color-7', '--color-8',
          '--color-9', '--color-10', '--color-11', '--color-12'
        ];
        
        const choice = prompt(`选择颜色(1-12): ${colors.join(', ')}`, '8');
        if (choice && colors[parseInt(choice)-1]) {
          this.style.color = `var(${colors[parseInt(choice)-1]})`;
          this.dataset.color = colors[parseInt(choice)-1];
          saveHeroTextColor(key, colors[parseInt(choice)-1]);
        }
      }
    });
  });
}

// 退出编辑模式
function disableEditMode() {
  isEditMode = false;
  document.body.classList.remove('edit-mode');
  document.getElementById('edit-fab').classList.add('hidden');
  
  // 隐藏左侧面板
  toggleSidebar(false);
  
  // 恢复块标题不可编辑
  document.querySelectorAll('.block-header').forEach(header => {
    header.contentEditable = false;
  });
  
  // 移除文本工具条
  const toolbar = document.querySelector('.format-toolbar');
  if (toolbar) toolbar.remove();
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

// 保存首页标题内容
function saveHeroText(key, value) {
  const content = JSON.parse(localStorage.getItem('portfolio_hero') || '{}');
  content[key] = value;
  localStorage.setItem('portfolio_hero', JSON.stringify(content));
}

// 保存首页标题颜色
function saveHeroTextColor(key, colorVar) {
  const content = JSON.parse(localStorage.getItem('portfolio_hero') || '{}');
  content[`${key}_color`] = colorVar;
  localStorage.setItem('portfolio_hero', JSON.stringify(content));
}

// 加载首页标题
function loadHeroText() {
  const content = JSON.parse(localStorage.getItem('portfolio_hero') || '{}');
  Object.keys(content).forEach(key => {
    if (key.endsWith('_color')) return;
    
    const el = document.querySelector(`[data-key="${key}"]`);
    if (el) {
      el.textContent = content[key];
      const colorKey = `${key}_color`;
      if (content[colorKey]) {
        el.style.color = `var(${content[colorKey]})`;
        el.dataset.color = content[colorKey];
      }
    }
  });
}

// 绑定退出按钮
document.addEventListener('DOMContentLoaded', () => {
  const exitBtn = document.getElementById('exit-edit-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', disableEditMode);
  }
  
  // 加载首页标题
  loadHeroText();
});

// 全局函数
window.enableEditMode = enableEditMode;
window.disableEditMode = disableEditMode;
