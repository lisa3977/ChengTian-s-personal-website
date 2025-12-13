// 项目块管理系统
class BlocksManager {
    constructor() {
        this.blocks = [];
        this.currentDragBlock = null;
        this.insertionLine = null;
        this.init();
    }
    
    init() {
        this.loadBlocks();
        this.initSortPanel();
    }
    
    loadBlocks() {
        const blockElements = document.querySelectorAll('.content-block');
        this.blocks = Array.from(blockElements).map(block => ({
            id: block.dataset.blockId || `block-${Date.now()}`,
            element: block,
            title: this.getBlockTitle(block),
            color: this.getBlockColor(block)
        }));
        
        // 确保每个区块都有ID
        this.blocks.forEach(block => {
            if (block.element.dataset.blockId !== block.id) {
                block.element.dataset.blockId = block.id;
            }
        });
    }
    
    getBlockTitle(block) {
        const titleElement = block.querySelector('.block-title');
        if (titleElement) {
            // 移除颜色指示器文本
            const text = titleElement.textContent.trim();
            const indicator = titleElement.querySelector('.color-indicator');
            if (indicator) {
                return text.replace('▪', '').trim(); // 移除可能存在的指示器字符
            }
            return text;
        }
        return '未命名区块';
    }
    
    getBlockColor(block) {
        const indicator = block.querySelector('.color-indicator');
        if (indicator && indicator.style.background) {
            return indicator.style.background;
        }
        return this.getRandomColor();
    }
    
    getRandomColor() {
        const colors = [
            '#E8B4B8', '#A5C9CA', '#B5D5C5', '#F7DCB9',
            '#D0B8D8', '#F3B7A0', '#B8E1DD', '#8BA6B1'
        ];
        return colors[this.blocks.length % colors.length];
    }
    
    initSortPanel() {
        const sortPanel = document.getElementById('sort-panel');
        if (!sortPanel) return;
        
        // 创建插入指示线
        this.insertionLine = document.createElement('div');
        this.insertionLine.className = 'insertion-line';
        this.insertionLine.style.cssText = 'width: 100%; height: 3px; background: #E8B4B8; margin: 10px 0;';
        
        // 初始化排序列表
        this.updateBlockList();
        
        // 设置拖拽事件
        this.setupDragEvents();
    }
    
    updateBlockList() {
        const blockList = document.getElementById('block-list');
        if (!blockList) return;
        
        blockList.innerHTML = '';
        
        this.blocks.forEach(block => {
            const li = document.createElement('li');
            li.className = 'block-list-item';
            li.dataset.blockId = block.id;
            li.textContent = block.title;
            li.setAttribute('draggable', 'true');
            
            blockList.appendChild(li);
        });
    }
    
