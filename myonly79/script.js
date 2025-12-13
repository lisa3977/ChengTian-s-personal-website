/**
 * 个人博客可视化编辑展示平台 - 主脚本文件
 * 实现编辑模式与预览模式的管理、项目块和粘贴框的核心功能
 * 整合qwenooooo的首页设置：导航栏滚动隐藏、漂浮图形动画、导航栏动态生成、hero区域可编辑文本
 */

// 全局状态管理
const AppState = {
    isEditMode: false, // 初始为预览模式
    currentBlockId: 'home',
    stickers: [],
    blocks: [],
    selectedElement: null,
    selectedTextRange: null,
    password: '123456', // 默认密码，实际应用中应从服务器获取
    lastScrollY: 0 // 用于导航栏滚动隐藏
};

// DOM元素引用
const DOM = {
    // 模式切换按钮
    enterEditModeBtn: document.getElementById('enter-edit-mode-btn'),
    exitEditModeBtn: document.getElementById('exit-edit-mode-btn'),
    
    // 认证相关
    authModal: document.getElementById('auth-modal'),
    passwordInput: document.getElementById('password-input'),
    authSubmit: document.getElementById('auth-submit'),
    
    // 项目块相关
    blocksContainer: document.getElementById('blocks-container'),
    blockSortList: document.getElementById('block-sort-list'),
    sortingPanel: document.getElementById('sorting-panel'),
    
    // 粘贴框相关
    addStickerBtn: document.getElementById('add-sticker-btn'),
    stickerTypeMenu: document.getElementById('sticker-type-menu'),
    stickersContainer: document.getElementById('stickers-container'),
    
    // 导航栏相关（新增）
    navbar: document.getElementById('navbar'),
    navItems: document.getElementById('nav-items'),
    
    // 首页Hero相关（新增）
    floatingContainer: document.getElementById('floating-container'),
    
    // 菜单栏（原菜单栏，现在用于导航栏）
    menuList: document.getElementById('menu-list'),
    
    // 其他UI组件
    colorPanel: document.getElementById('color-panel'),
    textToolbar: document.getElementById('text-toolbar'),
    linkDialog: document.getElementById('link-dialog'),
    deleteConfirmDialog: document.getElementById('delete-confirm-dialog'),
    addStickerContainer: document.getElementById('add-sticker-container')
};

// 初始化函数
function init() {
    console.log('初始化个人博客可视化编辑展示平台...');
    
    // 加载保存的数据
    loadSavedData();
    
    // 初始化事件监听器
    initEventListeners();
    
    // 初始状态设置为预览模式
    setPreviewMode();
    
    // 初始化项目块
    initBlocks();
    
    // 初始化导航栏（新增）
    initNavbar();
    
    // 初始化漂浮图形（新增）
    createFloatingShapes();
    
    // 初始化hero区域可编辑文本（新增）
    initHeroText();
    
    console.log('初始化完成，当前模式:', AppState.isEditMode ? '编辑模式' : '预览模式');
}

// 加载保存的数据
function loadSavedData() {
    try {
        const savedBlocks = localStorage.getItem('blog_blocks');
        const savedStickers = localStorage.getItem('blog_stickers');
        const savedHeroText = localStorage.getItem('blog_hero_text');
        
        if (savedBlocks) {
            AppState.blocks = JSON.parse(savedBlocks);
        }
        
        if (savedStickers) {
            AppState.stickers = JSON.parse(savedStickers);
        }
        
        if (savedHeroText) {
            // 加载hero文本
            const heroData = JSON.parse(savedHeroText);
            Object.keys(heroData).forEach(key => {
                if (key.endsWith('_color')) return;
                
                const el = document.querySelector(`[data-key="${key}"]`);
                if (el) {
                    el.textContent = heroData[key];
                    const colorKey = `${key}_color`;
                    if (heroData[colorKey]) {
                        el.style.color = `var(${heroData[colorKey]})`;
                        el.dataset.color = heroData[colorKey];
                    }
                }
            });
        }
    } catch (error) {
        console.error('加载保存数据时出错:', error);
        // 使用默认数据
        AppState.blocks = [
            {
                id: 'home',
                title: '首页',
                color: '#f8f9fa',
                order: 0,
                height: 400
            }
        ];
        AppState.stickers = [];
    }
}

