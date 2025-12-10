// admin/editor.js - 编辑系统核心

let isEditMode = false;

// 进入编辑模式
function enableEditMode() {
    isEditMode = true;
    document.body.classList.add('edit-mode');
    showFloatingButtons();
    makeEditableElements();
}

// 退出编辑模式
function disableEditMode() {
    isEditMode = false;
    document.body.classList.remove('edit-mode');
    hideFloatingButtons();
    // 移除所有临时编辑状态
    document.querySelectorAll('.editing').forEach(el => {
        el.classList.remove('editing');
        if (el.tagName === 'TEXTAREA') {
            const original = document.createElement('p');
            original.textContent = el.value;
            original.className = 'editable-text';
            original.dataset.key = el.dataset.key;
            el.replaceWith(original);
            attachEditEvent(original);
        }
    });
}

// 显示右下角悬浮按钮
function showFloatingButtons() {
    let fab = document.getElementById('edit-fab');
    if (!fab) {
        fab = document.createElement('div');
        fab.id = 'edit-fab';
        fab.innerHTML = `
            <button id="add-btn" title="添加内容">+</button>
            <button id="settings-btn" title="设置">⚙️</button>
        `;
        document.body.appendChild(fab);

        document.getElementById('add-btn').addEventListener('click', showAddMenu);
        document.getElementById('settings-btn').addEventListener('click', showSettingsModal);
    }
    fab.style.display = 'block';
}

function hideFloatingButtons() {
    const fab = document.getElementById('edit-fab');
    if (fab) fab.style.display = 'none';
}

// 使元素可编辑
function makeEditableElements() {
    // 文字编辑
    document.querySelectorAll('.editable-text').forEach(el => {
        attachEditEvent(el);
    });

    // 区域添加“+”提示
    document.querySelectorAll('.editable-area').forEach(el => {
        if (!el.querySelector('.add-hint')) {
            const hint = document.createElement('div');
            hint.className = 'add-hint';
            hint.textContent = '+ 点击添加内容';
            el.appendChild(hint);
        }
    });
}

function attachEditEvent(element) {
    element.addEventListener('click', function(e) {
        if (!isEditMode) return;
        e.stopPropagation();
        
        const key = this.dataset.key || 'text-' + Date.now();
        const textarea = document.createElement('textarea');
        textarea.value = this.textContent;
        textarea.className = 'editing';
        textarea.dataset.key = key;
        textarea.style.cssText = `
            width: 100%; min-height: 60px; padding: 8px;
            border: 1px solid #ccc; border-radius: 4px;
            font-family: inherit; font-size: 1rem;
        `;
        
        this.replaceWith(textarea);
        textarea.focus();
        
        textarea.addEventListener('blur', function() {
            const newText = this.value;
            const p = document.createElement('p');
            p.textContent = newText;
            p.className = 'editable-text';
            p.dataset.key = key;
            this.replaceWith(p);
            attachEditEvent(p);
            saveContent(key, newText);
        });
    });
}

// 保存内容到 localStorage
function saveContent(key, value) {
    const content = JSON.parse(localStorage.getItem('portfolio_content') || '{}');
    content[key] = value;
    localStorage.setItem('portfolio_content', JSON.stringify(content));
}

// 加载已保存内容
function loadSavedContent() {
    const content = JSON.parse(localStorage.getItem('portfolio_content') || '{}');
    Object.keys(content).forEach(key => {
        const el = document.querySelector(`[data-key="${key}"]`);
        if (el) {
            if (el.tagName === 'P' || el.tagName === 'H2') {
                el.textContent = content[key];
            }
        }
    });
}

// 显示添加菜单
function showAddMenu() {
    const modal = createModal(`
        <h3>添加内容</h3>
        <button onclick="handleAddMedia('image')">图片</button>
        <button onclick="handleAddMedia('video')">视频</button>
        <button onclick="handleAddLink()">超链接</button>
        <button onclick="closeModal()">取消</button>
    `);
    document.body.appendChild(modal);
}

// 处理媒体上传
function handleAddMedia(type) {
    closeModal();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'image' ? 'image/*' : 'video/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            const container = document.querySelector('.editable-area');
            if (container) {
                const item = document.createElement('div');
                item.className = 'media-item';
                if (type === 'image') {
                    item.innerHTML = `<img src="${dataUrl}" style="max-width:100%;border-radius:8px;">`;
                } else {
                    item.innerHTML = `<video controls src="${dataUrl}" style="max-width:100%;border-radius:8px;"></video>`;
                }
                container.insertBefore(item, container.querySelector('.add-hint'));
                // 保存到 localStorage（简化处理）
                const mediaKey = `media-${Date.now()}`;
                saveContent(mediaKey, dataUrl);
            }
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

// 处理链接插入
function handleAddLink() {
    closeModal();
    const url = prompt('请输入链接地址：');
    if (!url) return;
    const displayType = confirm('以图片形式显示？\n（确定=图片，取消=文字）');
    
    if (displayType) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const imgSrc = event.target.result;
                insertLinkElement(url, imgSrc, true);
            };
            reader.readAsDataURL(file);
        };
        input.click();
    } else {
        const text = prompt('链接显示文字：', '点击进入');
        insertLinkElement(url, text, false);
    }
}

function insertLinkElement(href, content, isImage) {
    const container = document.querySelector('.editable-area');
    if (container) {
        const linkEl = document.createElement('a');
        linkEl.href = href;
        linkEl.target = '_blank';
        if (isImage) {
            linkEl.innerHTML = `<img src="${content}" style="max-width:100%;border-radius:8px;">`;
        } else {
            linkEl.textContent = content;
            linkEl.style.cssText = 'color: var(--accent-blue); text-decoration: underline;';
        }
        container.insertBefore(linkEl, container.querySelector('.add-hint'));
    }
}

// 设置弹窗
function showSettingsModal() {
    const modal = createModal(`
        <h3>编辑设置</h3>
        <p>当前密码：<input type="password" id="old-pass" placeholder="输入旧密码"></p>
        <p>新密码：<input type="password" id="new-pass" placeholder="输入新密码"></p>
        <button onclick="applyPasswordChange()">修改密码</button>
        <button onclick="forgotPassword()">忘记密码？</button>
        <button onclick="closeModal()">关闭</button>
    `);
    document.body.appendChild(modal);
}

function applyPasswordChange() {
    const oldPass = document.getElementById('old-pass').value;
    const newPass = document.getElementById('new-pass').value;
    if (changePassword(oldPass, newPass)) {
        closeModal();
    }
}

// 工具函数
function createModal(html) {
    const overlay = document.createElement('div');
    overlay.id = 'editor-modal-overlay';
    overlay.style.cssText = `
        position: fixed; top:0; left:0; width:100%; height:100%;
        background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center;
        z-index: 10000;
    `;
    const content = document.createElement('div');
    content.style.cssText = `
        background: white; padding: 20px; border-radius: 12px; max-width: 400px; width: 90%;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
    `;
    content.innerHTML = html;
    overlay.appendChild(content);
    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
    };
    return overlay;
}

function closeModal() {
    const overlay = document.getElementById('editor-modal-overlay');
    if (overlay) overlay.remove();
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    loadSavedContent();
    
    // 双击进入编辑模式（需验证）
    document.body.addEventListener('dblclick', () => {
        if (isEditMode) return;
        const pass = prompt('请输入管理员密码：');
        if (pass && verifyPassword(pass)) {
            enableEditMode();
        } else if (pass !== null) {
            alert('密码错误！');
        }
    });
});
