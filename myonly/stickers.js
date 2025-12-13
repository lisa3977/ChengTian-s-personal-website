/**
 * 贴纸管理系统
 * 处理文本、图片、视频贴纸的创建、拖拽、缩放和超链接功能
 */

class StickersManager {
    constructor() {
        this.stickersContainer = document.getElementById('stickers-container');
        this.activeSticker = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.isResizing = false;
        this.resizeStart = { x: 0, y: 0 };
        this.resizeStartSize = { width: 0, height: 0 };
        this.resizeDirection = null;
        
        // 莫兰迪色盘
        this.morandiColors = [
            '#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb',
            '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784',
            '#aed581', '#dce775', '#fff176', '#ffd54f', '#ffb74d'
        ];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.loadStickersFromStorage();
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 贴纸拖拽
        document.addEventListener('mousedown', (e) => {
            const sticker = e.target.closest('.sticker');
            if (!sticker) return;
            
            if (e.target.classList.contains('sticker-resize')) {
                this.startResize(sticker, e);
            } else if (e.target.classList.contains('sticker-link-btn')) {
                // 处理链接按钮点击
                e.stopPropagation();
                this.showLinkDialog(sticker);
            } else {
                this.startDrag(sticker, e);
            }
        });
        
        // 鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.activeSticker) {
                this.handleDragMove(e);
            }
            if (this.isResizing && this.activeSticker) {
                this.handleResizeMove(e);
            }
        });
        
        // 鼠标释放事件
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.handleDragEnd();
            }
            if (this.isResizing) {
                this.handleResizeEnd();
            }
        });
        
        // 文本贴纸编辑
        document.addEventListener('dblclick', (e) => {
            const textSticker = e.target.closest('.text-sticker');
            if (textSticker && window.isEditMode) {
                this.editTextSticker(textSticker);
            }
        });
        
        // 图片贴纸点击
        document.addEventListener('click', (e) => {
            const imgSticker = e.target.closest('.image-sticker');
            if (imgSticker && e.target.tagName === 'IMG' && window.isEditMode) {
                this.showImageOptions(imgSticker, e);
            }
        });
    }
    
    /**
     * 开始拖拽贴纸
     */
    startDrag(sticker, e) {
        if (!window.isEditMode) return;
        
        e.preventDefault();
        this.isDragging = true;
        this.activeSticker = sticker;
        
        const rect = sticker.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        
        sticker.style.zIndex = '1000';
        sticker.classList.add('dragging');
    }
    
    /**
     * 处理拖拽移动
     */
    handleDragMove(e) {
        if (!this.activeSticker) return;
        
        const x = e.clientX - this.dragOffset.x;
        const y = e.clientY - this.dragOffset.y;
        
        this.activeSticker.style.left = x + 'px';
        this.activeSticker.style.top = y + 'px';
        
        // 检查是否在项目块区域内
        this.checkBlockOverlap(this.activeSticker);
    }
    
    /**
     * 处理拖拽结束
     */
    handleDragEnd() {
        if (!this.activeSticker) return;
        
        this.isDragging = false;
        this.activeSticker.classList.remove('dragging');
        
        // 保存位置到本地存储
        this.saveStickerPosition(this.activeSticker);
        
        // 建立与项目块的关联
        this.attachToBlock(this.activeSticker);
        
        this.activeSticker = null;
    }
    
    /**
     * 开始调整贴纸大小
     */
    startResize(sticker, e) {
        if (!window.isEditMode) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        this.isResizing = true;
        this.activeSticker = sticker;
        this.resizeStart.x = e.clientX;
        this.resizeStart.y = e.clientY;
        
        const rect = sticker.getBoundingClientRect();
        this.resizeStartSize.width = rect.width;
        this.resizeStartSize.height = rect.height;
        
        // 确定调整方向
        const handle = e.target;
        this.resizeDirection = handle.dataset.direction || 'se';
        
        sticker.classList.add('resizing');
    }
    
    /**
     * 处理调整大小移动
     */
    handleResizeMove(e) {
        if (!this.activeSticker) return;
        
        const deltaX = e.clientX - this.resizeStart.x;
        const deltaY = e.clientY - this.resizeStart.y;
        
        let newWidth = this.resizeStartSize.width;
        let newHeight = this.resizeStartSize.height;
        
        // 根据方向调整大小（保持宽高比）
        switch (this.resizeDirection) {
            case 'se': // 右下角
                newWidth = Math.max(100, this.resizeStartSize.width + deltaX);
                newHeight = Math.max(80, this.resizeStartSize.height + deltaY);
                // 保持宽高比
                const ratio = this.resizeStartSize.width / this.resizeStartSize.height;
                newHeight = newWidth / ratio;
                break;
            case 'sw': // 左下角
                newWidth = Math.max(100, this.resizeStartSize.width - deltaX);
                newHeight = Math.max(80, this.resizeStartSize.height + deltaY);
                const left = parseFloat(this.activeSticker.style.left) || 0;
                this.activeSticker.style.left = (left + deltaX) + 'px';
                break;
            // 可以添加其他方向...
        }
        
        this.activeSticker.style.width = newWidth + 'px';
        this.activeSticker.style.height = newHeight + 'px';
    }
    
    /**
     * 处理调整大小结束
     */
    handleResizeEnd() {
        if (!this.activeSticker) return;
        
        this.isResizing = false;
        this.activeSticker.classList.remove('resizing');
        
        // 保存大小到本地存储
        this.saveStickerSize(this.activeSticker);
        
        this.activeSticker = null;
        this.resizeDirection = null;
    }
    
    /**
     * 检查贴纸与项目块的重叠
     */
    checkBlockOverlap(sticker) {
        const blocks = document.querySelectorAll('.content-block');
        const stickerRect = sticker.getBoundingClientRect();
        
        let maxOverlap = 0;
        let targetBlock = null;
        
        blocks.forEach(block => {
            const blockRect = block.getBoundingClientRect();
            const overlap = this.calculateOverlap(stickerRect, blockRect);
            
            if (overlap > maxOverlap) {
                maxOverlap = overlap;
                targetBlock = block;
            }
        });
        
        // 如果重叠面积超过贴纸面积的30%，显示吸附提示
        const stickerArea = stickerRect.width * stickerRect.height;
        if (maxOverlap > stickerArea * 0.3) {
            sticker.classList.add('overlapping');
            sticker.dataset.targetBlock = targetBlock?.id || '';
        } else {
            sticker.classList.remove('overlapping');
            delete sticker.dataset.targetBlock;
        }
    }
    
    /**
     * 计算两个矩形的重叠面积
     */
    calculateOverlap(rect1, rect2) {
        const xOverlap = Math.max(0, 
            Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left)
        );
        const yOverlap = Math.max(0,
            Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top)
        );
        
        return xOverlap * yOverlap;
    }
    
    /**
     * 将贴纸关联到项目块
     */
    attachToBlock(sticker) {
        const targetBlockId = sticker.dataset.targetBlock;
        if (!targetBlockId) {
            // 脱离项目块区域
            sticker.dataset.parentBlock = '';
            return;
        }
        
        const block = document.getElementById(targetBlockId);
        if (block) {
            sticker.dataset.parentBlock = targetBlockId;
            
            // 当项目块移动时，贴纸跟随移动
            this.setupBlockFollowing(sticker, block);
        }
    }
    
    /**
     * 设置贴纸跟随项目块移动
     */
    setupBlockFollowing(sticker, block) {
        // 保存贴纸相对于项目块的初始位置
        const blockRect = block.getBoundingClientRect();
        const stickerRect = sticker.getBoundingClientRect();
        
        const relativeX = stickerRect.left - blockRect.left;
        const relativeY = stickerRect.top - blockRect.top;
        
        sticker.dataset.relativeX = relativeX;
        sticker.dataset.relativeY = relativeY;
        
        // 监听项目块位置变化
        this.observeBlockPosition(block, sticker);
    }
    
    /**
     * 观察项目块位置变化
     */
    observeBlockPosition(block, sticker) {
        // 使用MutationObserver监听项目块的位置变化
        const observer = new MutationObserver(() => {
            this.updateStickerPositionRelativeToBlock(block, sticker);
        });
        
        // 观察项目块的样式变化
        observer.observe(block, {
            attributes: true,
            attributeFilter: ['style', 'class']
        });
        
        // 保存观察者以便后续清理
        if (!block.dataset.stickerObservers) {
            block.dataset.stickerObservers = JSON.stringify([]);
        }
        
        const observers = JSON.parse(block.dataset.stickerObservers);
        observers.push({
            stickerId: sticker.id,
            observer: observer
        });
        block.dataset.stickerObservers = JSON.stringify(observers);
    }
    
    /**
     * 更新贴纸相对于项目块的位置
     */
    updateStickerPositionRelativeToBlock(block, sticker) {
        if (!sticker.dataset.relativeX || !sticker.dataset.relativeY) return;
        
        const blockRect = block.getBoundingClientRect();
        const relativeX = parseFloat(sticker.dataset.relativeX);
        const relativeY = parseFloat(sticker.dataset.relativeY);
        
        // 计算贴纸的新位置
        const newX = blockRect.left + relativeX;
        const newY = blockRect.top + relativeY;
        
        // 更新贴纸位置
        sticker.style.left = newX + 'px';
        sticker.style.top = newY + 'px';
        
        // 保存到本地存储
        this.saveStickerPosition(sticker);
    }
    
    /**
     * 清理项目块的贴纸观察者
     */
    cleanupBlockObservers(block) {
        if (!block.dataset.stickerObservers) return;
        
        const observers = JSON.parse(block.dataset.stickerObservers);
        observers.forEach(observerData => {
            observerData.observer.disconnect();
        });
        
        delete block.dataset.stickerObservers;
    }
    
    /**
     * 创建文本贴纸
     */
    createTextSticker(text = '双击编辑文本', x = 100, y = 100) {
        const stickerId = 'sticker-text-' + Date.now();
        const color = this.getRandomColor();
        
        const stickerHTML = `
            <div class="sticker text-sticker" id="${stickerId}" 
                 style="left: ${x}px; top: ${y}px;">
                <div class="sticker-content editable" contenteditable="true">
                    ${text}
                </div>
                <div class="sticker-toolbar">
                    <button class="sticker-link-btn" title="添加超链接">🔗</button>
                </div>
                <div class="sticker-resize" data-direction="se"></div>
            </div>
        `;
        
        this.stickersContainer.insertAdjacentHTML('beforeend', stickerHTML);
        
        const sticker = document.getElementById(stickerId);
        this.setupTextStickerEvents(sticker);
        
        // 保存到本地存储
        this.saveNewSticker({
            id: stickerId,
            type: 'text',
            text: text,
            x: x,
            y: y,
            color: color,
            width: 200,
            height: 160
        });
        
        return stickerId;
    }
    
    /**
     * 设置文本贴纸事件
     */
    setupTextStickerEvents(sticker) {
        const content = sticker.querySelector('.sticker-content');
        
        // 文本编辑完成
        content.addEventListener('blur', () => {
            this.saveStickerText(sticker.id, content.innerHTML);
        });
        
        // 文本选中时显示工具条
        content.addEventListener('mouseup', (e) => {
            if (window.getSelection().toString().length > 0) {
                this.showTextToolbar(sticker, e);
            }
        });
    }
    
    /**
     * 编辑文本贴纸
     */
    editTextSticker(sticker) {
        const content = sticker.querySelector('.sticker-content');
        content.focus();
        
        // 选中所有文本
        const range = document.createRange();
        range.selectNodeContents(content);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
    
    /**
     * 显示文本工具条
     */
    showTextToolbar(sticker, e) {
        // 创建或显示工具条
        let toolbar = sticker.querySelector('.text-toolbar');
        if (!toolbar) {
            toolbar = document.createElement('div');
            toolbar.className = 'text-toolbar';
            toolbar.innerHTML = `
                <select class="font-size-select">
                    <option value="0.875rem">小字</option>
                    <option value="1rem" selected>普通</option>
                    <option value="1.5rem">副标题</option>
                </select>
                <div class="color-palette">
                    ${this.morandiColors.map(color => `
                        <button class="color-btn" style="background-color: ${color}" 
                                data-color="${color}" title="${color}"></button>
                    `).join('')}
                </div>
                <button class="link-btn" title="添加超链接">🔗</button>
            `;
            sticker.appendChild(toolbar);
            
            // 设置工具条事件
            this.setupTextToolbarEvents(sticker, toolbar);
        }
        
        // 定位工具条
        const rect = sticker.getBoundingClientRect();
        toolbar.style.left = (e.clientX - rect.left - 50) + 'px';
        toolbar.style.top = '-40px';
        toolbar.style.display = 'flex';
    }
    
    /**
     * 设置文本工具条事件
     */
    setupTextToolbarEvents(sticker, toolbar) {
        const content = sticker.querySelector('.sticker-content');
        
        // 字号选择
        const fontSizeSelect = toolbar.querySelector('.font-size-select');
        fontSizeSelect.addEventListener('change', (e) => {
            const selection = window.getSelection();
            if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const span = document.createElement('span');
                span.style.fontSize = e.target.value;
                range.surroundContents(span);
                this.saveStickerText(sticker.id, content.innerHTML);
            }
        });
        
        // 颜色选择
        const colorButtons = toolbar.querySelectorAll('.color-btn');
        colorButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const color = btn.dataset.color;
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    const span = document.createElement('span');
                    span.style.color = color;
                    range.surroundContents(span);
                    this.saveStickerText(sticker.id, content.innerHTML);
                }
            });
        });
        
        // 链接按钮
        const linkBtn = toolbar.querySelector('.link-btn');
        linkBtn.addEventListener('click', () => {
            this.showLinkDialog(sticker);
        });
        
        // 点击页面其他区域关闭工具条
        document.addEventListener('click', (e) => {
            if (!toolbar.contains(e.target) && !content.contains(e.target)) {
                toolbar.style.display = 'none';
            }
        }, { once: true });
    }
    
    /**
     * 创建图片贴纸
     */
    createImageSticker(src, x = 100, y = 100) {
        const stickerId = 'sticker-image-' + Date.now();
        
        const stickerHTML = `
            <div class="sticker image-sticker" id="${stickerId}" 
                 style="left: ${x}px; top: ${y}px;">
                <img src="${src}" alt="图片贴纸" draggable="false">
                <div class="sticker-toolbar">
                    <button class="sticker-link-btn" title="添加超链接">🔗</button>
                </div>
                <div class="sticker-resize" data-direction="se"></div>
            </div>
        `;
        
        this.stickersContainer.insertAdjacentHTML('beforeend', stickerHTML);
        
        // 保存到本地存储
        this.saveNewSticker({
            id: stickerId,
            type: 'image',
            src: src,
            x: x,
            y: y,
            width: 200,
            height: 160
        });
        
        return stickerId;
    }
    
    /**
     * 显示图片选项
     */
    showImageOptions(sticker, e) {
        // 创建选项菜单
        const menu = document.createElement('div');
        menu.className = 'image-options-menu';
        menu.innerHTML = `
            <button class="option-btn change-image">更换图片</button>
            <button class="option-btn add-link">添加链接</button>
            <button class="option-btn delete-sticker">删除贴纸</button>
        `;
        
        document.body.appendChild(menu);
        
        // 定位菜单
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';
        
        // 设置菜单事件
        menu.querySelector('.change-image').addEventListener('click', () => {
            this.changeImage(sticker);
            menu.remove();
        });
        
        menu.querySelector('.add-link').addEventListener('click', () => {
            this.showLinkDialog(sticker);
            menu.remove();
        });
        
        menu.querySelector('.delete-sticker').addEventListener('click', () => {
            if (confirm('确定要删除这个贴纸吗？')) {
                sticker.remove();
                this.deleteStickerFromStorage(sticker.id);
            }
            menu.remove();
        });
        
        // 点击其他地方关闭菜单
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !sticker.contains(e.target)) {
                    menu.remove();
                }
            }, { once: true });
        }, 0);
    }
    
    /**
     * 更换图片
     */
    changeImage(sticker) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = sticker.querySelector('img');
                    img.src = e.target.result;
                    
                    // 保存到本地存储
                    this.updateStickerImage(sticker.id, e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
        
        input.click();
    }
    
    /**
     * 显示链接对话框
     */
    showLinkDialog(sticker) {
        const currentLink = sticker.dataset.link || '';
        
        const url = prompt('请输入链接地址：', currentLink);
        if (url !== null) {
            if (url.trim() === '') {
                // 移除链接
                delete sticker.dataset.link;
                sticker.classList.remove('has-link');
            } else {
                // 添加链接
                sticker.dataset.link = url;
                sticker.classList.add('has-link');
                
                // 如果是图片贴纸，添加点击跳转
                if (sticker.classList.contains('image-sticker')) {
                    const img = sticker.querySelector('img');
                    img.style.cursor = 'pointer';
                    img.onclick = () => {
                        window.open(url, '_blank');
                    };
                }
                
                // 保存到本地存储
                this.saveStickerLink(sticker.id, url);
            }
        }
    }
    
    /**
     * 创建视频贴纸
     */
    createVideoSticker(src, x = 100, y = 100) {
        const stickerId = 'sticker-video-' + Date.now();
        
        const stickerHTML = `
            <div class="sticker video-sticker" id="${stickerId}" 
                 style="left: ${x}px; top: ${y}px;">
                <video controls draggable="false">
                    <source src="${src}" type="video/mp4">
                    您的浏览器不支持视频标签。
                </video>
                <div class="sticker-toolbar">
                    <button class="sticker-link-btn" title="添加超链接">🔗</button>
                </div>
                <div class="sticker-resize" data-direction="se"></div>
            </div>
        `;
        
        this.stickersContainer.insertAdjacentHTML('beforeend', stickerHTML);
        
        // 保存到本地存储
        this.saveNewSticker({
            id: stickerId,
            type: 'video',
            src: src,
            x: x,
            y: y,
            width: 300,
            height: 200
        });
        
        return stickerId;
    }
    
    /**
     * 创建混合贴纸（文本+图片）
     */
    createMixedSticker(text = '混合内容', imageSrc = '', x = 100, y = 100) {
        const stickerId = 'sticker-mixed-' + Date.now();
        const color = this.getRandomColor();
        
        const stickerHTML = `
            <div class="sticker mixed-sticker" id="${stickerId}" 
                 style="left: ${x}px; top: ${y}px;">
                <div class="mixed-content">
                    ${imageSrc ? `<img src="${imageSrc}" alt="混合贴纸图片" draggable="false">` : ''}
                    <div class="mixed-text" contenteditable="true">${text}</div>
                </div>
                <div class="sticker-toolbar">
                    <button class="sticker-link-btn" title="添加超链接">🔗</button>
                </div>
                <div class="sticker-resize" data-direction="se"></div>
            </div>
        `;
        
        this.stickersContainer.insertAdjacentHTML('beforeend', stickerHTML);
        
        const sticker = document.getElementById(stickerId);
        this.setupMixedStickerEvents(sticker);
        
        // 保存到本地存储
        this.saveNewSticker({
            id: stickerId,
            type: 'mixed',
            text: text,
            imageSrc: imageSrc,
            x: x,
            y: y,
            color: color,
            width: 250,
            height: 200
        });
        
        return stickerId;
    }
    
    /**
     * 设置混合贴纸事件
     */
    setupMixedStickerEvents(sticker) {
        const textElement = sticker.querySelector('.mixed-text');
        const imgElement = sticker.querySelector('img');
        
        // 文本编辑完成
        if (textElement) {
            textElement.addEventListener('blur', () => {
                this.saveStickerText(sticker.id, textElement.innerHTML);
            });
        }
        
        // 图片点击事件
        if (imgElement) {
            imgElement.addEventListener('click', (e) => {
                if (window.isEditMode) {
                    this.showImageOptions(sticker, e);
                }
            });
        }
    }
    
    /**
     * 获取随机颜色
     */
    getRandomColor() {
        return this.morandiColors[Math.floor(Math.random() * this.morandiColors.length)];
    }
    
    /**
     * 保存贴纸位置到本地存储
     */
    saveStickerPosition(sticker) {
        const stickers = JSON.parse(localStorage.getItem('portfolio_stickers') || '{}');
        if (!stickers[sticker.id]) {
            stickers[sticker.id] = {};
        }
        stickers[sticker.id].x = parseFloat(sticker.style.left) || 0;
        stickers[sticker.id].y = parseFloat(sticker.style.top) || 0;
        localStorage.setItem('portfolio_stickers', JSON.stringify(stickers));
    }
    
    /**
     * 保存贴纸大小到本地存储
     */
    saveStickerSize(sticker) {
        const stickers = JSON.parse(localStorage.getItem('portfolio_stickers') || '{}');
        if (!stickers[sticker.id]) {
            stickers[sticker.id] = {};
        }
        stickers[sticker.id].width = sticker.offsetWidth;
        stickers[sticker.id].height = sticker.offsetHeight;
        localStorage.setItem('portfolio_stickers', JSON.stringify(stickers));
    }
    
    /**
     * 保存贴纸文本到本地存储
     */
    saveStickerText(stickerId, text) {
        const stickers = JSON.parse(localStorage.getItem('portfolio_stickers') || '{}');
        if (!stickers[stickerId]) {
            stickers[stickerId] = {};
        }
        stickers[stickerId].text = text;
        localStorage.setItem('portfolio_stickers', JSON.stringify(stickers));
    }
    
    /**
     * 保存贴纸链接到本地存储
     */
    saveStickerLink(stickerId, link) {
        const stickers = JSON.parse(localStorage.getItem('portfolio_stickers') || '{}');
        if (!stickers[stickerId]) {
            stickers[stickerId] = {};
        }
        stickers[stickerId].link = link;
        localStorage.setItem('portfolio_stickers', JSON.stringify(stickers));
    }
    
    /**
     * 保存新贴纸到本地存储
     */
    saveNewSticker(stickerData) {
        const stickers = JSON.parse(localStorage.getItem('portfolio_stickers') || '{}');
        stickers[stickerData.id] = stickerData;
        localStorage.setItem('portfolio_stickers', JSON.stringify(stickers));
    }
    
    /**
     * 更新贴纸图片到本地存储
     */
    updateStickerImage(stickerId, src) {
        const stickers = JSON.parse(localStorage.getItem('portfolio_stickers') || '{}');
        if (stickers[stickerId]) {
            stickers[stickerId].src = src;
            localStorage.setItem('portfolio_stickers', JSON.stringify(stickers));
        }
    }
    
    /**
     * 从本地存储删除贴纸
     */
    deleteStickerFromStorage(stickerId) {
        const stickers = JSON.parse(localStorage.getItem('portfolio_stickers') || '{}');
        delete stickers[stickerId];
        localStorage.setItem('portfolio_stickers', JSON.stringify(stickers));
    }
    
    /**
     * 从本地存储加载贴纸
     */
    loadStickersFromStorage() {
        const stickers = JSON.parse(localStorage.getItem('portfolio_stickers') || '{}');
        
        Object.values(stickers).forEach(stickerData => {
            switch (stickerData.type) {
                case 'text':
                    this.createTextSticker(
                        stickerData.text || '双击编辑文本',
                        stickerData.x || 100,
                        stickerData.y || 100
                    );
                    break;
                case 'image':
                    this.createImageSticker(
                        stickerData.src || '',
                        stickerData.x || 100,
                        stickerData.y || 100
                    );
                    break;
                case 'video':
                    this.createVideoSticker(
                        stickerData.src || '',
                        stickerData.x || 100,
                        stickerData.y || 100
                    );
                    break;
                case 'mixed':
                    this.createMixedSticker(
                        stickerData.text || '混合内容',
                        stickerData.imageSrc || '',
                        stickerData.x || 100,
                        stickerData.y || 100
                    );
                    break;
            }
            
            // 恢复贴纸大小
            const sticker = document.getElementById(stickerData.id);
            if (sticker && stickerData.width && stickerData.height) {
                sticker.style.width = stickerData.width + 'px';
                sticker.style.height = stickerData.height + 'px';
            }
            
            // 恢复链接
            if (sticker && stickerData.link) {
                sticker.dataset.link = stickerData.link;
                sticker.classList.add('has-link');
            }
            
            // 恢复颜色
            if (sticker && stickerData.color) {
                sticker.dataset.color = stickerData.color;
            }
        });
    }
}

// 导出StickersManager类
window.StickersManager = StickersManager;
