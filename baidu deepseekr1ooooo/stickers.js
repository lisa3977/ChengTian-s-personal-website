class StickerManager {
    constructor() {
        this.stickers = [];
        this.currentSticker = null;
        this.isDragging = false;
        this.isResizing = false;
        this.dragOffset = { x: 0, y: 0 };
        this.initializeStickers();
    }
    
    initializeStickers() {
        // 从localStorage加载已保存的贴纸
        const savedStickers = localStorage.getItem('portfolioStickers');
        if (savedStickers) {
            this.stickers = JSON.parse(savedStickers);
            this.renderStickers();
        }
    }
    
    createSticker(type, content = '') {
        const stickerId = 'sticker-' + Date.now();
        const sticker = document.createElement('div');
        sticker.className = 'sticker';
        sticker.setAttribute('data-sticker', stickerId);
        
        switch (type) {
            case 'text':
                sticker.classList.add('text-sticker');
                sticker.innerHTML = `
                    <div class="sticker-content" contenteditable="true">${content}</div>
                    <div class="sticker-handle"></div>
                `;
                break;
            case 'image':
                sticker.classList.add('image-sticker');
                sticker.innerHTML = `
                    <img src="${content}" alt="贴纸图片" style="width: 100%; height: 100%; object-fit: cover;">
                    <div class="sticker-handle"></div>
                `;
                break;
            case 'video':
                sticker.classList.add('video-sticker');
                sticker.innerHTML = `
                    <video controls style="width: 100%; height: 100%;">
                        <source src="${content}" type="video/mp4">
                    </video>
                    <div class="sticker-handle"></div>
                `;
                break;
        }
        
        const stickerData = {
            id: stickerId,
            element: sticker,
            type: type,
            content: content,
            position: { x: 100, y: 100 },
            parentBlock: null
        };
        
        this.stickers.push(stickerData);
        document.body.appendChild(sticker);
        
        this.setupStickerEvents(sticker, stickerData);
        this.saveStickers();
        
        return stickerData;
    }
    
    setupStickerEvents(sticker, stickerData) {
        // 拖拽功能
        sticker.addEventListener('mousedown', (e) => this.startDrag(e, stickerData));
        
        // 缩放功能
        const handle = sticker.querySelector('.sticker-handle');
        if (handle) {
            handle.addEventListener('mousedown', (e) => this.startResize(e, stickerData));
        }
        
        // 链接功能
        if (stickerData.type === 'text' || stickerData.type === 'image') {
            this.setupLinkFunctionality(sticker, stickerData);
        }
    }
    
    startDrag(e, stickerData) {
        if (e.target.classList.contains('sticker-handle')) return;
        
        this.isDragging = true;
        this.currentSticker = stickerData;
        
        const rect = sticker.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        
        document.addEventListener('mousemove', this.onDragMove);
        document.addEventListener('mouseup', this.stopDrag);
        
        e.preventDefault();
    }
    
    onDragMove = (e) => {
        if (!this.isDragging || !this.currentSticker) return;
        
        const newX = e.clientX - this.dragOffset.x;
        const newY = e.clientY - this.dragOffset.y;
        
        this.currentSticker.element.style.left = newX + 'px';
        this.currentSticker.element.style.top = newY + 'px';
        
        this.currentSticker.position = { x: newX, y: newY };
        
        // 检测吸附到项目块
        this.checkBlockAttachment(this.currentSticker);
    }
    
    stopDrag = () => {
        this.isDragging = false;
        this.currentSticker = null;
        this.saveStickers();
    }
    
    startResize(e, stickerData) {
        e.stopPropagation();
        
        this.currentSticker = stickerData;
        this.isResizing = true;
        
        document.addEventListener('mousemove', this.onResizeMove);
        document.addEventListener('mouseup', this.stopResize);
    }
    
    onResizeMove = (e) => {
        if (!this.isResizing || !this.currentSticker) return;
        
        // 实现缩放逻辑
        const newWidth = Math.max(100, e.clientX - stickerData.position.x);
        const newHeight = Math.max(80, e.clientY - stickerData.position.y);
        
        this.currentSticker.element.style.width = newWidth + 'px';
        this.currentSticker.element.style.height = newHeight + 'px';
    }
    
    stopResize = () => {
        this.isResizing = false;
        this.currentSticker = null;
        this.saveStickers();
    }
    
    checkBlockAttachment(sticker) {
        const blocks = document.querySelectorAll('.content-block');
        let maxOverlap = 0;
        let attachedBlock = null;
        
        blocks.forEach(block => {
            const blockRect = block.getBoundingClientRect();
            const stickerRect = sticker.element.getBoundingClientRect();
            
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
                attachedBlock = block.getAttribute('data-block');
            }
        });
        
        sticker.parentBlock = attachedBlock;
    }
    
    setupLinkFunctionality(sticker, stickerData) {
        if (stickerData.type === 'text') {
            const content = sticker.querySelector('.sticker-content');
            
            content.addEventListener('mouseup', () => {
                const selection = window.getSelection();
                if (selection.toString().length > 0) {
                    this.showLinkToolbar(sticker, stickerData, selection);
                }
            });
        }
        
        if (stickerData.type === 'image') {
            sticker.addEventListener('mouseenter', () => {
                this.showImageLinkButton(sticker, stickerData);
            });
        }
    }
    
    showLinkToolbar(sticker, stickerData, selection) {
        // 移除现有工具栏
        const existingToolbar = document.querySelector('.link-toolbar');
        if (existingToolbar) {
            existingToolbar.remove();
        }
        
        const toolbar = document.createElement('div');
        toolbar.className = 'link-toolbar';
        toolbar.innerHTML = `
            <select class="font-size-select">
                <option value="1rem">普通文本</option>
                <option value="1.5rem">副标题</option>
                <option value="0.875rem">小字注释</option>
            </select>
            <input type="color" class="color-picker">
            <button class="add-link-btn">添加链接</button>
        `;
        
        sticker.appendChild(toolbar);
        
        // 工具栏事件处理
        this.setupToolbarEvents(toolbar, stickerData, selection);
    }
    
    setupToolbarEvents(toolbar, stickerData, selection) {
        const fontSizeSelect = toolbar.querySelector('.font-size-select');
        const colorPicker = toolbar.querySelector('.color-picker');
        const addLinkBtn = toolbar.querySelector('.add-link-btn');
        
        fontSizeSelect.addEventListener('change', (e) => {
            this.applyFontSize(selection, e.target.value);
        });
        
        colorPicker.addEventListener('change', (e) => {
            this.applyColor(selection, e.target.value);
        });
        
        addLinkBtn.addEventListener('click', () => {
            this.addLinkToSelection(selection, stickerData);
        });
        
        // 点击页面其他地方关闭工具栏
        document.addEventListener('click', (e) => {
            if (!toolbar.contains(e.target)) {
                toolbar.remove();
            }
        });
    }
    
    applyFontSize(selection, size) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.fontSize = size;
        range.surroundContents(span);
    }
    
    applyColor(selection, color) {
        const range = selection.getRangeAt(0);
        const span = document.createElement('span');
        span.style.color = color;
        range.surroundContents(span);
    }
    
    addLinkToSelection(selection, stickerData) {
        const url = prompt('请输入链接地址:');
        if (url) {
            const range = selection.getRangeAt(0);
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.style.color = this.getLinkColor(selection.toString());
            range.surroundContents(link);
        }
    }
    
    getLinkColor(text) {
        // 根据文本颜色返回对应的明亮链接颜色
        // 实现颜色映射逻辑
        return '#2196F3'; // 默认蓝色
    }
    
    showImageLinkButton(sticker, stickerData) {
        const existingButton = sticker.querySelector('.image-link-btn');
        if (existingButton) return;
        
        const linkButton = document.createElement('button');
        linkButton.className = 'image-link-btn';
        linkButton.textContent = '🔗';
        linkButton.style.position = 'absolute';
        linkButton.style.top = '5px';
        linkButton.style.right = '5px';
        
        linkButton.addEventListener('click', () => {
            const url = prompt('请输入图片链接地址:');
            if (url) {
                stickerData.link = url;
                this.saveStickers();
            }
        });
        
        sticker.appendChild(linkButton);
    }
    
    renderStickers() {
        this.stickers.forEach(stickerData => {
            document.body.appendChild(stickerData.element);
            this.setupStickerEvents(stickerData.element, stickerData);
        });
    }
    
    saveStickers() {
        localStorage.setItem('portfolioStickers', JSON.stringify(this.stickers));
    }
}

// 初始化贴纸管理器
let stickerManager = new StickerManager();