    setupDragEvents() {
        const blockList = document.getElementById('block-list');
        if (!blockList) return;
        
        // 为列表项添加拖拽事件
        blockList.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('block-list-item')) {
                e.target.classList.add('dragging');
                this.currentDragBlock = e.target;
                e.dataTransfer.setData('text/plain', e.target.dataset.blockId);
                e.dataTransfer.effectAllowed = 'move';
            }
        });
        
        blockList.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('block-list-item')) {
                e.target.classList.remove('dragging');
                this.currentDragBlock = null;
                
                // 移除所有插入线
                document.querySelectorAll('.insertion-line').forEach(line => {
                    line.remove();
                });
            }
        });
        
        blockList.addEventListener('dragover', (e) => {
            e.preventDefault();
            
            if (!this.currentDragBlock) return;
            
            const afterElement = this.getDragAfterElement(blockList, e.clientY);
            
            // 移除所有插入线
            document.querySelectorAll('.insertion-line').forEach(line => {
                line.remove();
            });
            
            if (afterElement) {
                blockList.insertBefore(this.insertionLine, afterElement);
            } else {
                blockList.appendChild(this.insertionLine);
            }
        });
        
        blockList.addEventListener('dragenter', (e) => {
            e.preventDefault();
        });
        
        blockList.addEventListener('dragleave', (e) => {
            if (!e.currentTarget.contains(e.relatedTarget)) {
                // 移除插入线
                this.insertionLine.remove();
            }
        });
        
        blockList.addEventListener('drop', (e) => {
            e.preventDefault();
            
            if (!this.currentDragBlock) return;
            
            const blockId = e.dataTransfer.getData('text/plain');
            const draggedItem = document.querySelector(`.block-list-item[data-block-id="${blockId}"]`);
            const afterElement = this.getDragAfterElement(blockList, e.clientY);
            
            // 移除插入线
            if (this.insertionLine.parentNode === blockList) {
                blockList.removeChild(this.insertionLine);
            }
            
            if (draggedItem) {
                // 重新排序
                if (afterElement) {
                    blockList.insertBefore(draggedItem, afterElement);
                } else {
                    blockList.appendChild(draggedItem);
                }
                
                // 更新主内容区顺序
                this.updateMainContentOrder();
            }
        });
    }
    
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.block-list-item:not(.dragging)')];
        
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
    
    updateMainContentOrder() {
        const blockList = document.getElementById('block-list');
        const blocksContainer = document.getElementById('blocks-container');
        
        if (!blockList || !blocksContainer) return;
        
        // 清空容器
        blocksContainer.innerHTML = '';
        
        // 按新顺序添加区块
        const items = blockList.querySelectorAll('.block-list-item');
        items.forEach(item => {
            const blockId = item.dataset.blockId;
            const block = document.querySelector(`.content-block[data-block-id="${blockId}"]`);
            if (block) {
                blocksContainer.appendChild(block);
            }
        });
        
        // 保存顺序
        this.saveBlockOrder();
        
        // 重新加载区块数据
        this.loadBlocks();
    }
    
    saveBlockOrder() {
        const order = Array.from(document.querySelectorAll('.block-list-item')).map(item => item.dataset.blockId);
        localStorage.setItem('block_order', JSON.stringify(order));
    }
    
    addNewBlock(title = '新项目块') {
        const blockId = `block-${Date.now()}`;
        const color = this.getRandomColor();
        
        const block = document.createElement('section');
        block.className = 'content-block';
        block.dataset.blockId = blockId;
        block.innerHTML = `
            <h2 class="block-title">
                <span class="color-indicator" style="background: ${color}"></span>
                ${title}
            </h2>
            <div class="block-content" contenteditable="true">
                <p>这里是新的内容区域。您可以编辑这段文字。</p>
            </div>
            <div class="resize-handle"></div>
            <button class="delete-block-btn">×</button>
        `;
        
        // 添加到容器
        const blocksContainer = document.getElementById('blocks-container');
        if (blocksContainer) {
            blocksContainer.appendChild(block);
            
            // 添加到数组
            this.blocks.push({
                id: blockId,
                element: block,
                title: title,
                color: color
            });
            
            // 更新排序面板
            this.updateBlockList();
            
            // 触发滚动动画
            setTimeout(() => {
                block.classList.add('visible');
            }, 100);
            
            // 初始化事件
            this.initBlockEvents(block);
            
            return block;
        }
        return null;
    }
    
    initBlockEvents(block) {
        // 调整手柄
        const resizeHandle = block.querySelector('.resize-handle');
        if (resizeHandle) {
            resizeHandle.addEventListener('mousedown', (e) => {
                this.startResizing(block, e);
            });
        }
        
        // 删除按钮
        const deleteBtn = block.querySelector('.delete-block-btn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('确定要删除这个项目块吗？')) {
                    this.deleteBlock(block);
                }
            });
        }
    }
    
    startResizing(block, e) {
        e.preventDefault();
        
        const handle = block.querySelector('.resize-handle');
        handle.classList.add('resizing');
        
        const startHeight = block.offsetHeight;
        const startY = e.clientY;
        
        const onMouseMove = (e) => {
            const deltaY = e.clientY - startY;
            const newHeight = Math.max(200, startHeight + deltaY);
            
            block.style.height = `${newHeight}px`;
        };
        
        const onMouseUp = () => {
            handle.classList.remove('resizing');
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            
            // 保存高度
            this.saveBlockHeight(block.dataset.blockId, block.offsetHeight);
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    saveBlockHeight(blockId, height) {
        const heights = JSON.parse(localStorage.getItem('block_heights') || '{}');
        heights[blockId] = height;
        localStorage.setItem('block_heights', JSON.stringify(heights));
    }
    
    deleteBlock(block) {
        const blockId = block.dataset.blockId;
        
        // 从数组中移除
        this.blocks = this.blocks.filter(b => b.id !== blockId);
        
        // 从DOM中移除
        block.remove();
        
        // 从排序面板中移除
        const listItem = document.querySelector(`.block-list-item[data-block-id="${blockId}"]`);
        if (listItem) listItem.remove();
        
        // 保存删除状态
        this.saveDeletedBlock(blockId);
        
        // 更新排序面板
        this.updateBlockList();
    }
    
    saveDeletedBlock(blockId) {
        const deleted = JSON.parse(localStorage.getItem('deleted_blocks') || '[]');
        if (!deleted.includes(blockId)) {
            deleted.push(blockId);
            localStorage.setItem('deleted_blocks', JSON.stringify(deleted));
        }
    }
}

// 初始化区块管理器
document.addEventListener('DOMContentLoaded', () => {
    window.blocksManager = new BlocksManager();
});