// 保存数据到localStorage
function saveData() {
    try {
        localStorage.setItem('blog_blocks', JSON.stringify(AppState.blocks));
        localStorage.setItem('blog_stickers', JSON.stringify(AppState.stickers));
        console.log('数据已保存');
    } catch (error) {
        console.error('保存数据时出错:', error);
    }
}

// 保存hero文本数据
function saveHeroText() {
    try {
        const heroData = {};
        document.querySelectorAll('.editable-hero-text').forEach(el => {
            const key = el.dataset.key;
            heroData[key] = el.textContent;
            if (el.dataset.color) {
                heroData[`${key}_color`] = el.dataset.color;
            }
        });
        localStorage.setItem('blog_hero_text', JSON.stringify(heroData));
    } catch (error) {
        console.error('保存hero文本时出错:', error);
    }
}

// 初始化事件监听器
function initEventListeners() {
    // 模式切换按钮
    DOM.enterEditModeBtn.addEventListener('click', showAuthModal);
    DOM.exitEditModeBtn.addEventListener('click', exitEditMode);
    
    // 认证相关
    DOM.authSubmit.addEventListener('click', authenticate);
    DOM.passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            authenticate();
        }
    });
    
    // 添加粘贴框按钮
    DOM.addStickerBtn.addEventListener('click', toggleStickerTypeMenu);
    
    // 粘贴框类型选择
    document.querySelectorAll('.sticker-type-option').forEach(option => {
        option.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.type;
            createSticker(type);
            hideStickerTypeMenu();
        });
    });
    
    // 点击其他地方隐藏粘贴框类型菜单
    document.addEventListener('click', (e) => {
        if (!DOM.addStickerContainer.contains(e.target)) {
            hideStickerTypeMenu();
        }
    });
    
    // 窗口大小变化时重新计算布局
    window.addEventListener('resize', debounce(updateLayout, 250));
    
    // 页面卸载前保存数据
    window.addEventListener('beforeunload', () => {
        saveData();
        saveHeroText();
    });
    
    // 导航栏滚动隐藏效果（新增）
    window.addEventListener('scroll', handleNavbarScroll);
    
    // hero区域文本双击编辑（新增）
    document.querySelectorAll('.editable-hero-text').forEach(el => {
        el.addEventListener('dblclick', handleHeroTextDoubleClick);
    });
}

// 导航栏滚动隐藏效果（S型隐藏）
function handleNavbarScroll() {
    if (!DOM.navbar) return;
    
    if (window.scrollY > 100 && window.scrollY > AppState.lastScrollY) {
        // 向下滑动 -> 隐藏
        DOM.navbar.style.transform = 'translateY(-100%)';
    } else {
        // 向上滑动或顶部 -> 显示
        DOM.navbar.style.transform = 'translateY(0)';
    }
    AppState.lastScrollY = window.scrollY;
}

// 初始化导航栏
function initNavbar() {
    updateNavItems();
}

// 更新导航栏项目
function updateNavItems() {
    if (!DOM.navItems) return;
    
    DOM.navItems.innerHTML = '';
    
    // 按照order排序
    const sortedBlocks = [...AppState.blocks].sort((a, b) => a.order - b.order);
    
    // 添加导航项
    sortedBlocks.forEach(block => {
        const a = document.createElement('a');
        a.href = `#${block.id}`;
        a.textContent = block.title;
        a.addEventListener('click', (e) => {
            e.preventDefault();
            scrollToBlock(block.id);
        });
        DOM.navItems.appendChild(a);
    });
}

