// 主应用程序
class PortfolioApp {
    constructor() {
        this.isEditMode = false;
        this.currentSticker = null;
        this.selectedText = null;
        this.morandiColors = [
            '#E8B4B8', '#A5C9CA', '#B5D5C5', '#F7DCB9', '#D0B8D8', '#F3B7A0',
            '#E8A2A2', '#B8E1DD', '#D7C0AE', '#C4C4C4', '#8BA6B1', '#C8E6C9'
        ];
        this.colorIndicators = {};
        
        this.init();
    }
    
    init() {
        // 设置全局变量
        window.isEditMode = false;
        
        // 初始化装饰元素
        this.createDecorations();
        
        // 初始化导航栏交互
        this.initNavigation();
        
        // 初始化滚动动画
        this.initScrollAnimations();
        
        // 初始化三击事件监听
        this.initTripleClick();
        
        // 初始化编辑相关事件
        this.initEditEvents();
        
        // 加载保存的数据
        this.loadSavedData();
        
        // 检查是否在编辑模式
        this.checkEditMode();
    }
    
    createDecorations() {
        const container = document.getElementById('decoration-container');
        if (!container) return;
        
        const shapes = ['circle', 'square', 'triangle'];
        
        for (let i = 0; i < 60; i++) {
            const shape = document.createElement('div');
            const shapeType = shapes[Math.floor(Math.random() * shapes.length)];
            
            shape.className = `decoration-shape ${shapeType}`;
            
            // 随机大小
            const size = Math.floor(Math.random() * 90) + 30;
            
            // 随机位置
            const posX = Math.random() * 100;
            const posY = Math.random() * 100;
            
            // 随机颜色
            const color = this.morandiColors[Math.floor(Math.random() * this.morandiColors.length)];
            
            // 设置样式
            if (shapeType === 'triangle') {
                shape.style.cssText = `
                    position: absolute;
                    left: ${posX}%;
                    top: ${posY}%;
                    border-bottom-width: ${size}px;
                    border-left-width: ${size/2}px;
                    border-right-width: ${size/2}px;
                    border-bottom-color: ${color};
                    opacity: 0.15;
                    animation: float ${20 + Math.random() * 20}s infinite linear;
                    animation-delay: ${Math.random() * 5}s;
                `;
            } else {
                shape.style.cssText = `
                    position: absolute;
                    left: ${posX}%;
                    top: ${posY}%;
                    width: ${size}px;
                    height: ${size}px;
                    background: ${color};
                    opacity: 0.15;
                    animation: float ${20 + Math.random() * 20}s infinite linear;
                    animation-delay: ${Math.random() * 5}s;
                `;
            }
            
            container.appendChild(shape);
        }
    }
    
    initNavigation() {
        const nav = document.getElementById('main-nav');
        if (!nav) return;
        
        let lastScrollTop = 0;
        let isHidden = false;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > 100 && scrollTop > lastScrollTop && !isHidden) {
                // 向下滚动，隐藏导航栏
                nav.style.transform = 'translateY(-100%)';
                isHidden = true;
            } else if (scrollTop < lastScrollTop && isHidden) {
                // 向上滚动，显示导航栏
                nav.style.transform = 'translateY(0)';
                isHidden = false;
            }
            
            lastScrollTop = scrollTop;
            
