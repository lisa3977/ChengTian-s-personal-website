/**
 * 项目块管理系统
 * 处理项目块的拖拽排序、高度调整和删除功能
 */

class BlocksManager {
    constructor() {
        this.blocksContainer = document.getElementById('content-area');
        this.sortPanel = document.getElementById('sorting-panel');
        this.sortList = document.getElementById('block-list');
        this.isDragging = false;
        this.dragBlock = null;
        this.dragStartY = 0;
        this.dragOffsetY = 0;
        this.insertIndicator = null;
        this.resizeHandles = new Map();
        
        this.init();
    }
    
    init() {
        this.createInsertIndicator();
        this.setupEventListeners();
        this.updateSortPanel();
    }
    
    /**
     * 创建拖拽插入指示器
     */
    createInsertIndicator() {
        this.insertIndicator = document.createElement('div');
        this.insertIndicator.className = 'insert-indicator';
        this.insertIndicator.innerHTML = '<div class="indicator-line"></div><div class="indicator-arrow"></div>';
        document.body.appendChild(this.insertIndicator);
    }
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        // 项目块删除按钮
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('block-delete-btn')) {
                this.handleDeleteBlock(e.target.closest('.content-block'));
            }
        });
        
        // 高度调整手柄
        document.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('block-resize-handle')) {
                this.startResize(e.target.closest('.content-block'), e);
            }
        });
        
        // 拖拽排序
        this.setupDragSorting();
    }
    
    /**
     * 设置拖拽排序功能
     */
    setupDragSorting() {
        // 左侧面板中的项目块标题拖拽
        if (this.sortList) {
            this.sortList.addEventListener('mousedown', (e) => {
                const listItem = e.target.closest('li');
                if (!listItem || !listItem.dataset.blockId) return;
                
                this.startDragSort(listItem, e);
            });
        }
        
        // 鼠标移动事件
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging && this.dragBlock) {
                this.handleDragMove(e);
            }
        });
        
        // 鼠标释放事件
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.handleDragEnd();
            }
        });
    }
    
    /**
     * 开始拖拽排序
     */
    startDragSort(listItem, e) {
        this.isDragging = true;
        this.dragBlock = listItem;
        this.dragStartY = e.clientY;
        this.dragOffsetY = e.clientY - listItem.getBoundingClientRect().top;
        
        // 设置拖拽样式
        listItem.classList.add('dragging');
        listItem.style.opacity = '0.5';
        listItem.style.transform = 'scale(1.05)';
        listItem.style.zIndex = '1000';
        listItem.style.position = 'fixed';
        listItem.style.width = listItem.offsetWidth + 'px';
        listItem.style.left = listItem.getBoundingClientRect().left + 'px';
        listItem.style.top = (e.clientY - this.dragOffsetY) + 'px';
        
        // 显示插入指示器
        if (this.insertIndicator) {
            this.insertIndicator.style.display = 'block';
        }
    }
    
    /**
     * 处理拖拽移动
     */
    handleDragMove(e) {
        if (!this.dragBlock || !this.sortList) return;
        
        // 更新拖拽元素位置
        const y = e.clientY - this.dragOffsetY;
        this.dragBlock.style.top = y + 'px';
        
        // 查找插入位置
        const sortItems = Array.from(this.sortList.querySelectorAll('li'));
        const dragRect = this.dragBlock.getBoundingClientRect();
        const dragCenterY = dragRect.top + dragRect.height / 2;
        
        let insertIndex = -1;
        let insertBeforeElement = null;
        
        for (let i = 0; i < sortItems.length; i++) {
            const item = sortItems[i];
            if (item === this.dragBlock) continue;
            
            const itemRect = item.getBoundingClientRect();
            const itemCenterY = itemRect.top + itemRect.height / 2;
            
            if (dragCenterY < itemCenterY) {
                insertIndex = i;
                insertBeforeElement = item;
                break;
            }
        }
        
        // 更新插入指示器位置
        if (this.insertIndicator) {
            if (insertBeforeElement) {
                const targetRect = insertBeforeElement.getBoundingClientRect();
                this.insertIndicator.style.left = (targetRect.left - 20) + 'px';
                this.insertIndicator.style.top = (targetRect.top - 8) + 'px';
            } else {
                // 插入到最后
                const lastItem = sortItems[sortItems.length - 1];
                if (lastItem && lastItem !== this.dragBlock) {
                    const lastRect = lastItem.getBoundingClientRect();
                    this.insertIndicator.style.left = (lastRect.left - 20) + 'px';
                    this.insertIndicator.style.top = (lastRect.bottom - 8) + 'px';
                }
            }
        }
    }
    
    /**
     * 处理拖拽结束
     */
    handleDragEnd() {
        if (!this.dragBlock) return;
        
        this.isDragging = false;
        
        // 隐藏插入指示器
        if (this.insertIndicator) {
            this.insertIndicator.style.display = 'none';
        }
        
        // 获取新的排序顺序
        if (this.sortList) {
            const sortItems = Array.from(this.sortList.querySelectorAll('li'));
            const blockOrder = sortItems.map(item => item.dataset.blockId);
            
            // 更新主内容区顺序
            this.reorderContentBlocks(blockOrder);
        }
        
        // 重置拖拽元素样式
        this.dragBlock.classList.remove('dragging');
        this.dragBlock.style.cssText = '';
        this.dragBlock = null;
        
        // 保存到本地存储
        this.saveBlockOrder();
    }
    
    /**
     * 重新排序内容区块
     */
    reorderContentBlocks(blockOrder) {
        // 根据新的顺序重新排列内容区块
        if (this.blocksContainer) {
            blockOrder.forEach(blockId => {
                const block = document.getElementById(blockId);
                if (block) {
                    this.blocksContainer.appendChild(block);
                }
            });
        }
        
        // 同步更新导航栏标题顺序
        this.syncNavbarWithBlocks(blockOrder);
    }
    
    /**
     * 同步导航栏与项目块顺序
     */
    syncNavbarWithBlocks(blockOrder) {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;
        
        // 获取所有导航项（排除首页）
        const navItems = Array.from(navMenu.querySelectorAll('.nav-item'));
        const homeItem = navItems.find(item => item.querySelector('a[href="#home"]'));
        const otherItems = navItems.filter(item => item !== homeItem);
        
        // 清空导航菜单（除了首页）
        otherItems.forEach(item => item.remove());
        
        // 根据区块顺序重新添加导航项
        blockOrder.forEach(blockId => {
            const block = document.getElementById(blockId);
            if (!block) return;
            
            // 获取区块标题
            const blockTitle = block.querySelector('.block-title')?.textContent || '未命名';
            
            // 查找对应的导航项
            const originalNavItem = otherItems.find(item => {
                const link = item.querySelector('a');
                return link && link.getAttribute('href') === `#${blockId}`;
            });
            
            if (originalNavItem) {
                // 更新标题文本
                const link = originalNavItem.querySelector('a');
                if (link) {
                    link.textContent = blockTitle;
                }
                // 在首页后面添加
                if (homeItem) {
                    homeItem.parentNode.insertBefore(originalNavItem, homeItem.nextSibling);
                } else {
                    navMenu.appendChild(originalNavItem);
                }
            } else {
                // 创建新的导航项
                const newNavItem = document.createElement('li');
                newNavItem.className = 'nav-item';
                newNavItem.innerHTML = `<a href="#${blockId}">${blockTitle}</a>`;
                
                // 在首页后面添加
                if (homeItem) {
                    homeItem.parentNode.insertBefore(newNavItem, homeItem.nextSibling);
                } else {
                    navMenu.appendChild(newNavItem);
                }
                
                // 添加点击事件（平滑滚动）
                const link = newNavItem.querySelector('a');
                if (link) {
                    link.addEventListener('click', (e) => {
                        e.preventDefault();
                        const targetId = link.getAttribute('href');
                        if (targetId === '#') return;
                        
                        const targetElement = document.querySelector(targetId);
                        if (targetElement) {
                            window.scrollTo({
                                top: targetElement.offsetTop - 80,
                                behavior: 'smooth'
                            });
                        }
                    });
                }
            }
        });
        
        // 重新绑定悬停效果
        this.rebindNavHoverEffects();
    }
    
    /**
     * 重新绑定导航项悬停效果
     */
    rebindNavHoverEffects() {
        document.querySelectorAll('.nav-item').forEach(item => {
            // 移除现有的事件监听器（通过克隆来移除）
            const newItem = item.cloneNode(true);
            item.parentNode.replaceChild(newItem, item);
            
            // 添加新的悬停效果
            newItem.addEventListener('mouseenter', () => {
                newItem.style.transform = 'scale(1.1)';
                newItem.style.transition = 'transform 0.2s ease';
            });
            
            newItem.addEventListener('mouseleave', () => {
                newItem.style.transform = 'scale(1)';
            });
        });
    }
    
    /**
     * 开始调整高度
     */
    startResize(block, e) {
        e.preventDefault();
        
        const startHeight = block.offsetHeight;
        const startY = e.clientY;
        
        // 创建方向指示器
        const directionIndicator = document.createElement('div');
        directionIndicator.className = 'direction-indicator';
        directionIndicator.textContent = '↓';
        document.body.appendChild(directionIndicator);
        
        // 鼠标移动处理
        const handleMouseMove = (moveEvent) => {
            const deltaY = moveEvent.clientY - startY;
            const newHeight = Math.max(200, startHeight + deltaY); // 最小高度200px
            
            block.style.height = newHeight + 'px';
            
            // 更新方向指示器
            directionIndicator.textContent = deltaY > 0 ? '↓' : '↑';
            directionIndicator.style.left = (moveEvent.clientX + 10) + 'px';
            directionIndicator.style.top = (moveEvent.clientY + 10) + 'px';
        };
        
        // 鼠标释放处理
        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.removeChild(directionIndicator);
            
            // 保存高度到本地存储
            this.saveBlockHeight(block.id, block.offsetHeight);
        };
        
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }
    
    /**
     * 处理删除项目块
     */
    handleDeleteBlock(block) {
        if (!block) return;
        
        // 检查是否是自带的项目块（about, projects, skills, contact）
        const defaultBlocks = ['about', 'projects', 'skills', 'contact'];
        const isDefaultBlock = defaultBlocks.includes(block.id);
        
        // 显示确认对话框
        let confirmMessage = '确定要删除这个项目块吗？此操作不可撤销。';
        if (isDefaultBlock) {
            confirmMessage = '这是自带的项目块，确定要删除吗？删除后可以通过添加新项目块功能恢复。';
        }
        
        if (confirm(confirmMessage)) {
            // 从DOM中移除
            block.remove();
            
            // 从排序面板中移除
            if (this.sortList) {
                const sortItem = this.sortList.querySelector(`[data-block-id="${block.id}"]`);
                if (sortItem) {
                    sortItem.remove();
                }
            }
            
            // 从导航栏中移除对应的导航项
            this.removeNavItemForBlock(block.id);
            
            // 保存到本地存储
            this.saveDeletedBlock(block.id);
            
            // 如果所有项目块都被删除，显示提示
            if (this.blocksContainer && this.blocksContainer.children.length === 0) {
                const emptyMessage = document.createElement('div');
                emptyMessage.className = 'empty-message';
                emptyMessage.innerHTML = '<p>暂无项目块，点击右下角"+"按钮添加新项目块。</p>';
                this.blocksContainer.appendChild(emptyMessage);
            }
        }
    }
    
    /**
     * 从导航栏中移除项目块对应的导航项
     */
    removeNavItemForBlock(blockId) {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;
        
        // 查找对应的导航项
        const navItem = navMenu.querySelector(`.nav-item a[href="#${blockId}"]`)?.closest('.nav-item');
        if (navItem) {
            navItem.remove();
        }
    }
    
    /**
     * 添加新项目块
     */
    addNewBlock(title = '新项目块', content = '在这里添加你的项目内容...') {
        // 生成唯一ID
        const blockId = 'block-' + Date.now();
        
        // 创建项目块HTML - 使用正确的类名
        const blockHTML = `
            <div class="content-block" id="${blockId}">
                <div class="block-header">
                    <h3 class="block-title">${title}</h3>
                </div>
                <div class="block-content">
                    ${content}
                </div>
                <div class="block-resize-handle" title="调整高度"></div>
                <button class="block-delete-btn" aria-label="删除项目块">×</button>
            </div>
        `;
        
        // 添加到内容区域
        this.blocksContainer.insertAdjacentHTML('beforeend', blockHTML);
        
        // 更新排序面板
        this.updateSortPanel();
        
        // 同步更新导航栏
        this.addNavItemForBlock(blockId, title);
        
        // 保存到本地存储
        this.saveNewBlock(blockId, title, content);
        
        return blockId;
    }
    
    /**
     * 为项目块添加导航项
     */
    addNavItemForBlock(blockId, title) {
        const navMenu = document.querySelector('.nav-menu');
        if (!navMenu) return;
        
        // 创建新的导航项
        const newNavItem = document.createElement('li');
        newNavItem.className = 'nav-item';
        newNavItem.innerHTML = `<a href="#${blockId}">${title}</a>`;
        
        // 在首页后面添加（首页是第一个）
        const homeItem = navMenu.querySelector('.nav-item a[href="#home"]')?.closest('.nav-item');
        if (homeItem) {
            homeItem.parentNode.insertBefore(newNavItem, homeItem.nextSibling);
        } else {
            navMenu.appendChild(newNavItem);
        }
        
        // 添加点击事件（平滑滚动）
        const link = newNavItem.querySelector('a');
        if (link) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        }
        
        // 重新绑定悬停效果
        this.rebindNavHoverEffects();
    }
    
    /**
     * 更新排序面板
     */
    updateSortPanel() {
        // 清空当前列表
        if (this.sortList) {
            this.sortList.innerHTML = '';
            
            // 获取所有内容区块
            const blocks = this.blocksContainer ? 
                Array.from(this.blocksContainer.querySelectorAll('.content-block')) : [];
            
            // 为每个区块创建排序项
            blocks.forEach(block => {
                const title = block.querySelector('.block-title')?.textContent || '未命名项目块';
                const listItem = document.createElement('li');
                listItem.dataset.blockId = block.id;
                listItem.innerHTML = `
                    <span class="drag-handle">☰</span>
                    <span class="item-title">${title}</span>
                `;
                this.sortList.appendChild(listItem);
            });
            
            // 如果没有项目块，显示提示
            if (blocks.length === 0 && this.sortList) {
                const emptyItem = document.createElement('li');
                emptyItem.innerHTML = '<span class="empty-message">暂无项目块</span>';
                this.sortList.appendChild(emptyItem);
            }
        }
    }
    
    /**
     * 保存区块顺序到本地存储
     */
    saveBlockOrder() {
        const blocks = Array.from(this.blocksContainer.querySelectorAll('.content-block'));
        const blockOrder = blocks.map(block => block.id);
        localStorage.setItem('portfolio_block_order', JSON.stringify(blockOrder));
    }
    
    /**
     * 保存区块高度到本地存储
     */
    saveBlockHeight(blockId, height) {
        const heights = JSON.parse(localStorage.getItem('portfolio_block_heights') || '{}');
        heights[blockId] = height;
        localStorage.setItem('portfolio_block_heights', JSON.stringify(heights));
    }
    
    /**
     * 保存删除的区块到本地存储
     */
    saveDeletedBlock(blockId) {
        const deletedBlocks = JSON.parse(localStorage.getItem('portfolio_deleted_blocks') || '[]');
        deletedBlocks.push(blockId);
        localStorage.setItem('portfolio_deleted_blocks', JSON.stringify(deletedBlocks));
    }
    
    /**
     * 保存新区块到本地存储
     */
    saveNewBlock(blockId, title, content) {
        const newBlocks = JSON.parse(localStorage.getItem('portfolio_new_blocks') || '[]');
        newBlocks.push({ id: blockId, title, content });
        localStorage.setItem('portfolio_new_blocks', JSON.stringify(newBlocks));
    }
    
    /**
     * 从本地存储加载区块设置
     */
    loadFromStorage() {
        // 加载区块顺序
        const blockOrder = JSON.parse(localStorage.getItem('portfolio_block_order'));
        if (blockOrder) {
            this.reorderContentBlocks(blockOrder);
        }
        
        // 加载区块高度
        const heights = JSON.parse(localStorage.getItem('portfolio_block_heights') || '{}');
        Object.entries(heights).forEach(([blockId, height]) => {
            const block = document.getElementById(blockId);
            if (block) {
                block.style.height = height + 'px';
            }
        });
        
        // 更新排序面板
        this.updateSortPanel();
    }
}

// 导出BlocksManager类
window.BlocksManager = BlocksManager;