// 首页漂浮图形
function createFloatingShapes() {
    if (!DOM.floatingContainer) return;
    
    const colors = [
        '#ff9aa2','#ffb7b2','#ffdac1','#e2f0cb',
        '#b5eadd','#c7ceea','#d6a2e8','#f8a5c2',
        '#63cdda','#a29bfe','#fdcb6e','#55efc4'
    ];
    
    for (let i = 0; i < 60; i++) {
        const shape = document.createElement('div');
        shape.className = 'floating-shape';
        
        // 随机大小
        const size = 30 + Math.random() * 90;
        shape.style.width = `${size}px`;
        shape.style.height = `${size}px`;
        
        // 随机颜色
        shape.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        // 随机形状
        const shapeType = Math.random();
        if (shapeType > 0.7) {
            shape.style.borderRadius = '50%'; // 圆形
        } else if (shapeType > 0.4) {
            shape.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)'; // 三角形
        }
        // 其他为方形（默认）
        
        // 随机位置
        shape.style.left = `${Math.random() * 100}%`;
        shape.style.top = `${Math.random() * 100}%`;
        shape.style.opacity = 0.5 + Math.random() * 0.4;
        
        // 随机动画
        const duration = 20 + Math.random() * 30;
        const x = (Math.random() - 0.5) * 300;
        const y = (Math.random() - 0.5) * 300;
        
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes float${i} {
                0%, 100% { transform: translate(0, 0); }
                25% { transform: translate(${x}px, ${y}px); }
                50% { transform: translate(${x*1.2}px, ${y*1.2}px); }
                75% { transform: translate(${x*0.8}px, ${y*0.8}px); }
            }
        `;
        document.head.appendChild(style);
        
        shape.style.animation = `float${i} ${duration}s infinite linear`;
        DOM.floatingContainer.appendChild(shape);
    }
}

// 初始化hero区域文本
function initHeroText() {
    // 加载已保存的hero文本
    const savedHeroText = localStorage.getItem('blog_hero_text');
    if (savedHeroText) {
        const heroData = JSON.parse(savedHeroText);
        Object.keys(heroData).forEach(key => {
            if (key.endsWith('_color')) return;
            
            const el = document.querySelector(`[data-key="${key}"]`);
            if (el) {
                el.textContent = heroData[key];
                const colorKey = `${key}_color`;
                if (heroData[colorKey]) {
                    el.style.color = `var(${heroData[colorKey]})`;
                    el.dataset.color = heroData[colorKey];
                }
            }
        });
    }
}

// hero区域文本双击编辑处理
function handleHeroTextDoubleClick(e) {
    if (!AppState.isEditMode) {
        showNotification('请在编辑模式下编辑文本', 'error');
        return;
    }
    
    const el = e.currentTarget;
    const key = el.dataset.key;
    const currentColor = el.dataset.color || 'var(--color-8)';
    
    const newValue = prompt('请输入新内容：', el.textContent);
    if (newValue !== null) {
        el.textContent = newValue;
        saveHeroText();
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
            el.style.color = `var(${colors[parseInt(choice)-1]})`;
            el.dataset.color = colors[parseInt(choice)-1];
            saveHeroText();
        }
    }
}

// 设置预览模式
function setPreviewMode() {
    AppState.isEditMode = false;
    
    // 更新UI
    DOM.enterEditModeBtn.classList.remove('hidden');
    DOM.exitEditModeBtn.classList.add('hidden');
    DOM.sortingPanel.classList.add('hidden');
    DOM.addStickerBtn.classList.add('hidden');
    
    // 隐藏所有编辑控件
    document.querySelectorAll('.block-controls').forEach(control => {
        control.classList.add('hidden');
    });
    
    document.querySelectorAll('.block-resize-handle').forEach(handle => {
        handle.classList.add('hidden');
    });
    
    // 隐藏粘贴框的删除按钮
    document.querySelectorAll('.sticker-delete-btn').forEach(btn => {
        btn.classList.add('hidden');
    });
    
    // 隐藏文本编辑工具栏
    DOM.textToolbar.classList.add('hidden');
    
    // 更新body类
    document.body.classList.remove('edit-mode');
    document.body.classList.add('preview-mode');
    
    console.log('已切换到预览模式');
}

// 设置编辑模式
function setEditMode() {
    AppState.isEditMode = true;
    
    // 更新UI
    DOM.enterEditModeBtn.classList.add('hidden');
    DOM.exitEditModeBtn.classList.remove('hidden');
    DOM.sortingPanel.classList.remove('hidden');
    DOM.addStickerBtn.classList.remove('hidden');
    
    // 显示所有编辑控件
    document.querySelectorAll('.block-controls').forEach(control => {
        control.classList.remove('hidden');
    });
    
    document.querySelectorAll('.block-resize-handle').forEach(handle => {
        handle.classList.remove('hidden');
    });
    
    // 显示粘贴框的删除按钮
    document.querySelectorAll('.sticker-delete-btn').forEach(btn => {
        btn.classList.remove('hidden');
    });
    
    // 更新body类
    document.body.classList.remove('preview-mode');
    document.body.classList.add('edit-mode');
    
    console.log('已切换到编辑模式');
}

// 显示认证模态框
function showAuthModal() {
    DOM.authModal.classList.remove('hidden');
    DOM.passwordInput.focus();
    DOM.passwordInput.value = '';
}

// 隐藏认证模态框
function hideAuthModal() {
    DOM.authModal.classList.add('hidden');
}

// 认证函数
function authenticate() {
    const password = DOM.passwordInput.value.trim();
    
    if (password === AppState.password) {
        // 认证成功
        hideAuthModal();
        setEditMode();
        showNotification('认证成功，已进入编辑模式');
    } else {
        // 认证失败
        showNotification('密码错误，请重试', 'error');
        DOM.passwordInput.value = '';
        DOM.passwordInput.focus();
    }
}

// 退出编辑模式
function exitEditMode() {
    if (confirm('确定要退出编辑模式吗？所有未保存的更改将自动保存。')) {
        saveData();
        saveHeroText();
        setPreviewMode();
        showNotification('已退出编辑模式，切换到预览模式');
    }
}

// 初始化项目块
function initBlocks() {
    // 清空现有项目块（除了首页）
    const existingBlocks = DOM.blocksContainer.querySelectorAll('.content-block:not(#block-home)');
    existingBlocks.forEach(block => block.remove());
    
    // 添加保存的项目块
    AppState.blocks.forEach(block => {
        if (block.id !== 'home') {
            createBlockElement(block);
        }
    });
    
    // 更新排序面板
    updateSortingPanel();
}

// 创建项目块元素
function createBlockElement(blockData) {
    const blockTemplate = `
        <div class="content-block" id="block-${blockData.id}" data-block-id="${blockData.id}">
            <div class="block-header">
                <h2 class="block-title editable" contenteditable="${AppState.isEditMode}">${blockData.title}</h2>
                <div class="block-controls ${AppState.isEditMode ? '' : 'hidden'}">
                    <button class="color-btn" title="修改背景色"><i class="fas fa-palette"></i></button>
                    <button class="delete-btn" title="删除项目块"><i class="fas fa-times"></i></button>
                </div>
            </div>
            <div class="block-content" style="background-color: ${blockData.color}; height: ${blockData.height}px;">
                <div class="block-resize-handle ${AppState.isEditMode ? '' : 'hidden'}" title="下拉延长高度"></div>
                <div class="stickers-placeholder">
                    <p>拖拽粘贴框到这里添加内容</p>
                </div>
            </div>
        </div>
    `;
    
    DOM.blocksContainer.insertAdjacentHTML('beforeend', blockTemplate);
    
    // 添加事件监听器
    const newBlock = document.getElementById(`block-${blockData.id}`);
    
    // 标题编辑
    const titleElement = newBlock.querySelector('.block-title');
    titleElement.addEventListener('blur', () => {
        blockData.title = titleElement.textContent;
        updateNavItems();
        saveData();
    });
    
    // 颜色按钮
    const colorBtn = newBlock.querySelector('.color-btn');
    colorBtn.addEventListener('click', () => {
        showColorPanel(blockData);
    });
    
    // 删除按钮
    const deleteBtn = newBlock.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', () => {
        showDeleteConfirm(blockData);
    });
    
    // 调整高度手柄
    const resizeHandle = newBlock.querySelector('.block-resize-handle');
    if (resizeHandle) {
        initResizeHandle(resizeHandle, blockData);
    }
    
    return newBlock;
}

// 显示颜色面板
function showColorPanel(blockData) {
    // 实现颜色选择逻辑
    console.log('显示颜色面板给项目块:', blockData.id);
    // 这里需要实现颜色选择的具体逻辑
}

// 显示删除确认
function showDeleteConfirm(blockData) {
    if (blockData.id === 'home') {
        showNotification('首页不能删除', 'error');
        return;
    }
    
    DOM.deleteConfirmDialog.classList.remove('hidden');
    // 这里需要实现删除确认的具体逻辑
}

// 初始化调整高度手柄
function initResizeHandle(handle, blockData) {
    let isResizing = false;
    let startY, startHeight;
    
    handle.addEventListener('mousedown', startResize);
    
    function startResize(e) {
        if (!AppState.isEditMode) return;
        
        isResizing = true;
        startY = e.clientY;
        startHeight = parseInt(document.defaultView.getComputedStyle(handle.parentElement).height, 10);
        
        document.addEventListener('mousemove', doResize);
        document.addEventListener('mouseup', stopResize);
        
        e.preventDefault();
    }
    
    function doResize(e) {
        if (!isResizing) return;
        
        const dy = e.clientY - startY;
        const newHeight = Math.max(200, startHeight + dy);
        
        handle.parentElement.style.height = `${newHeight}px`;
        blockData.height = newHeight;
    }
    
    function stopResize() {
        isResizing = false;
        document.removeEventListener('mousemove', doResize);
        document.removeEventListener('mouseup', stopResize);
        
        // 保存更改
        saveData();
    }
}

// 更新排序面板
function updateSortingPanel() {
    if (!DOM.blockSortList) return;
    
    DOM.blockSortList.innerHTML = '';
    
    // 按照order排序
    const sortedBlocks = [...AppState.blocks].sort((a, b) => a.order - b.order);
    
    sortedBlocks.forEach(block => {
        if (block.id === 'home') return; // 首页不在排序面板中
        
        const li = document.createElement('li');
        li.className = 'sort-item';
        li.dataset.blockId = block.id;
        li.draggable = true;
        li.innerHTML = `
            <i class="fas fa-grip-vertical"></i>
            <span>${block.title}</span>
        `;
        
        // 拖拽事件
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDrop);
        li.addEventListener('dragend', handleDragEnd);
        
        DOM.blockSortList.appendChild(li);
    });
}

// 拖拽排序相关函数
function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.blockId);
    e.target.classList.add('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    const draggingItem = document.querySelector('.dragging');
    const afterElement = getDragAfterElement(DOM.blockSortList, e.clientY);
    
    if (afterElement == null) {
        DOM.blockSortList.appendChild(draggingItem);
    } else {
        DOM.blockSortList.insertBefore(draggingItem, afterElement);
    }
}

function handleDrop(e) {
    e.preventDefault();
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
    
    // 更新项目块顺序
    const items = DOM.blockSortList.querySelectorAll('.sort-item');
    items.forEach((item, index) => {
        const blockId = item.dataset.blockId;
        const block = AppState.blocks.find(b => b.id === blockId);
        if (block) {
            block.order = index + 1; // 首页order为0
        }
    });
    
    // 重新排序页面中的项目块
    reorderBlocks();
    updateNavItems();
    saveData();
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.sort-item:not(.dragging)')];
    
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

// 重新排序项目块
function reorderBlocks() {
    // 按照order排序
    const sortedBlocks = [...AppState.blocks].sort((a, b) => a.order - b.order);
    
    // 重新排列DOM元素
    sortedBlocks.forEach(block => {
        const blockElement = document.getElementById(`block-${block.id}`);
        if (blockElement) {
            DOM.blocksContainer.appendChild(blockElement);
        }
    });
}

// 滚动到指定项目块
function scrollToBlock(blockId) {
    const blockElement = document.getElementById(`block-${blockId}`);
    if (blockElement) {
        blockElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // 更新活动导航项
        document.querySelectorAll('#nav-items a').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`#nav-items a[href="#${blockId}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }
    }
}

