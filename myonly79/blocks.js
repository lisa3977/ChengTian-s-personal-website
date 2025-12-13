/**
 * 个人博客可视化编辑展示平台 - 项目块管理模块
 * 专门处理项目块的核心功能：创建、排序、删除、调整高度、修改背景色等
 */

// 项目块管理模块
const BlocksManager = {
    // 初始化项目块
    initBlocks: function() {
        // 清空现有项目块（除了首页）
        const existingBlocks = DOM.blocksContainer.querySelectorAll('.content-block:not(#block-home)');
        existingBlocks.forEach(block => block.remove());
        
        // 添加保存的项目块
        AppState.blocks.forEach(block => {
            if (block.id !== 'home') {
                this.createBlockElement(block);
            }
        });
        
        // 更新排序面板
        this.updateSortingPanel();
    },
    
    // 创建项目块元素
    createBlockElement: function(blockData) {
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
        this.initBlockEvents(newBlock, blockData);
        
        return newBlock;
    },
    
    // 初始化项目块事件
    initBlockEvents: function(blockElement, blockData) {
        // 标题编辑
        const titleElement = blockElement.querySelector('.block-title');
        titleElement.addEventListener('blur', () => {
            blockData.title = titleElement.textContent;
            updateMenuBar();
            saveData();
        });
        
        // 颜色按钮
        const colorBtn = blockElement.querySelector('.color-btn');
        colorBtn.addEventListener('click', () => {
            this.showColorPanel(blockData);
        });
        
        // 删除按钮
        const deleteBtn = blockElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            this.showDeleteConfirm(blockData);
        });
        
        // 调整高度手柄
        const resizeHandle = blockElement.querySelector('.block-resize-handle');
        if (resizeHandle) {
            this.initResizeHandle(resizeHandle, blockData);
        }
        
        // 鼠标悬停显示控件
        blockElement.addEventListener('mouseenter', () => {
            if (AppState.isEditMode) {
                blockElement.querySelector('.block-controls').classList.remove('hidden');
                if (resizeHandle) {
                    resizeHandle.classList.remove('hidden');
                }
            }
        });
        
        blockElement.addEventListener('mouseleave', () => {
            if (AppState.isEditMode) {
                // 延迟隐藏，避免影响按钮点击
                setTimeout(() => {
                    const controls = blockElement.querySelector('.block-controls');
                    if (!blockElement.matches(':hover') && !controls.matches(':hover')) {
                        controls.classList.add('hidden');
                    }
                }, 300);
            }
        });
    },
    
    // 显示颜色面板
    showColorPanel: function(blockData) {
        if (!AppState.isEditMode) return;
        
        // 创建颜色面板
        const colorPanel = document.createElement('div');
        colorPanel.className = 'color-panel-popup';
        colorPanel.innerHTML = `
            <div class="color-panel-header">
                <h3>选择背景色</h3>
                <button class="close-btn"><i class="fas fa-times"></i></button>
            </div>
            <div class="color-grid">
                <!-- 莫兰迪色系 -->
                <div class="color-option" data-color="#f8f9fa" style="background-color: #f8f9fa;"></div>
                <div class="color-option" data-color="#e9ecef" style="background-color: #e9ecef;"></div>
                <div class="color-option" data-color="#dee2e6" style="background-color: #dee2e6;"></div>
                <div class="color-option" data-color="#ced4da" style="background-color: #ced4da;"></div>
                <div class="color-option" data-color="#adb5bd" style="background-color: #adb5bd;"></div>
                <div class="color-option" data-color="#6c757d" style="background-color: #6c757d;"></div>
                <div class="color-option" data-color="#495057" style="background-color: #495057;"></div>
                <div class="color-option" data-color="#343a40" style="background-color: #343a40;"></div>
                <div class="color-option" data-color="#212529" style="background-color: #212529;"></div>
                <!-- 莫兰迪彩色系 -->
                <div class="color-option" data-color="#e3f2fd" style="background-color: #e3f2fd;"></div>
                <div class="color-option" data-color="#f3e5f5" style="background-color: #f3e5f5;"></div>
                <div class="color-option" data-color="#e8f5e8" style="background-color: #e8f5e8;"></div>
                <!-- 纯黑和纯白 -->
                <div class="color-option" data-color="#ffffff" style="background-color: #ffffff; border: 1px solid #ddd;"></div>
                <div class="color-option" data-color="#000000" style="background-color: #000000;"></div>
            </div>
        `;
        
        // 定位到颜色按钮
        const colorBtn = document.querySelector(`#block-${blockData.id} .color-btn`);
        const rect = colorBtn.getBoundingClientRect();
        colorPanel.style.position = 'fixed';
        colorPanel.style.top = `${rect.bottom + 5}px`;
        colorPanel.style.left = `${rect.left}px`;
        colorPanel.style.zIndex = '10000';
        
        document.body.appendChild(colorPanel);
        
        // 颜色选择事件
        colorPanel.querySelectorAll('.color-option').forEach(option => {
            option.addEventListener('click', () => {
                const color = option.dataset.color;
                this.changeBlockColor(blockData, color);
                document.body.removeChild(colorPanel);
            });
        });
        
        // 关闭按钮
        colorPanel.querySelector('.close-btn').addEventListener('click', () => {
            document.body.removeChild(colorPanel);
        });
        
        // 点击其他地方关闭
        setTimeout(() => {
            const closeHandler = (e) => {
                if (!colorPanel.contains(e.target) && e.target !== colorBtn) {
                    document.body.removeChild(colorPanel);
                    document.removeEventListener('click', closeHandler);
                }
            };
            document.addEventListener('click', closeHandler);
        }, 10);
    },
    
    // 修改项目块颜色
    changeBlockColor: function(blockData, color) {
        blockData.color = color;
        
        // 更新DOM
        const blockElement = document.getElementById(`block-${blockData.id}`);
        if (blockElement) {
            const contentElement = blockElement.querySelector('.block-content');
            contentElement.style.backgroundColor = color;
        }
        
        saveData();
        showNotification('背景色已修改');
    },
    
    // 显示删除确认
    showDeleteConfirm: function(blockData) {
        if (blockData.id === 'home') {
            showNotification('首页不能删除', 'error');
            return;
        }
        
        if (!AppState.isEditMode) return;
        
        // 创建确认对话框
        const confirmDialog = document.createElement('div');
        confirmDialog.className = 'confirm-dialog';
        confirmDialog.innerHTML = `
            <div class="confirm-content">
                <h3>确认删除</h3>
                <p>确定要删除项目块"${blockData.title}"吗？</p>
                <p class="warning">注意：删除项目块将同时删除所有关联的粘贴框！</p>
                <div class="confirm-buttons">
                    <button class="confirm-btn delete">删除</button>
                    <button class="confirm-btn cancel">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(confirmDialog);
        
        // 按钮事件
        confirmDialog.querySelector('.delete').addEventListener('click', () => {
            this.deleteBlock(blockData);
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
    
    // 删除项目块
    deleteBlock: function(blockData) {
        // 从数组中移除
        const index = AppState.blocks.findIndex(b => b.id === blockData.id);
        if (index !== -1) {
            AppState.blocks.splice(index, 1);
        }
        
        // 删除关联的粘贴框
        const associatedStickers = AppState.stickers.filter(s => s.parentBlockId === blockData.id);
        associatedStickers.forEach(sticker => {
            const stickerElement = document.getElementById(sticker.id);
            if (stickerElement) {
                stickerElement.remove();
            }
        });
        
        // 从粘贴框数组中移除
        AppState.stickers = AppState.stickers.filter(s => s.parentBlockId !== blockData.id);
        
        // 从DOM中移除
        const blockElement = document.getElementById(`block-${blockData.id}`);
        if (blockElement) {
            blockElement.remove();
        }
        
        // 更新排序面板和菜单栏
        this.updateSortingPanel();
        updateMenuBar();
        
        // 保存数据
        saveData();
        showNotification('项目块已删除');
    },
    
    // 初始化调整高度手柄
    initResizeHandle: function(handle, blockData) {
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
    },
    
    // 更新排序面板
    updateSortingPanel: function() {
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
            li.addEventListener('dragstart', this.handleDragStart);
            li.addEventListener('dragover', this.handleDragOver);
            li.addEventListener('drop', this.handleDrop);
            li.addEventListener('dragend', this.handleDragEnd);
            
            DOM.blockSortList.appendChild(li);
        });
    },
    
    // 拖拽排序相关函数
    handleDragStart: function(e) {
        e.dataTransfer.setData('text/plain', e.target.dataset.blockId);
        e.target.classList.add('dragging');
    },
    
    handleDragOver: function(e) {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        const afterElement = this.getDragAfterElement(DOM.blockSortList, e.clientY);
        
        if (afterElement == null) {
            DOM.blockSortList.appendChild(draggingItem);
        } else {
            DOM.blockSortList.insertBefore(draggingItem, afterElement);
        }
    },
    
    handleDrop: function(e) {
        e.preventDefault();
    },
    
    handleDragEnd: function(e) {
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
        this.reorderBlocks();
        updateMenuBar();
        saveData();
    },
    
    getDragAfterElement: function(container, y) {
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
    },
    
    // 重新排序项目块
    reorderBlocks: function() {
        // 按照order排序
        const sortedBlocks = [...AppState.blocks].sort((a, b) => a.order - b.order);
        
        // 重新排列DOM元素
        sortedBlocks.forEach(block => {
            const blockElement = document.getElementById(`block-${block.id}`);
            if (blockElement) {
                DOM.blocksContainer.appendChild(blockElement);
            }
        });
    },
    
    // 添加新项目块
    addNewBlock: function() {
        if (!AppState.isEditMode) {
            showNotification('请在编辑模式下添加项目块', 'error');
            return;
        }
        
        const blockId = `block_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const blockData = {
            id: blockId,
            title: '新项目块',
            color: '#f8f9fa',
            order: AppState.blocks.length,
            height: 400
        };
        
        AppState.blocks.push(blockData);
        this.createBlockElement(blockData);
        this.updateSortingPanel();
        updateMenuBar();
        saveData();
        
        showNotification('新项目块已添加');
        
        return blockData;
    },
    
    // 获取项目块数据
    getBlockData: function(blockId) {
        return AppState.blocks.find(b => b.id === blockId);
    },
    
    // 更新项目块数据
    updateBlockData: function(blockId, updates) {
        const block = this.getBlockData(blockId);
        if (block) {
            Object.assign(block, updates);
            saveData();
            return true;
        }
        return false;
    }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlocksManager;
}
