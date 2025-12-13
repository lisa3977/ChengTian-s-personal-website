/* editor-ui.js - 编辑模式 UI 控制（入口：三击进入，由 auth.js 触发 startEditMode） */

(function () {
  window.PF = window.PF || {};

  let editMode = false;

  // 对外接口
  window.PF.startEditMode = startEditMode;
  window.PF.stopEditMode = stopEditMode;

  const panel = document.getElementById('editor-panel');
  const menuBtn = document.getElementById('editor-menu-btn');
  const menu = document.getElementById('editor-menu');

  function startEditMode() {
    if (editMode) return;
    editMode = true;
    panel.style.display = 'block';
    menuBtn.style.display = 'flex';
    document.body.classList.add('pf-edit-mode');

    // 初始化面板内容
    if (window.PF.refreshBlockList) window.PF.refreshBlockList();

    // 绑定退出按钮
    createExitButton();

    // 绑定编辑交互（双击标题编辑）
    bindTitleEditing();
  }

  function stopEditMode() {
    editMode = false;
    panel.style.display = 'none';
    menuBtn.style.display = 'none';
    menu.style.display = 'none';
    document.body.classList.remove('pf-edit-mode');
    removeExitButton();
  }

  // 菜单开关
  menuBtn.addEventListener('click', () => {
    if (menu.style.display === 'flex') menu.style.display = 'none';
    else menu.style.display = 'flex';
  });

  // 菜单内容
  function initMenu() {
    menu.style.display = 'none';
    menu.style.flexDirection = 'column';

    const btnText = document.createElement('button');
    btnText.textContent = '添加文本贴纸';
    btnText.onclick = () => { window.PF.createSticker && window.PF.createSticker('text'); };

    const btnImage = document.createElement('button');
    btnImage.textContent = '添加图片贴纸';
    btnImage.onclick = () => { window.PF.createSticker && window.PF.createSticker('image'); };

    const btnVideo = document.createElement('button');
    btnVideo.textContent = '添加视频贴纸';
    btnVideo.onclick = () => { window.PF.createSticker && window.PF.createSticker('video'); };

    const btnBlock = document.createElement('button');
    btnBlock.textContent = '添加新项目块';
    btnBlock.onclick = () => { window.PF.createBlock && window.PF.createBlock(); window.PF.refreshBlockList && window.PF.refreshBlockList(); };

    const btnSave = document.createElement('button');
    btnSave.textContent = '保存元数据';
    btnSave.onclick = () => saveMetaFromUI();

    menu.appendChild(btnText);
    menu.appendChild(btnImage);
    menu.appendChild(btnVideo);
    menu.appendChild(btnBlock);
    menu.appendChild(btnSave);

    document.body.appendChild(menu);
  }

  function createExitButton() {
    if (document.getElementById('editor-exit')) return;
    const btn = document.createElement('div');
    btn.id = 'editor-exit';
    btn.textContent = '✕';
    btn.style.position = 'fixed';
    btn.style.right = '20px';
    btn.style.bottom = '90px';
    btn.style.width = '44px';
    btn.style.height = '44px';
    btn.style.borderRadius = '50%';
    btn.style.display = 'flex';
    btn.style.justifyContent = 'center';
    btn.style.alignItems = 'center';
    btn.style.background = 'rgba(0,0,0,0.6)';
    btn.style.color = 'white';
    btn.style.zIndex = 9999;
    btn.style.cursor = 'pointer';
    btn.onclick = () => {
      // 保存并退出
      stopEditMode();
    };
    document.body.appendChild(btn);
  }

  function removeExitButton() {
    const b = document.getElementById('editor-exit');
    if (b) b.remove();
  }

  // 双击标题编辑
  function bindTitleEditing() {
    const nameEl = document.getElementById('designer-name');
    const subEl = document.getElementById('subtitle');

    makeEditable(nameEl, 'name');
    makeEditable(subEl, 'subtitle');
  }

  function makeEditable(el, key) {
    if (!el) return;
    el.ondblclick = () => {
      const current = el.textContent;
      const input = document.createElement('input');
      input.value = current;
      input.style.fontSize = getComputedStyle(el).fontSize;
      input.style.fontWeight = getComputedStyle(el).fontWeight;
      el.replaceWith(input);
      input.focus();

      function commit() {
        const span = document.createElement('span');
        span.id = el.id;
        span.textContent = input.value || current;
        input.replaceWith(span);
        // 保存
        saveMetaField(key, span.textContent);
        // 重新绑定
        makeEditable(span, key);
      }

      input.addEventListener('blur', commit);
      input.addEventListener('keydown', (e) => { if (e.key === 'Enter') commit(); });
    };
  }

  function saveMetaField(key, value) {
    const raw = localStorage.getItem('portfolio_meta_v1');
    const data = raw ? JSON.parse(raw) : {};
    if (key === 'name') data.name = value;
    if (key === 'subtitle') data.subtitle = value;
    localStorage.setItem('portfolio_meta_v1', JSON.stringify(data));
    if (window.PF.saveMeta) window.PF.saveMeta(data);
  }

  function saveMetaFromUI() {
    const name = document.getElementById('designer-name')?.textContent || '';
    const subtitle = document.getElementById('subtitle')?.textContent || '';
    const meta = { name, subtitle };
    localStorage.setItem('portfolio_meta_v1', JSON.stringify(meta));
    if (window.PF.saveMeta) window.PF.saveMeta(meta);
    alert('已保存');
  }

  // 初始化
  document.addEventListener('DOMContentLoaded', () => {
    initMenu();
  });

  // 注入简单样式
  const style = document.createElement('style');
  style.textContent = `
    #editor-panel { transition: opacity 0.25s; }
    #editor-menu button { padding: 8px 12px; border-radius: 8px; border: none; cursor: pointer; margin-bottom: 6px; }
    #editor-exit { transition: transform 0.15s; }
    #editor-exit:hover { transform: scale(1.06); }
  `;
  document.head.appendChild(style);
})();