// 创建粘贴框
function createSticker(type) {
    if (!AppState.isEditMode) {
        showNotification('请在编辑模式下添加粘贴框', 'error');
        return;
    }
    
    const stickerId = `sticker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const stickerData = {
        id: stickerId,
        type: type,
        content: '',
        position: { x: 100, y: 100 },
        size: { width: 300, height: 200 },
        parentBlockId: null,
        zIndex: 1000
    };
    
    AppState.stickers.push(stickerData);
    createStickerElement(stickerData);
    saveData();
    
    return stickerData;
}

// 创建粘贴框元素
function createStickerElement(stickerData) {
    let stickerHTML = '';
    
    switch (stickerData.type) {
        case 'text':
            stickerHTML = `
                <div class="sticker sticker-text" id="${stickerData.id}" 
                     style="left: ${stickerData.position.x}px; top: ${stickerData.position.y}px;
                            width: ${stickerData.size.width}px; height: ${stickerData.size.height}px;
                            z-index: ${stickerData.zIndex};">
                    <div class="sticker-header">
                        <span class="sticker-type-icon"><i class="fas fa-font"></i></span>
                        <button class="sticker-delete-btn ${AppState.isEditMode ? '' : 'hidden'}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="sticker-content" contenteditable="${AppState.isEditMode}">
                        点击这里输入文本...
                    </div>
                </div>
            `;
            break;
            
        case 'image':
            stickerHTML = `
                <div class="sticker sticker-image" id="${stickerData.id}"
                     style="left: ${stickerData.position.x}px; top: ${stickerData.position.y}px;
                            width: ${stickerData.size.width}px; height: ${stickerData.size.height}px;
                            z-index: ${stickerData.zIndex};">
                    <div class="sticker-header">
                        <span class="sticker-type-icon"><i class="fas fa-image"></i></span>
                        <button class="sticker-delete-btn ${AppState.isEditMode ? '' : 'hidden'}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="sticker-content">
                        <div class="image-placeholder">
                            <i class="fas fa-image"></i>
                            <p>点击添加图片</p>
                        </div>
                    </div>
                </div>
            `;
            break;
            
        case 'video':
            stickerHTML = `
                <div class="sticker sticker-video" id="${stickerData.id}"
                     style="left: ${stickerData.position.x}px; top: ${stickerData.position.y}px;
                            width: ${stickerData.size.width}px; height: ${stickerData.size.height}px;
                            z-index: ${stickerData.zIndex};">
                    <div class="sticker-header">
                        <span class="sticker-type-icon"><i class="fas fa-video"></i></span>
                        <button class="sticker-delete-btn ${AppState.isEditMode ? '' : 'hidden'}">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="sticker-content">
                        <div class="video-placeholder">
                            <i class="fas fa-video"></i>
                            <p>点击添加视频</p>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
    
    DOM.stickersContainer.insertAdjacentHTML('beforeend', stickerHTML);
    
    // 添加事件监听器
    const stickerElement = document.getElementById(stickerData.id);
    initStickerEvents(stickerElement, stickerData);
    
    return stickerElement;
}

