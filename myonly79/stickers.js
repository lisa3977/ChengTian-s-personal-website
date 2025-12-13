/**
 * 个人博客可视化编辑展示平台 - 粘贴框管理模块
 * 专门处理粘贴框的核心功能：创建、拖拽、删除、上传图片/视频、文本编辑等
 */

// 粘贴框管理模块
const StickersManager = {
    // 创建粘贴框
    createSticker: function(type) {
        if (!AppState.isEditMode) {
            showNotification('请在编辑模式下添加粘贴框', 'error');
            return null;
        }
        
        const stickerId = `sticker_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const stickerData = {
            id: stickerId,
            type: type,
            content: '',
            position: { x: 100, y: 100 },
            size: { width: 300, height: 200 },
            parentBlockId: null,
            zIndex: 1000,
            link: null, // 超链接
            styles: {} // 文本样式
        };
        
        AppState.stickers.push(stickerData);
        this.createStickerElement(stickerData);
        saveData();
        
        showNotification(`${this.getStickerTypeName(type)}已创建`);
        
        return stickerData;
    },
    
    // 获取粘贴框类型名称
    getStickerTypeName: function(type) {
        const typeNames = {
            'text': '文本框',
            'image': '图片框',
            'video': '视频框'
        };
        return typeNames[type] || '粘贴框';
    },
    
    // 创建粘贴框元素
    createStickerElement: function(stickerData) {
        let stickerHTML = '';
        
        switch (stickerData.type) {
            case 'text':
                stickerHTML = this.createTextStickerHTML(stickerData);
                break;
                
            case 'image':
                stickerHTML = this.createImageStickerHTML(stickerData);
                break;
                
            case 'video':
                stickerHTML = this.createVideoStickerHTML(stickerData);
                break;
        }
        
        DOM.stickersContainer.insertAdjacentHTML('beforeend', stickerHTML);
        
        // 添加事件监听器
        const stickerElement = document.getElementById(stickerData.id);
        this.initStickerEvents(stickerElement, stickerData);
        
        return stickerElement;
    },
    
    // 创建文本框HTML
    createTextStickerHTML: function(stickerData) {
        return `
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
                    ${stickerData.content || '点击这里输入文本...'}
                </div>
            </div>
        `;
    },
    
    // 创建图片框HTML
    createImageStickerHTML: function(stickerData) {
        const content = stickerData.content 
            ? `<img src="${stickerData.content}" alt="图片" style="width: 100%; height: 100%; object-fit: cover;">`
            : `
                <div class="image-placeholder">
                    <i class="fas fa-image"></i>
                    <p>点击添加图片</p>
                </div>
            `;
        
        return `
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
                    ${content}
                </div>
            </div>
        `;
    },
    
    // 创建视频框HTML
    createVideoStickerHTML: function(stickerData) {
        const content = stickerData.content 
            ? `
                <video controls style="width: 100%; height: 100%;">
                    <source src="${stickerData.content}" type="video/mp4">
                    您的浏览器不支持视频标签。
                </video>
            `
            : `
                <div class="video-placeholder">
                    <i class="fas fa-video"></i>
                    <p>点击添加视频</p>
                </div>
            `;
        
        return `
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
                    ${content}
                </div>
            </div>
        `;
    },
    
    // 初始化粘贴框事件
    initStickerEvents: function(stickerElement, stickerData) {
        // 删除按钮
        const deleteBtn = stickerElement.querySelector('.sticker-delete-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => {
                this.deleteSticker(stickerData.id);
            });
        }
        
        // 拖拽功能
        if (AppState.isEditMode) {
            this.initDraggableSticker(stickerElement, stickerData);
        }
        
        // 根据类型初始化特定事件
        switch (stickerData.type) {
            case 'text':
                this.initTextStickerEvents(stickerElement, stickerData);
                break;
                
            case 'image':
                this.initImageStickerEvents(stickerElement, stickerData);
                break;
                
            case 'video':
                this.initVideoStickerEvents(stickerElement, stickerData);
                break;
        }
    },
    
    // 初始化文本框事件
    initTextStickerEvents: function(stickerElement, stickerData) {
        const contentElement = stickerElement.querySelector('.sticker-content');
        
        // 聚焦时显示文本工具栏
        contentElement.addEventListener('focus', () => {
            if (AppState.isEditMode) {
                EditorUI.showTextToolbar(contentElement, stickerData);
            }
        });
        
        // 失去焦点时保存内容
        contentElement.addEventListener('blur', () => {
            stickerData.content = contentElement.innerHTML;
            saveData();
        });
        
        // 文本选择事件
        contentElement.addEventListener('select', () => {
            if (AppState.isEditMode) {
                const selection = window.getSelection();
                if (selection.toString().length > 0) {
                    EditorUI.showTextToolbar(contentElement, stickerData);
                }
            }
        });
        
        // 右键菜单
        contentElement.addEventListener('contextmenu', (e) => {
            if (AppState.isEditMode) {
                e.preventDefault();
                EditorUI.showTextContextMenu(e, contentElement, stickerData);
            }
        });
    },
    
    // 初始化图片框事件
    initImageStickerEvents: function(stickerElement, stickerData) {
        const contentElement = stickerElement.querySelector('.sticker-content');
        
        // 点击添加图片
        if (!stickerData.content) {
            const placeholder = contentElement.querySelector('.image-placeholder');
            if (placeholder) {
                placeholder.addEventListener('click', () => {
                    if (AppState.isEditMode) {
                        this.triggerImageUpload(stickerData.id);
                    }
                });
            }
        } else {
            // 已有图片的点击事件
            const img = contentElement.querySelector('img');
            if (img) {
                img.addEventListener('click', (e) => {
                    if (stickerData.link && !AppState.isEditMode) {
                        // 预览模式下点击带链接的图片跳转
                        window.open(stickerData.link, '_blank');
                    } else if (AppState.isEditMode) {
                        // 编辑模式下显示图片工具栏
                        EditorUI.showImageToolbar(stickerElement, stickerData);
                    }
                });
                
                // 编辑模式下右键菜单
                if (AppState.isEditMode) {
                    img.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        EditorUI.showImageContextMenu(e, stickerElement, stickerData);
                    });
                }
            }
        }
    },
    
    // 初始化视频框事件
    initVideoStickerEvents: function(stickerElement, stickerData) {
        const contentElement = stickerElement.querySelector('.sticker-content');
        
        // 点击添加视频
        if (!stickerData.content) {
            const placeholder = contentElement.querySelector('.video-placeholder');
            if (placeholder) {
                placeholder.addEventListener('click', () => {
                    if (AppState.isEditMode) {
                        this.triggerVideoUpload(stickerData.id);
                    }
                });
            }
        } else {
            // 已有视频的点击事件
            const video = contentElement.querySelector('video');
            if (video) {
                // 编辑模式下右键菜单
                if (AppState.isEditMode) {
                    video.addEventListener('contextmenu', (e) => {
                        e.preventDefault();
                        EditorUI.showVideoContextMenu(e, stickerElement, stickerData);
                    });
                }
            }
        }
    },
    
    // 初始化可拖拽粘贴框
    initDraggableSticker: function(stickerElement, stickerData) {
        let isDragging = false;
        let startX, startY, initialX, initialY;
        
        stickerElement.style.cursor = 'move';
        
        stickerElement.addEventListener('mousedown', startDrag);
        
        function startDrag(e) {
            if (!AppState.isEditMode) return;
            if (e.target.closest('.sticker-delete-btn')) return;
            if (e.target.closest('.sticker-content[contenteditable="true"]')) return;
            
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
            
            const newX = Math.max(0, Math.min(window.innerWidth - stickerData.size.width, initialX + dx));
            const newY = Math.max(0, Math.min(window.innerHeight - stickerData.size.height, initialY + dy));
            
            stickerData.position.x = newX;
            stickerData.position.y = newY;
            
            stickerElement.style.left = `${newX}px`;
            stickerElement.style.top = `${newY}px`;
            
            // 检测与项目块的接触
            this.detectBlockCollision(stickerElement, stickerData);
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
        
        // 绑定this
        doDrag = doDrag.bind(this);
    },
    
    // 检测粘贴框与项目块的碰撞
    detectBlockCollision: function(stickerElement, stickerData) {
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
            
            // 视觉反馈
            stickerElement.classList.add('attached');
            setTimeout(() => {
                stickerElement.classList.remove('attached');
            }, 500);
        } else {
            stickerData.parentBlockId = null;
            stickerElement.classList.remove('attached');
        }
    },
    
    // 删除粘贴框
    deleteSticker: function(stickerId) {
        if (!AppState.isEditMode) return;
        
        // 创建确认对话框
        const confirmDialog = document.createElement('div');
        confirmDialog.className = 'confirm-dialog';
        confirmDialog.innerHTML = `
            <div class="confirm-content">
                <h3>确认删除</h3>
                <p>确定要删除这个粘贴框吗？</p>
                <div class="confirm-buttons">
                    <button class="confirm-btn delete">删除</button>
                    <button class="confirm-btn cancel">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmDialog);
        
        // 按钮事件
        confirmDialog.querySelector('.delete').addEventListener('click', () => {
            this.performDeleteSticker(stickerId);
            document.body.removeChild(confirmDialog);
        });
        
        confirmDialog.querySelector('.cancel').addEventListener('click', () => {
            document.body.removeChild(confirmDialog);
        });
        
        // 点击背景关闭
        confirmDialog.addEventListener('click', (e) => {
            if (e.target === confirmDialog) {
                document.body.removeChild(confirmDialog);
            }
        });
    },
    
    // 执行删除粘贴框
    performDeleteSticker: function(stickerId) {
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
    },
    
    // 触发图片上传
    triggerImageUpload: function(stickerId) {
        // 创建文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.multiple = false;
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.uploadImage(file, stickerId);
            }
        });
        
        input.click();
    },
    
    // 上传图片
    uploadImage: function(file, stickerId) {
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
                    this.initImageStickerEvents(stickerElement, sticker);
                }
                
                saveData();
                showNotification('图片已上传');
            }
        };
        
        reader.readAsDataURL(file);
    },
    
    // 触发视频上传
    triggerVideoUpload: function(stickerId) {
        // 创建文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        input.multiple = false;
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                this.uploadVideo(file, stickerId);
            }
        });
        
        input.click();
    },
    
    // 上传视频
    uploadVideo: function(file, stickerId) {
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
                        <video controls style="width: 100%; height: 100%;">
                            <source src="${e.target.result}" type="${file.type}">
                            您的浏览器不支持视频标签。
                        </video>
                    `;
                    
                    // 重新初始化事件
                    this.initVideoStickerEvents(stickerElement, sticker);
                }
                
                saveData();
                showNotification('视频已上传');
            }
        };
        
        reader.readAsDataURL(file);
    },
    
    // 为粘贴框添加超链接
    addLinkToSticker: function(stickerId, linkUrl) {
        const sticker = AppState.stickers.find(s => s.id === stickerId);
        if (sticker) {
            sticker.link = linkUrl;
            
            // 更新DOM
            const stickerElement = document.getElementById(stickerId);
            if (stickerElement) {
                if (sticker.type === 'text') {
                    // 文本框的超链接样式
                    stickerElement.classList.add('has-link');
                } else if (sticker.type === 'image') {
                    // 图片框添加链接指示器
                    const img = stickerElement.querySelector('img');
                    if (img) {
                        img.style.cursor = 'pointer';
                        img.title = '点击打开链接';
                    }
                }
            }
            
            saveData();
            showNotification('超链接已添加');
            return true;
        }
        return false;
    },
    
    // 移除粘贴框的超链接
    removeLinkFromSticker: function(stickerId) {
        const sticker = AppState.stickers.find(s => s.id === stickerId);
        if (sticker) {
            sticker.link = null;
            
            // 更新DOM
            const stickerElement = document.getElementById(stickerId);
            if (stickerElement) {
                stickerElement.classList.remove('has-link');
                
                if (sticker.type === 'image') {
                    const img = stickerElement.querySelector('img');
                    if (img) {
                        img.style.cursor = 'default';
                        img.title = '';
                    }
                }
            }
            
            saveData();
            showNotification('超链接已移除');
            return true;
        }
        return false;
    },
    
    // 获取粘贴框数据
    getStickerData: function(stickerId) {
        return AppState.stickers.find(s => s.id === stickerId);
    },
    
    // 更新粘贴框数据
    updateStickerData: function(stickerId, updates) {
        const sticker = this.getStickerData(stickerId);
        if (sticker) {
            Object.assign(sticker, updates);
            saveData();
            return true;
        }
        return false;
    },
    
    // 调整粘贴框大小
    resizeSticker: function(stickerId, width, height) {
        const sticker = this.getStickerData(stickerId);
        if (sticker) {
            sticker.size.width = width;
            sticker.size.height = height;
            
            // 更新DOM
            const stickerElement = document.getElementById(stickerId);
            if (stickerElement) {
                stickerElement.style.width = `${width}px`;
                stickerElement.style.height = `${height}px`;
            }
            
            saveData();
            return true;
        }
        return false;
    },
    
    // 更新粘贴框位置
    updateStickerPosition: function(stickerId, x, y) {
        const sticker = this.getStickerData(stickerId);
        if (sticker) {
            sticker.position.x = x;
            sticker.position.y = y;
            
            // 更新DOM
            const stickerElement = document.getElementById(stickerId);
            if (stickerElement) {
                stickerElement.style.left = `${x}px`;
                stickerElement.style.top = `${y}px`;
            }
            
            saveData();
            return true;
        }
        return false;
    },
    
    // 获取所有粘贴框
    getAllStickers: function() {
        return AppState.stickers;
    },
    
    // 获取关联到指定项目块的粘贴框
    getStickersByBlockId: function(blockId) {
        return AppState.stickers.filter(s => s.parentBlockId === blockId);
    },
    
    // 清除所有粘贴框
    clearAllStickers: function() {
        if (!AppState.isEditMode) return false;
        
        if (confirm('确定要清除所有粘贴框吗？此操作不可撤销！')) {
            // 从DOM中移除所有粘贴框
            const stickers = DOM.stickersContainer.querySelectorAll('.sticker');
            stickers.forEach(sticker => sticker.remove());
            
            // 清空数组
            AppState.stickers = [];
            
            saveData();
            showNotification('所有粘贴框已清除');
            return true;
        }
        return false;
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StickersManager;
}
