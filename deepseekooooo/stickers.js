// 贴纸管理系统
class StickersManager {
    constructor() {
        this.stickers = [];
        this.currentSticker = null;
        this.isDragging = false;
        this.init();
    }
    
    init() {
        this.loadStickers();
        this.bindEvents();
    }
    
    bindEvents() {
        // 监听菜单点击事件
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('menu-option')) {
                const action = e.target.dataset.action;
                
                if (window.isEditMode) {
                    switch(action) {
                        case 'add-text':
                            this.addTextSticker();
                            break;
                        case 'add-image':
                            this.addImageSticker();
                            break;
                        case 'add-video':
                            this.addVideoSticker();
                            break;
                    }
                }
            }
        });
    }
    
    addTextSticker(content = '编辑文本...') {
        const sticker = this.createSticker('text');
        
        const textarea = document.createElement('textarea');
        textarea.value = content;
        textarea.placeholder = '输入文本...';
        textarea.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            outline: none;
            background: transparent;
            resize: none;
            font-family: inherit;
            font-size: 14px;
            line-height: 1.5;
        `;
        
        sticker.content.appendChild(textarea);
        
        // 使文本可编辑
        this.makeEditable(sticker, textarea);
        
        return sticker;
    }
    
    addImageSticker(src = '') {
        const sticker = this.createSticker('image');
        
        const imgContainer = document.createElement('div');
        imgContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        `;
        
        const img = document.createElement('img');
        img.src = src || 'https://via.placeholder.com/180x120?text=点击上传图片';
        img.alt = '贴纸图片';
        img.style.cssText = `
            max-width: 100%;
            max-height: 100%;
            object-fit: contain;
        `;
        
        // 添加上传功能
        imgContainer.addEventListener('click', () => {
            if (window.isEditMode) {
                this.uploadImage(img);
            }
        });
        
        imgContainer.appendChild(img);
        sticker.content.appendChild(imgContainer);
        
        // 添加链接按钮
        this.addLinkButton(sticker, imgContainer);
        
        return sticker;
    }
    
    addVideoSticker(src = '') {
        const sticker = this.createSticker('video');
        
        const videoContainer = document.createElement('div');
        videoContainer.style.cssText = `
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background: #f0f0f0;
            border-radius: 8px;
        `;
        
        if (src) {
            const video = document.createElement('video');
            video.src = src;
            video.controls = true;
            video.style.cssText = `
                max-width: 100%;
                max-height: 100%;
                border-radius: 8px;
            `;
            videoContainer.appendChild(video);
        } else {
            const placeholder = document.createElement('div');
            placeholder.className = 'video-placeholder';
            placeholder.innerHTML = '点击上传视频';
            placeholder.style.cssText = `
                text-align: center;
                color: #666;
                padding: 20px;
            `;
            placeholder.addEventListener('click', () => {
                if (window.isEditMode) {
                    this.uploadVideo(videoContainer);
                }
            });
            videoContainer.appendChild(placeholder);
        }
        
        sticker.content.appendChild(videoContainer);
        
        return sticker;
    }
    
    createSticker(type) {
        const sticker = {
            id: `sticker-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type: type,
            element: null,
            content: null,
            parentBlock: null,
            x: window.innerWidth / 2 - 100,
            y: window.innerHeight / 2 - 80,
            width: 200,
            height: 160
        };
        
        const element = document.createElement('div');
        element.className = 'sticker';
        element.dataset.stickerId = sticker.id;
        element.style.cssText = `
            position: absolute;
            left: ${sticker.x}px;
            top: ${sticker.y}px;
            width: ${sticker.width}px;
            min-height: ${sticker.height}px;
            background: rgba(255, 255, 255, 0.85);
            backdrop-filter: blur(10px);
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
            padding: 1rem;
            z-index: 100;
            resize: both;
            overflow: hidden;
            pointer-events: all;
        `;
        
        // 头部（删除按钮）
        const header = document.createElement('div');
        header.className = 'sticker-header';
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-sticker';
        deleteBtn.innerHTML = '×';
        deleteBtn.style.cssText = `
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: none;
            background: #ff6b6b;
            color: white;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 16px;
        `;
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.deleteSticker(sticker);
        });
        
        header.appendChild(deleteBtn);
        
        // 内容区域
        const content = document.createElement('div');
        content.className = 'sticker-content';
        content.style.cssText = `
            width: 100%;
            height: calc(100% - 30px);
            overflow: hidden;
        `;
        
        element.appendChild(header);
        element.appendChild(content);
        
        // 添加到页面
        document.body.appendChild(element);
        
        sticker.element = element;
        sticker.content = content;
        
        // 初始化拖拽
        this.initDraggable(sticker);
        
        // 初始化缩放
        this.initResizable(sticker);
        
        // 添加到数组
        this.stickers.push(sticker);
        
        // 寻找父区块
        this.findParentBlock(sticker);
        
        return sticker;
    }
    
    initDraggable(sticker) {
        const element = sticker.element;
        const header = element.querySelector('.sticker-header');
        
        let offsetX, offsetY;
        
        const onMouseDown = (e) => {
            if (!window.isEditMode) return;
            
            // 如果点击的是删除按钮，不拖拽
            if (e.target.closest('.delete-sticker')) return;
            
            this.isDragging = true;
            element.classList.add('dragging');
            
            const rect = element.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;
            
            e.preventDefault();
        };
        
        const onMouseMove = (e) => {
            if (!this.isDragging) return;
            
            sticker.x = e.clientX - offsetX;
            sticker.y = e.clientY - offsetY;
            
            element.style.left = `${sticker.x}px`;
            element.style.top = `${sticker.y}px`;
            
            // 检查是否应该吸附到区块
            this.checkBlockAttachment(sticker);
        };
        
        const onMouseUp = () => {
            if (this.isDragging) {
                this.isDragging = false;
                element.classList.remove('dragging');
                
                // 保存位置
                this.saveStickerPosition(sticker);
            }
        };
        
        // 监听整个元素的mousedown事件
        element.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    initResizable(sticker) {
        const element = sticker.element;
        
        let isResizing = false;
        let startX, startY, startWidth, startHeight;
        
        const onMouseDown = (e) => {
            if (!window.isEditMode) return;
            
            // 检查是否在右下角调整区域
            const rect = element.getBoundingClientRect();
            const isInResizeArea = 
                e.clientX > rect.right - 20 && 
                e.clientY > rect.bottom - 20;
            
            if (isInResizeArea) {
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = sticker.width;
                startHeight = sticker.height;
                
                e.preventDefault();
            }
        };
        
        const onMouseMove = (e) => {
            if (!isResizing) return;
            
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            // 保持最小尺寸
            const newWidth = Math.max(100, startWidth + deltaX);
            const newHeight = Math.max(80, startHeight + deltaY);
            
            sticker.width = newWidth;
            sticker.height = newHeight;
            
            element.style.width = `${newWidth}px`;
            element.style.minHeight = `${newHeight}px`;
        };
        
        const onMouseUp = () => {
            if (isResizing) {
                isResizing = false;
                this.saveStickerSize(sticker);
            }
        };
        
        element.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    checkBlockAttachment(sticker) {
        const blocks = document.querySelectorAll('.content-block');
        let maxOverlap = 0;
        let parentBlock = null;
        
        blocks.forEach(block => {
            const blockRect = block.getBoundingClientRect();
            const stickerRect = sticker.element.getBoundingClientRect();
            
            // 计算重叠面积
            const overlapX = Math.max(0, Math.min(stickerRect.right, blockRect.right) - Math.max(stickerRect.left, blockRect.left));
            const overlapY = Math.max(0, Math.min(stickerRect.bottom, blockRect.bottom) - Math.max(stickerRect.top, blockRect.top));
            const overlapArea = overlapX * overlapY;
            
            if (overlapArea > maxOverlap && overlapArea > 1000) {
                maxOverlap = overlapArea;
                parentBlock = block;
            }
        });
        
        if (parentBlock && parentBlock !== sticker.parentBlock) {
            // 建立关联
            sticker.parentBlock = parentBlock;
            sticker.element.style.zIndex = '10';
        } else if (maxOverlap === 0) {
            // 脱离区块
            sticker.parentBlock = null;
            sticker.element.style.zIndex = '100';
        }
    }
    
    makeEditable(sticker, element) {
        element.addEventListener('focus', () => {
            this.currentSticker = sticker;
        });
        
        element.addEventListener('blur', () => {
            this.saveStickerContent(sticker);
        });
    }
    
    addLinkButton(sticker, imgContainer) {
        if (!window.isEditMode) return;
        
        const linkBtn = document.createElement('button');
        linkBtn.className = 'sticker-link-btn';
        linkBtn.innerHTML = '🔗';
        linkBtn.style.cssText = `
            position: absolute;
            top: 10px;
            right: 40px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: none;
            background: rgba(255, 255, 255, 0.9);
            cursor: pointer;
            display: none;
            z-index: 101;
        `;
        
        sticker.element.addEventListener('mouseenter', () => {
            if (window.isEditMode) {
                linkBtn.style.display = 'block';
            }
        });
        
        sticker.element.addEventListener('mouseleave', () => {
            linkBtn.style.display = 'none';
        });
        
        linkBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.addLinkToImage(sticker, imgContainer);
        });
        
        sticker.element.querySelector('.sticker-header').appendChild(linkBtn);
    }
    
    addLinkToImage(sticker, imgContainer) {
        const url = prompt('请输入图片链接地址：');
        if (url) {
            const img = imgContainer.querySelector('img');
            if (img) {
                imgContainer.innerHTML = `
                    <a href="${url}" target="_blank" style="display:block;width:100%;height:100%;">
                        <img src="${img.src}" alt="${img.alt}" style="width:100%;height:100%;object-fit:contain;">
                    </a>
                `;
                this.saveStickerContent(sticker);
            }
        }
    }
    
    uploadImage(img) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    img.src = e.target.result;
                    
                    // 保存到本地存储
                    this.saveImageToLocalStorage(file.name, e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
        
        input.click();
    }
    
    uploadVideo(videoContainer) {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                videoContainer.innerHTML = `
                    <video src="${url}" controls style="max-width:100%;max-height:100%;border-radius:8px;"></video>
                `;
            }
        });
        
        input.click();
    }
    
    deleteSticker(sticker) {
        if (confirm('确定要删除这个贴纸吗？')) {
            sticker.element.remove();
            this.stickers = this.stickers.filter(s => s.id !== sticker.id);
            this.saveStickers();
        }
    }
    
    saveStickerPosition(sticker) {
        const positions = JSON.parse(localStorage.getItem('sticker_positions') || '{}');
        positions[sticker.id] = { x: sticker.x, y: sticker.y };
        localStorage.setItem('sticker_positions', JSON.stringify(positions));
    }
    
    saveStickerSize(sticker) {
        const sizes = JSON.parse(localStorage.getItem('sticker_sizes') || '{}');
        sizes[sticker.id] = { width: sticker.width, height: sticker.height };
        localStorage.setItem('sticker_sizes', JSON.stringify(sizes));
    }
    
    saveStickerContent(sticker) {
        const contents = JSON.parse(localStorage.getItem('sticker_contents') || '{}');
        contents[sticker.id] = sticker.content.innerHTML;
        localStorage.setItem('sticker_contents', JSON.stringify(contents));
    }
    
    saveImageToLocalStorage(filename, data) {
        const images = JSON.parse(localStorage.getItem('uploaded_images') || '{}');
        images[filename] = data;
        localStorage.setItem('uploaded_images', JSON.stringify(images));
    }
    
    saveStickers() {
        const stickersData = this.stickers.map(sticker => ({
            id: sticker.id,
            type: sticker.type,
            x: sticker.x,
            y: sticker.y,
            width: sticker.width,
            height: sticker.height,
            content: sticker.content.innerHTML,
            parentBlockId: sticker.parentBlock ? sticker.parentBlock.dataset.blockId : null
        }));
        
        localStorage.setItem('stickers', JSON.stringify(stickersData));
    }
    
    loadStickers() {
        try {
            const savedStickers = localStorage.getItem('stickers');
            if (savedStickers) {
                const stickersData = JSON.parse(savedStickers);
                
                stickersData.forEach(data => {
                    let sticker;
                    
                    switch(data.type) {
                        case 'text':
                            sticker = this.addTextSticker();
                            break;
                        case 'image':
                            sticker = this.addImageSticker();
                            break;
                        case 'video':
                            sticker = this.addVideoSticker();
                            break;
                        default:
                            return;
                    }
                    
                    if (sticker) {
                        // 恢复属性
                        sticker.x = data.x || sticker.x;
                        sticker.y = data.y || sticker.y;
                        sticker.width = data.width || sticker.width;
                        sticker.height = data.height || sticker.height;
                        
                        // 更新样式
                        sticker.element.style.left = `${sticker.x}px`;
                        sticker.element.style.top = `${sticker.y}px`;
                        sticker.element.style.width = `${sticker.width}px`;
                        sticker.element.style.minHeight = `${sticker.height}px`;
                        
                        // 恢复内容
                        if (data.content) {
                            sticker.content.innerHTML = data.content;
                        }
                        
                        // 恢复父区块
                        if (data.parentBlockId) {
                            const parentBlock = document.querySelector(`[data-block-id="${data.parentBlockId}"]`);
                            if (parentBlock) {
                                sticker.parentBlock = parentBlock;
                                sticker.element.style.zIndex = '10';
                            }
                        }
                    }
                });
            }
        } catch (e) {
            console.error('加载贴纸失败:', e);
        }
    }
}

// 初始化贴纸管理器
document.addEventListener('DOMContentLoaded', () => {
    window.stickersManager = new StickersManager();
});