// 初始化粘贴框事件
function initStickerEvents(stickerElement, stickerData) {
    // 删除按钮
    const deleteBtn = stickerElement.querySelector('.sticker-delete-btn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            deleteSticker(stickerData.id);
        });
    }
    
    // 拖拽功能
    if (AppState.isEditMode) {
        initDraggableSticker(stickerElement, stickerData);
    }
    
    // 文本粘贴框的编辑功能
    if (stickerData.type === 'text') {
        const contentElement = stickerElement.querySelector('.sticker-content');
        contentElement.addEventListener('focus', () => {
            if (AppState.isEditMode) {
                showTextToolbar(contentElement, stickerData);
            }
        });
        
        contentElement.addEventListener('blur', () => {
            stickerData.content = contentElement.innerHTML;
            saveData();
        });
    }
    
    // 图片粘贴框的点击事件
    if (stickerData.type === 'image') {
        const placeholder = stickerElement.querySelector('.image-placeholder');
        if (placeholder) {
            placeholder.addEventListener('click', () => {
                if (AppState.isEditMode) {
                    triggerImageUpload(stickerData.id);
                }
            });
        }
    }
    
    // 视频粘贴框的点击事件
    if (stickerData.type === 'video') {
        const placeholder = stickerElement.querySelector('.video-placeholder');
        if (placeholder) {
            placeholder.addEventListener('click', () => {
                if (AppState.isEditMode) {
                    triggerVideoUpload(stickerData.id);
                }
            });
        }
    }
}