            // 高亮当前导航项
            this.highlightNavItem();
        });
        
        // 平滑滚动
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = item.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
    
    highlightNavItem() {
        const sections = document.querySelectorAll('section[id]');
        const navItems = document.querySelectorAll('.nav-item');
        
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSection = section.id;
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${currentSection}`) {
                item.classList.add('active');
            }
        });
    }
    
    initScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        document.querySelectorAll('.content-block').forEach(block => {
            observer.observe(block);
        });
    }
    
    initTripleClick() {
        let clickCount = 0;
        let clickTimer;
        
        document.addEventListener('click', (e) => {
            // 忽略可交互元素
            if (e.target.closest('button, input, a, .sticker, .modal, .modal-content')) {
                return;
            }
            
            clickCount++;
            
            if (clickCount === 1) {
                clickTimer = setTimeout(() => {
                    clickCount = 0;
                }, 500);
            } else if (clickCount === 3) {
                clearTimeout(clickTimer);
                clickCount = 0;
                
                if (!this.isEditMode) {
                    this.showAuthModal();
                }
            }
        });
    }
    
    showAuthModal() {
        const modal = document.getElementById('auth-modal');
        modal.classList.remove('hidden');
        
        const passwordInput = document.getElementById('password-input');
        passwordInput.focus();
        
        // 回车键确认
        passwordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkPassword();
            }
        });
        
        // 忘记密码链接
        document.getElementById('forgot-password-link').onclick = (e) => {
            e.preventDefault();
            modal.classList.add('hidden');
            this.showSecurityModal();
        };
        
        // 确认按钮
        document.getElementById('confirm-password-btn').onclick = () => {
            this.checkPassword();
        };
    }
    
    showSecurityModal() {
        const modal = document.getElementById('security-modal');
        modal.classList.remove('hidden');
        
        const answerInput = document.getElementById('security-answer');
        answerInput.focus();
        
        // 确认答案
        document.getElementById('confirm-answer-btn').onclick = () => {
            const answer = answerInput.value.trim();
            const encryptedAnswer = this.encrypt('下巴上带着口罩');
            
            if (this.encrypt(answer) === encryptedAnswer) {
                alert('密码已重置为默认值 "password"');
                localStorage.setItem('portfolio_password', this.encrypt('password'));
                modal.classList.add('hidden');
                this.showAuthModal();
            } else {
                alert('答案错误！');
            }
        };
        
        // 取消
        document.getElementById('cancel-security-btn').onclick = () => {
            modal.classList.add('hidden');
            this.showAuthModal();
        };
    }
    
    encrypt(text) {
        // 简单的base64编码
        return btoa(unescape(encodeURIComponent(text)));
    }
    
    checkPassword() {
        const password = document.getElementById('password-input').value;
        const savedPassword = localStorage.getItem('portfolio_password') || this.encrypt('password');
        
        if (this.encrypt(password) === savedPassword) {
            this.enterEditMode();
            document.getElementById('auth-modal').classList.add('hidden');
        } else {
            alert('密码错误！');
        }
    }
    
    enterEditMode() {
        this.isEditMode = true;
        window.isEditMode = true;
        
        // 显示编辑UI
        document.getElementById('sort-panel').classList.remove('hidden');
        document.getElementById('editor-menu').classList.remove('hidden');
        
        // 使内容可编辑
        this.makeContentEditable();
        
        // 初始化颜色指示器
        this.initColorIndicators();
        
        // 保存编辑模式状态
        localStorage.setItem('edit_mode', 'true');
    }
    
    exitEditMode() {
        this.isEditMode = false;
        window.isEditMode = false;
        
        if (confirm('确定要退出编辑模式吗？所有更改将自动保存。')) {
            // 隐藏编辑UI
            document.getElementById('sort-panel').classList.add('hidden');
            document.getElementById('editor-menu').classList.add('hidden');
            document.getElementById('menu-options').classList.add('hidden');
            
            // 隐藏文本工具条
            const textToolbar = document.getElementById('text-toolbar');
            if (textToolbar) textToolbar.classList.add('hidden');
            
            // 使内容不可编辑
            this.makeContentNonEditable();
            
            // 保存所有内容
            this.saveAllContent();
            
            // 清除编辑模式状态
            localStorage.removeItem('edit_mode');
            
            // 刷新页面以应用更改
            window.location.reload();
        }
    }
    
    initEditEvents() {
        // 添加内容按钮
        document.getElementById('add-content-btn').addEventListener('click', () => {
            const menu = document.getElementById('menu-options');
            menu.classList.toggle('hidden');
        });
        
        // 功能菜单选项
        document.querySelectorAll('.menu-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                this.handleMenuAction(action);
                document.getElementById('menu-options').classList.add('hidden');
            });
        });
        
        // 退出编辑模式
        document.getElementById('exit-edit-btn').addEventListener('click', () => {
            this.exitEditMode();
        });
        
        // 关闭菜单当点击外部
        document.addEventListener('click', (e) => {
            const menu = document.getElementById('menu-options');
            const addBtn = document.getElementById('add-content-btn');
            
            if (!menu.classList.contains('hidden') && 
                !e.target.closest('#menu-options') && 
                !e.target.closest('#add-content-btn')) {
                menu.classList.add('hidden');
            }
        });
    }
    
    handleMenuAction(action) {
        switch(action) {
            case 'add-text':
                if (window.stickersManager) {
                    window.stickersManager.addTextSticker();
                }
                break;
            case 'add-image':
                if (window.stickersManager) {
                    window.stickersManager.addImageSticker();
                }
                break;
            case 'add-video':
                if (window.stickersManager) {
                    window.stickersManager.addVideoSticker();
                }
                break;
            case 'add-block':
                this.addNewBlock();
                break;
        }
    }
    
    addNewBlock() {
        const title = prompt('请输入新项目块的标题:', '新项目块');
        if (title) {
            // 创建新项目块
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
                
                // 初始化事件
                this.initBlockEvents(block);
                
                // 添加到排序面板
                this.addToSortPanel(blockId, title);
                
                // 触发滚动动画
                setTimeout(() => {
                    block.classList.add('visible');
                }, 100);
            }
        }
    }
    
    getRandomColor() {
        return this.morandiColors[Math.floor(Math.random() * this.morandiColors.length)];
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
                    block.remove();
                    
                    // 从排序面板中移除
                    const blockId = block.dataset.blockId;
                    const listItem = document.querySelector(`.block-list-item[data-block-id="${blockId}"]`);
                    if (listItem) listItem.remove();
                    
                    this.saveContent();
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
        };
        
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
    
    addToSortPanel(blockId, title) {
        const blockList = document.getElementById('block-list');
        if (!blockList) return;
        
        const li = document.createElement('li');
        li.className = 'block-list-item';
        li.dataset.blockId = blockId;
        li.textContent = title;
        li.setAttribute('draggable', 'true');
        
        // 添加拖拽事件
        this.initDragEvents(li);
        
        blockList.appendChild(li);
    }
    
    initDragEvents(item) {
        item.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.dataset.blockId);
            item.classList.add('dragging');
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            
            // 更新主内容区顺序
            this.updateContentOrder();
        });
    }
    
    updateContentOrder() {
        const blockList = document.getElementById('block-list');
        const blocksContainer = document.getElementById('blocks-container');
        
        if (!blockList || !blocksContainer) return;
        
        // 清空容器
        blocksContainer.innerHTML = '';
        
        // 按新顺序添加区块
        const items = blockList.querySelectorAll('.block-list-item');
        items.forEach(item => {
            const blockId = item.dataset.blockId;
            const block = document.querySelector(`[data-block-id="${blockId}"]`);
            if (block) {
                blocksContainer.appendChild(block);
            }
        });
        
        // 保存顺序
        this.saveBlockOrder();
    }
    
    makeContentEditable() {
        document.querySelectorAll('.block-content').forEach(content => {
            content.setAttribute('contenteditable', 'true');
        });
        
        document.querySelectorAll('.sticker textarea').forEach(textarea => {
            textarea.removeAttribute('readonly');
            textarea.style.pointerEvents = 'auto';
        });
    }
    
    makeContentNonEditable() {
        document.querySelectorAll('[contenteditable="true"]').forEach(element => {
            element.setAttribute('contenteditable', 'false');
        });
        
        document.querySelectorAll('.sticker textarea').forEach(textarea => {
            textarea.setAttribute('readonly', 'true');
            textarea.style.pointerEvents = 'none';
        });
    }
    
    initColorIndicators() {
        document.querySelectorAll('.color-indicator').forEach((indicator, index) => {
            if (!indicator.style.background) {
                indicator.style.background = this.morandiColors[index % this.morandiColors.length];
            }
        });
    }
    
    saveContent() {
        // 保存项目块内容
        const blocks = {};
        document.querySelectorAll('.content-block').forEach(block => {
            const blockId = block.dataset.blockId;
            blocks[blockId] = {
                html: block.innerHTML,
                height: block.style.height
            };
        });
        
        localStorage.setItem('portfolio_blocks', JSON.stringify(blocks));
        
        // 保存首页标题
        const designerName = document.querySelector('.designer-name')?.textContent;
        const subtitle = document.querySelector('.subtitle')?.textContent;
        
        if (designerName) localStorage.setItem('designer_name', designerName);
        if (subtitle) localStorage.setItem('subtitle', subtitle);
    }
    
    saveAllContent() {
        this.saveContent();
        
        // 保存贴纸
        if (window.stickersManager && window.stickersManager.saveStickers) {
            window.stickersManager.saveStickers();
        }
        
        // 保存区块顺序
        this.saveBlockOrder();
    }
    
    saveBlockOrder() {
        const order = Array.from(document.querySelectorAll('.block-list-item')).map(item => item.dataset.blockId);
        localStorage.setItem('block_order', JSON.stringify(order));
    }
    
    loadSavedData() {
        // 加载首页标题
        const savedName = localStorage.getItem('designer_name');
        const savedSubtitle = localStorage.getItem('subtitle');
        
        if (savedName) {
            const designerName = document.querySelector('.designer-name');
            if (designerName) designerName.textContent = savedName;
        }
        
        if (savedSubtitle) {
            const subtitle = document.querySelector('.subtitle');
            if (subtitle) subtitle.textContent = savedSubtitle;
        }
        
        // 加载区块顺序
        const savedOrder = localStorage.getItem('block_order');
        if (savedOrder) {
            try {
                const order = JSON.parse(savedOrder);
                this.reorderBlocks(order);
            } catch (e) {
                console.error('加载区块顺序失败:', e);
            }
        }
        
        // 加载区块内容
        const savedBlocks = localStorage.getItem('portfolio_blocks');
        if (savedBlocks) {
            try {
                const blocks = JSON.parse(savedBlocks);
                Object.keys(blocks).forEach(blockId => {
                    const block = document.querySelector(`[data-block-id="${blockId}"]`);
                    if (block && blocks[blockId].html) {
                        block.innerHTML = blocks[blockId].html;
                        if (blocks[blockId].height) {
                            block.style.height = blocks[blockId].height;
                        }
                        
                        // 重新绑定事件
                        this.initBlockEvents(block);
                    }
                });
            } catch (e) {
                console.error('加载保存内容失败:', e);
            }
        }
    }
    
    reorderBlocks(order) {
        const blocksContainer = document.getElementById('blocks-container');
        const blockList = document.getElementById('block-list');
        
        if (!blocksContainer || !blockList) return;
        
        // 清空排序面板
        blockList.innerHTML = '';
        
        // 按顺序重新排列
        order.forEach(blockId => {
            const block = document.querySelector(`[data-block-id="${blockId}"]`);
            const listItem = document.querySelector(`.block-list-item[data-block-id="${blockId}"]`);
            
            if (block) {
                blocksContainer.appendChild(block);
            }
            
            if (!listItem && block) {
                const title = block.querySelector('.block-title')?.textContent.replace(/^.*?\s/, '') || '未命名';
                this.addToSortPanel(blockId, title);
            } else if (listItem) {
                blockList.appendChild(listItem);
            }
        });
    }
    
    checkEditMode() {
        const isEditMode = localStorage.getItem('edit_mode') === 'true';
        if (isEditMode) {
            // 延迟进入编辑模式，等待其他组件初始化
            setTimeout(() => {
                this.enterEditMode();
            }, 500);
        }
    }
}

// 初始化应用程序
document.addEventListener('DOMContentLoaded', () => {
    window.portfolioApp = new PortfolioApp();
});