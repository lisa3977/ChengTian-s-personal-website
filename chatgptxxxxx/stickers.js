/* stickers.js - 贴纸系统（文本贴纸 / 图片贴纸 / 视频贴纸 / 超链接 / 吸附到项目块） */

// 说明：
// - 所有贴纸可拖拽、可缩放、可编辑（取决于类型）
// - 自动吸附到覆盖面积最大的 block
// - block 移动 / 排序 时，贴纸跟随父级移动
// - 文本贴纸支持工具条添加超链接
//
// 本模块向 window.PF 暴露两个接口：
//   PF.createSticker(type)        → 创建贴纸
//   PF.attachStickerParentWatcher(blockEl) → block 变动时更新贴纸父级

(function () {
  const content = document.getElementById('content');
  const stickers = []; // 所有贴纸实例

  window.PF = window.PF || {};
  window.PF.createSticker = createSticker;
  window.PF.attachStickerParentWatcher = watchBlockForStickers;

  // ------------------------------------------------------------
  // 创建贴纸
  // ------------------------------------------------------------
  function createSticker(type) {
    const st = document.createElement('div');
    st.className = 'sticker';
    st.style.left = '200px';
    st.style.top = '200px';

    if (type === 'text') {
      st.innerHTML = `<textarea placeholder="双击编辑文本"></textarea>`;
    }
    else if (type === 'image') {
      st.innerHTML = `<input type="file" accept="image/*" class="st-input">`;
    }
    else if (type === 'video') {
      st.innerHTML = `<input type="file" accept="video/*" class="st-input">`;
    }

    content.appendChild(st);
    stickers.push(st);

    enableDrag(st);
    enableResize(st);
    enableInputLoad(st, type);
    enableLinkFeature(st);

    return st;
  }

  // ------------------------------------------------------------
  // 拖拽移动
  // ------------------------------------------------------------
  function enableDrag(st) {
    let startX = 0, startY = 0;
    let origX = 0, origY = 0;

    st.addEventListener('mousedown', e => {
      if (e.target.tagName === 'TEXTAREA' || e.target.classList.contains('st-input')) return;

      startX = e.clientX;
      startY = e.clientY;
      const rect = st.getBoundingClientRect();
      origX = rect.left + window.scrollX;
      origY = rect.top + window.scrollY;

      document.onmousemove = e2 => {
        const dx = e2.clientX - startX;
        const dy = e2.clientY - startY;
        st.style.left = origX + dx + 'px';
        st.style.top = origY + dy + 'px';
      };

      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
        updateStickerParent(st);
      };
    });
  }

  // ------------------------------------------------------------
  // 缩放
  // ------------------------------------------------------------
  function enableResize(st) {
    st.style.resize = 'both';
    st.style.overflow = 'hidden';
  }

  // ------------------------------------------------------------
  // 图片/视频上传
  // ------------------------------------------------------------
  function enableInputLoad(st, type) {
    const input = st.querySelector('.st-input');
    if (!input) return;

    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;

      const url = URL.createObjectURL(file);

      if (type === 'image') {
        st.innerHTML = `<img src="${url}">`;
      } else if (type === 'video') {
        st.innerHTML = `<video src="${url}" controls></video>`;
      }
    });
  }

  // ------------------------------------------------------------
  // 贴纸吸附到覆盖面积最大的 block
  // ------------------------------------------------------------
  function updateStickerParent(st) {
    const blocks = document.querySelectorAll('.block');
    let bestBlock = null;
    let bestArea = 0;

    const sRect = st.getBoundingClientRect();

    blocks.forEach(block => {
      const bRect = block.getBoundingClientRect();

      const xOverlap = Math.max(0, Math.min(sRect.right, bRect.right) - Math.max(sRect.left, bRect.left));
      const yOverlap = Math.max(0, Math.min(sRect.bottom, bRect.bottom) - Math.max(sRect.top, bRect.top));
      const area = xOverlap * yOverlap;

      if (area > bestArea) {
        bestArea = area;
        bestBlock = block;
      }
    });

    if (bestBlock) bestBlock.appendChild(st);
  }

  function watchBlockForStickers(block) {
    // block 排序重新生成后，需要重新更新父级关系
    const observer = new MutationObserver(() => {
      stickers.forEach(st => updateStickerParent(st));
    });

    observer.observe(content, { childList: true });
  }

  // ------------------------------------------------------------
  // 文本贴纸的超链接功能
  // ------------------------------------------------------------
  function enableLinkFeature(st) {
    if (!st.querySelector('textarea')) return;
    st.addEventListener('mouseup', () => {
      const sel = window.getSelection();
      if (!sel || sel.toString().trim().length === 0) return;

      showLinkToolbar(st, sel);
    });
  }

  function showLinkToolbar(st, sel) {
    const toolbar = document.createElement('div');
    toolbar.className = 'link-toolbar';
    toolbar.innerHTML = `
      <input type="text" placeholder="输入链接，如 https://...">
      <button>确定</button>
    `;

    document.body.appendChild(toolbar);
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    toolbar.style.left = rect.left + 'px';
    toolbar.style.top = rect.top - 40 + 'px';

    toolbar.querySelector('button').onclick = () => {
      const url = toolbar.querySelector('input').value.trim();
      if (url) applyLink(st, sel, url);
      toolbar.remove();
    };

    document.addEventListener('click', e => {
      if (!toolbar.contains(e.target)) toolbar.remove();
    }, { once: true });
  }

  function applyLink(st, sel, url) {
    const ta = st.querySelector('textarea');
    const text = ta.value;
    const selected = sel.toString();
    ta.value = text.replace(selected, `[${selected}](${url})`);
  }

  // ------------------------------------------------------------
  // 样式注入
  // ------------------------------------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .link-toolbar {
      position: fixed;
      background: rgba(255,255,255,0.9);
      backdrop-filter: blur(8px);
      padding: 6px 10px;
      border-radius: 8px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.1);
      display: flex;
      gap: 6px;
      z-index: 99999;
    }
    .link-toolbar input {
      width: 180px;
      padding: 4px 6px;
      border-radius: 6px;
      border: 1px solid #ccc;
    }
  `;
  document.head.appendChild(style);
})();