// 初始化可拖拽粘贴框
function initDraggableSticker(stickerElement, stickerData) {
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    stickerElement.style.cursor = 'move';
    
    stickerElement.addEventListener('mousedown', startDrag);
    
    function startDrag(e) {
        if (!AppState.isEditMode) return;
        if (e.target.closest('.sticker-delete-btn')) return;
        
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = stickerData.position.x;
        initialY = stickerData.position.y;
        
        // 提高z-index
        stickerData.zIndex = 9999;
        stickerElement.style.zIndex = stickerData.zIndex;
        
        document.addEventListener('mousemove', doDrag);
        document.addEventListener('mouseup', stopDrag);
        
        e.preventDefault();
    }
    
    function doDrag(e) {
        if (!isDragging) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        const newX = initialX + dx;
        const newY = initialY + dy;
        
        stickerData.position.x = newX;
        stickerData.position.y = newY;
        
        stickerElement.style.left = `${newX}px`;
        stickerElement.style.top = `${newY}px`;
        
        // 检测与项目块的接触
        detectBlockCollision(stickerElement, stickerData);
    }
    
    function stopDrag() {
        isDragging = false;
        document.removeEventListener('mousemove', doDrag);
        document.removeEventListener('mouseup', stopDrag);
        
        // 恢复z-index
        stickerData.zIndex = 1000;
        stickerElement.style.zIndex = stickerData.zIndex;
        
        // 保存数据
        saveData();
    }
}

