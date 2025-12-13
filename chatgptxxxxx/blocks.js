/* blocks.js - 项目块管理（排序、拖拽、高度调整、删除） */

// 说明：
// 本文件管理页面中 <section class="block"> 的所有可编辑行为：
// 1. 左侧面板拖拽排序
// 2. 项目块高度可调整（向下拖动延长）
// 3. 删除项目块
// 4. 与贴纸系统联动（父级变动时贴纸跟随）

(function () {
  const panel = document.getElementById('editor-panel');
  const content = document.getElementById('content');

  // 对外接口（提供给 editor-ui.js）
  window.PF = window.PF || {};
  window.PF.refreshBlockList = refreshPanelList;
  window.PF.createBlock = createNewBlock;

  // --------------------------------------------------
  // 创建左侧面板列表
  // --------------------------------------------------
  function refreshPanelList() {
    if (!panel) return;

    const blocks = Array.from(document.querySelectorAll('.block'));
    panel.innerHTML = '<h4>项目块排序</h4>';

    const list = document.createElement('div');
    list.className = 'panel-list';

    blocks.forEach((b, index) => {
      const item = document.createElement('div');
      item.className = 'panel-item';
      item.textContent = b.querySelector('h3')?.textContent || `未命名 ${index+1}`;
      item.dataset.index = index;
      list.appendChild(item);
    });

    panel.appendChild(list);
    enableDragSort(list);
  }

  // --------------------------------------------------
  // 拖拽排序
  // --------------------------------------------------
  function enableDragSort(list) {
    let dragEl = null;
    let placeholder = document.createElement('div');
    placeholder.className = 'panel-placeholder';

    list.querySelectorAll('.panel-item').forEach(item => {
      item.draggable = true;

      item.addEventListener('dragstart', e => {
        dragEl = item;
        item.classList.add('dragging');
        placeholder.style.height = item.offsetHeight + 'px';
        e.dataTransfer.effectAllowed = 'move';
      });

      item.addEventListener('dragend', () => {
        dragEl.classList.remove('dragging');
        placeholder.remove();
        dragEl = null;
      });

      item.addEventListener('dragover', e => {
        e.preventDefault();

        const rect = item.getBoundingClientRect();
        const before = e.clientY < rect.top + rect.height / 2;

        if (before) {
          item.parentNode.insertBefore(placeholder, item);
        } else {
          item.parentNode.insertBefore(placeholder, item.nextSibling);
        }
      });

      item.addEventListener('drop', () => {
        if (!dragEl) return;
        placeholder.parentNode.insertBefore(dragEl, placeholder);
        rebuildBlocksFromPanel();
      });
    });
  }

  function rebuildBlocksFromPanel() {
    const order = Array.from(panel.querySelectorAll('.panel-item'));
    const blocks = Array.from(document.querySelectorAll('.block'));

    order.forEach((item, i) => {
      const idx = Number(item.dataset.index);
      const block = blocks[idx];
      if (block) content.appendChild(block); // 重新排序 DOM
    });

    refreshPanelList();
  }

  // --------------------------------------------------
  // 项目块高度调整（仅向下延长）
  // --------------------------------------------------
  function enableResize(block) {
    const handle = document.createElement('div');
    handle.className = 'resize-handle';
    block.appendChild(handle);

    let startY = 0;
    let startH = 0;

    handle.addEventListener('mousedown', e => {
      e.preventDefault();
      startY = e.clientY;
      startH = block.offsetHeight;

      document.onmousemove = e2 => {
        const delta = e2.clientY - startY;
        const newH = Math.max(200, startH + delta);
        block.style.height = newH + 'px';
      };

      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    });
  }

  // --------------------------------------------------
  // 删除项目块
  // --------------------------------------------------
  function enableDelete(block) {
    const btn = document.createElement('div');
    btn.className = 'delete-btn';
    btn.textContent = '×';
    block.appendChild(btn);

    btn.onclick = () => {
      if (!confirm('确认删除这个项目块？')) return;
      block.remove();
      refreshPanelList();
    };
  }

  // --------------------------------------------------
  // 创建新项目块（右下角菜单点“添加新项目块”调用）
  // --------------------------------------------------
  function createNewBlock() {
    const section = document.createElement('section');
    section.className = 'block';
    section.innerHTML = `<h3>新项目块</h3>`;

    content.appendChild(section);
    enableDelete(section);
    enableResize(section);
    window.PF.attachStickerParentWatcher(section); // 交给贴纸系统处理吸附
    refreshPanelList();
    return section;
  }

  // --------------------------------------------------
  // 初始化（为现有 block 添加功能）
  // --------------------------------------------------
  function init() {
    const blocks = document.querySelectorAll('.block');
    blocks.forEach(b => {
      enableResize(b);
      enableDelete(b);
      if (window.PF.attachStickerParentWatcher)
        window.PF.attachStickerParentWatcher(b);
    });
  }

  document.addEventListener('DOMContentLoaded', init);

  // --------------------------------------------------
  // 样式注入
  // --------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    #editor-panel h4 {
      margin: 0 0 10px;
      font-size: 1.1rem;
    }
    .panel-list { display: flex; flex-direction: column; gap: 8px; }
    .panel-item {
      background: rgba(255,255,255,0.8);
      border-radius: 8px;
      padding: 8px 10px;
      cursor: grab;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }
    .panel-item.dragging { opacity: 0.5; }
    .panel-placeholder {
      background: rgba(150,150,150,0.3);
      border-radius: 8px;
      height: 20px;
    }

    /* 调整手柄 */
    .resize-handle {
      width: 100%; height: 14px;
      background: repeating-linear-gradient(90deg, #ccc, #ccc 4px, transparent 4px, transparent 8px);
      cursor: ns-resize;
      border-bottom-left-radius: 16px;
      border-bottom-right-radius: 16px;
      margin-top: 10px;
    }

    /* 删除按钮 */
    .delete-btn {
      position: absolute;
      top: 10px; right: 10px;
      width: 26px; height: 26px;
      border-radius: 50%;
      background: #ff6b6b;
      color: white;
      font-size: 18px;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0,0,0,0.15);
    }
    .delete-btn:hover { filter: brightness(1.1); }
  `;
  document.head.appendChild(style);
})();