// 检测粘贴框与项目块的碰撞
function detectBlockCollision(stickerElement, stickerData) {
    const stickerRect = stickerElement.getBoundingClientRect();
    let maxOverlap = 0;
    let parentBlockId = null;
    
    // 获取所有项目块
    const blocks = document.querySelectorAll('.content-block');
    
    blocks.forEach(block => {
        const blockRect = block.getBoundingClientRect();
        
        // 计算重叠面积
        const overlapX = Math.max(0, 
            Math.min(stickerRect.right, blockRect.right) - 
            Math.max(stickerRect.left, blockRect.left)
        );
        
        const overlapY = Math.max(0,
            Math.min(stickerRect.bottom, blockRect.bottom) - 
            Math.max(stickerRect.top, blockRect.top)
        );
        
        const overlapArea = overlapX * overlapY;
        
        if (overlapArea > maxOverlap) {
            maxOverlap = overlapArea;
            parentBlockId = block.dataset.blockId;
        }
    });
    
    // 如果重叠面积大于阈值，建立关联
    if (maxOverlap > 1000) { // 1000像素的平方作为阈值
        stickerData.parentBlockId = parentBlockId;
        console.log(`粘贴框 ${stickerData.id} 关联到项目块 ${parentBlockId}`);
    } else {
        stickerData.parentBlockId = null;
    }
}

// 删除粘贴框
function deleteSticker(stickerId) {
    if (!AppState.isEditMode) return;
    
    if (confirm('确定要删除这个粘贴框吗？')) {
        // 从数组中移除
        const index = AppState.stickers.findIndex(s => s.id === stickerId);
        if (index !== -1) {
            AppState.stickers.splice(index, 1);
        }
        
        // 从DOM中移除
        const stickerElement = document.getElementById(stickerId);
        if (stickerElement) {
            stickerElement.remove();
        }
        
        // 保存数据
        saveData();
        showNotification('粘贴框已删除');
    }
}

// 显示文本编辑工具栏
function showTextToolbar(textElement, stickerData) {
    DOM.textToolbar.classList.remove('hidden');
    AppState.selectedElement = textElement;
    AppState.selectedSticker = stickerData;
    
    // 定位工具栏
    const rect = textElement.getBoundingClientRect();
    DOM.textToolbar.style.top = `${rect.top - 50}px`;
    DOM.textToolbar.style.left = `${rect.left}px`;
}

// 触发图片上传
function triggerImageUpload(stickerId) {
    // 创建文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadImage(file, stickerId);
        }
    });
    
    input.click();
}

// 触发视频上传
function triggerVideoUpload(stickerId) {
    // 创建文件输入元素
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            uploadVideo(file, stickerId);
        }
    });
    
    input.click();
}

// 上传图片（模拟）
function uploadImage(file, stickerId) {
    // 在实际应用中，这里应该上传到服务器
    // 这里我们使用FileReader来显示预览
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const sticker = AppState.stickers.find(s => s.id === stickerId);
        if (sticker) {
            sticker.content = e.target.result;
            
            // 更新DOM
            const stickerElement = document.getElementById(stickerId);
            if (stickerElement) {
                const contentElement = stickerElement.querySelector('.sticker-content');
                contentElement.innerHTML = `
                    <img src="${e.target.result}" alt="上传的图片" style="width: 100%; height: 100%; object-fit: cover;">
                `;
                
                // 重新初始化事件
                initStickerEvents(stickerElement, sticker);
            }
            
            saveData();
            showNotification('图片已上传');
        }
    };
    
    reader.readAsDataURL(file);
}

// 上传视频（模拟）
function uploadVideo(file, stickerId) {
    // 在实际应用中，这里应该上传到服务器
    // 这里我们使用FileReader来显示预览
    
    const reader = new FileReader();
    reader.onload = (e) => {
        const sticker = AppState.stickers.find(s => s.id === stickerId);
        if (sticker) {
            sticker.content = e.target.result;
            
            // 更新DOM
            const stickerElement = document.getElementById(stickerId);
            if (stickerElement) {
                const contentElement = stickerElement.querySelector('.sticker-content');
                contentElement.innerHTML = `
                    <video src="${e.target.result}" controls style="width: 100%; height: 100%; object-fit: cover;"></video>
                `;
                
                // 重新初始化事件
                initStickerEvents(stickerElement, sticker);
            }
            
            saveData();
            showNotification('视频已上传');
        }
    };
    
    reader.readAsDataURL(file);
}

// 切换粘贴框类型菜单
function toggleStickerTypeMenu() {
    if (!AppState.isEditMode) {
        showNotification('请在编辑模式下添加粘贴框', 'error');
        return;
    }
    
    if (DOM.stickerTypeMenu.classList.contains('hidden')) {
        DOM.stickerTypeMenu.classList.remove('hidden');
    } else {
        DOM.stickerTypeMenu.classList.add('hidden');
    }
}

// 隐藏粘贴框类型菜单
function hideStickerTypeMenu() {
    DOM.stickerTypeMenu.classList.add('hidden');
}

// 更新布局
function updateLayout() {
    // 重新计算粘贴框位置
    AppState.stickers.forEach(sticker => {
        const stickerElement = document.getElementById(sticker.id);
        if (stickerElement) {
            stickerElement.style.left = `${sticker.position.x}px`;
            stickerElement.style.top = `${sticker.position.y}px`;
            stickerElement.style.width = `${sticker.size.width}px`;
            stickerElement.style.height = `${sticker.size.height}px`;
        }
    });
    
    // 更新导航栏项目
    updateNavItems();
}

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 显示通知
function showNotification(message, type = 'success') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // 3秒后移除
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM已加载，开始初始化...');
    init();
});
