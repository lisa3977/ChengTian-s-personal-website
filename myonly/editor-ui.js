/**
 * 编辑UI管理器
 * 处理编辑模式下的UI功能：功能菜单、文本编辑、标题编辑等
 * 使用HTML中已有的元素，而不是创建新元素
 */
class EditorUIManager {
    constructor() {
        this.isEditing = false;
        this.functionMenu = document.getElementById('function-menu');
        this.menuOptions = document.getElementById('menu-options');
        this.addMenuBtn = document.getElementById('add-menu-btn');
        this.exitEditBtn = document.getElementById('exit-edit-btn');
        this.textToolbar = document.getElementById('text-toolbar');
        this.editorUI = document.getElementById('editor-ui');
        this.currentTextElement = null;
        
        this.init();
    }

    /**
     * 初始化编辑UI
     */
    init() {
        this.bindEvents();
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 功能菜单切换
        if (this.addMenuBtn) {
            this.addMenuBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleFunctionMenu();
            });
        }

        // 功能选项点击
        if (this.menuOptions) {
            const options = this.menuOptions.querySelectorAll('.menu-option');
            options.forEach(option => {
                option.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const action = e.target.dataset.action;
                    this.handleFunctionAction(action);
                    this.hideFunctionMenu();
                });
            });
        }

        // 退出按钮点击
        if (this.exitEditBtn) {
            this.exitEditBtn.addEventListener('click', () => {
                this.exitEditMode();
            });
        }

        // 文本工具条事件
        this.bindTextToolbarEvents();

        // 点击页面其他区域关闭工具条和菜单
        document.addEventListener('click', (e) => {
            // 关闭文本工具条
            if (!e.target.closest('#text-toolbar') && !e.target.closest('.editable-text')) {
                this.hideTextToolbar();
            }
            
            // 关闭功能菜单
            if (!e.target.closest('#function-menu')) {
                this.hideFunctionMenu();
            }
        });

        // 双击首页标题打开编辑器
        this.bindTitleDoubleClick();
    }

    /**
     * 绑定文本工具条事件
     */
    bindTextToolbarEvents() {
        if (!this.textToolbar) return;

        // 字号按钮
        const fontSizeBtns = this.textToolbar.querySelectorAll('.toolbar-btn[data-size]');
        fontSizeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const size = e.target.dataset.size;
                this.applyFontSize(size);
            });
        });

        // 颜色选项
        const colorOptions = this.textToolbar.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const color = e.target.style.backgroundColor;
                this.applyTextColor(color);
            });
        });

        // 链接按钮
        const linkBtn = this.textToolbar.querySelector('.toolbar-btn[data-action="add-link"]');
        if (linkBtn) {
            linkBtn.addEventListener('click', () => {
                this.showLinkInput();
            });
        }
    }

    /**
     * 绑定标题双击事件
     */
    bindTitleDoubleClick() {
        const designerTitle = document.querySelector('.hero-title');
        const subtitle = document.querySelector('.hero-subtitle');
        
        if (designerTitle) {
            designerTitle.addEventListener('dblclick', (e) => {
                if (!this.isEditing) return;
                e.stopPropagation();
                this.showTitleEditor();
            });
        }
        
        if (subtitle) {
            subtitle.addEventListener('dblclick', (e) => {
                if (!this.isEditing) return;
                e.stopPropagation();
                this.showTitleEditor();
            });
        }
    }

    /**
     * 切换功能菜单显示/隐藏
     */
    toggleFunctionMenu() {
        if (this.menuOptions) {
            this.menuOptions.classList.toggle('hidden');
        }
    }

    /**
     * 隐藏功能菜单
     */
    hideFunctionMenu() {
        if (this.menuOptions) {
            this.menuOptions.classList.add('hidden');
        }
    }

    /**
     * 处理功能菜单动作
     */
    handleFunctionAction(action) {
        if (!window.StickersManager) {
            console.error('StickersManager not available');
            return;
        }

        switch (action) {
            case 'add-text':
                window.StickersManager.createTextSticker();
                break;
            case 'add-image':
                this.addImageSticker();
                break;
            case 'add-video':
                this.addVideoSticker();
                break;
            case 'add-block':
                this.addNewBlock();
                break;
        }
    }

    /**
     * 添加图片贴纸
     */
    addImageSticker() {
        if (!window.StickersManager) {
            console.error('StickersManager not available');
            return;
        }

        // 创建文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // 创建图片贴纸
                    window.StickersManager.createImageSticker(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
        
        input.click();
    }

    /**
     * 添加视频贴纸
     */
    addVideoSticker() {
        if (!window.StickersManager) {
            console.error('StickersManager not available');
            return;
        }

        // 创建文件输入元素
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'video/*';
        
        input.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    // 创建视频贴纸
                    window.StickersManager.createVideoSticker(e.target.result);
                };
                reader.readAsDataURL(file);
            }
        });
        
        input.click();
    }

    /**
     * 添加新项目块
     */
    addNewBlock() {
        if (!window.BlocksManager) {
            console.error('BlocksManager not available');
            return;
        }

        // 使用BlocksManager的addNewBlock方法，这会自动同步导航栏
        const blockId = window.BlocksManager.addNewBlock('新项目块', '这是一个新的项目块。双击编辑内容。');
        
        // 使内容可编辑
        const block = document.getElementById(blockId);
        if (block) {
            const content = block.querySelector('.block-content');
            if (content) {
                content.setAttribute('contenteditable', 'true');
                content.addEventListener('blur', () => {
                    // 保存内容到本地存储
                    localStorage.setItem(`block_content_${blockId}`, content.innerHTML);
                });
            }
        }
    }

    /**
     * 显示文本工具条
     */
    showTextToolbar(targetElement, rect) {
        if (!this.textToolbar) return;
        
        this.textToolbar.classList.remove('hidden');
        this.textToolbar.style.top = `${rect.top - 50}px`;
        this.textToolbar.style.left = `${rect.left + rect.width / 2 - 150}px`;
        this.currentTextElement = targetElement;
    }

    /**
     * 隐藏文本工具条
     */
    hideTextToolbar() {
        if (this.textToolbar) {
            this.textToolbar.classList.add('hidden');
        }
        this.currentTextElement = null;
    }

    /**
     * 显示链接输入框
     */
    showLinkInput() {
        // 创建链接输入模态框
        const linkModal = document.createElement('div');
        linkModal.className = 'link-modal';
        linkModal.innerHTML = `
            <div class="link-modal-content">
                <h4>添加链接</h4>
                <input type="text" class="link-input" placeholder="输入链接地址">
                <div class="link-modal-buttons">
                    <button class="apply-link-btn">应用</button>
                    <button class="cancel-link-btn">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(linkModal);
        
        const linkInput = linkModal.querySelector('.link-input');
        const applyBtn = linkModal.querySelector('.apply-link-btn');
        const cancelBtn = linkModal.querySelector('.cancel-link-btn');
        
        applyBtn.addEventListener('click', () => {
            const url = linkInput.value.trim();
            if (url) {
                this.applyLink(url);
            }
            document.body.removeChild(linkModal);
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(linkModal);
        });
        
        // 自动聚焦输入框
        setTimeout(() => linkInput.focus(), 100);
    }

    /**
     * 应用字号
     */
    applyFontSize(size) {
        if (this.currentTextElement) {
            this.currentTextElement.style.fontSize = size;
            
            // 保存到本地存储
            if (this.currentTextElement.dataset.stickerId) {
                window.StickersManager.updateStickerStyle(
                    this.currentTextElement.dataset.stickerId,
                    'fontSize',
                    size
                );
            }
        }
    }

    /**
     * 应用文本颜色
     */
    applyTextColor(color) {
        if (this.currentTextElement) {
            this.currentTextElement.style.color = color;
            
            // 保存到本地存储
            if (this.currentTextElement.dataset.stickerId) {
                window.StickersManager.updateStickerStyle(
                    this.currentTextElement.dataset.stickerId,
                    'color',
                    color
                );
            }
        }
    }

    /**
     * 应用链接
     */
    applyLink(url) {
        if (this.currentTextElement && window.getSelection) {
            const selection = window.getSelection();
            if (selection.toString()) {
                const range = selection.getRangeAt(0);
                const link = document.createElement('a');
                link.href = url;
                link.target = '_blank';
                link.style.color = this.getBrightColor(this.currentTextElement.style.color || '#000000');
                link.textContent = selection.toString();
                
                range.deleteContents();
                range.insertNode(link);
                
                // 保存到本地存储
                if (this.currentTextElement.dataset.stickerId) {
                    window.StickersManager.updateStickerContent(
                        this.currentTextElement.dataset.stickerId,
                        this.currentTextElement.innerHTML
                    );
                }
            }
        }
    }

    /**
     * 获取明亮颜色（用于超链接）
     */
    getBrightColor(color) {
        if (color === '#000000' || color === 'black' || color === 'rgb(0, 0, 0)') {
            return '#000000';
        }
        
        // 简单实现：增加亮度
        const rgb = color.match(/\d+/g);
        if (rgb) {
            const r = Math.min(255, parseInt(rgb[0]) + 40);
            const g = Math.min(255, parseInt(rgb[1]) + 40);
            const b = Math.min(255, parseInt(rgb[2]) + 40);
            
            return `rgb(${r}, ${g}, ${b})`;
        }
        
        return color;
    }

    /**
     * 显示标题编辑器
     */
    showTitleEditor() {
        // 创建标题编辑模态框
        const titleModal = document.createElement('div');
        titleModal.className = 'title-modal';
        titleModal.innerHTML = `
            <div class="title-modal-content">
                <h3>编辑首页标题</h3>
                <div class="editor-field">
                    <label>设计师名称:</label>
                    <input type="text" class="designer-name-input" value="设计师">
                </div>
                <div class="editor-field">
                    <label>设计师颜色:</label>
                    <input type="color" class="designer-color-input" value="#f06292">
                </div>
                <div class="editor-field">
                    <label>副标题:</label>
                    <input type="text" class="subtitle-input" value="游戏3D建模 · 创意表达">
                </div>
                <div class="editor-buttons">
                    <button class="save-title-btn">保存</button>
                    <button class="cancel-title-btn">取消</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(titleModal);
        
        // 获取当前值
        const designerSpan = document.getElementById('designer-text');
        const subtitleElement = document.getElementById('subtitle-text');
        
        const designerNameInput = titleModal.querySelector('.designer-name-input');
        const designerColorInput = titleModal.querySelector('.designer-color-input');
        const subtitleInput = titleModal.querySelector('.subtitle-input');
        
        if (designerSpan) {
            designerNameInput.value = designerSpan.textContent;
            designerColorInput.value = this.rgbToHex(designerSpan.style.color) || '#f06292';
        }
        
        if (subtitleElement) {
            subtitleInput.value = subtitleElement.textContent;
        }
        
        // 绑定事件
        const saveBtn = titleModal.querySelector('.save-title-btn');
        const cancelBtn = titleModal.querySelector('.cancel-title-btn');
        
        saveBtn.addEventListener('click', () => {
            this.saveTitleChanges(
                designerNameInput.value,
                designerColorInput.value,
                subtitleInput.value
            );
            document.body.removeChild(titleModal);
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(titleModal);
        });
    }

    /**
     * 保存标题更改
     */
    saveTitleChanges(designerName, designerColor, subtitleText) {
        const designerSpan = document.getElementById('designer-text');
        const subtitleElement = document.getElementById('subtitle-text');
        
        if (designerSpan) {
            designerSpan.textContent = designerName;
            designerSpan.style.color = designerColor;
        }
        
        if (subtitleElement) {
            subtitleElement.textContent = subtitleText;
        }
        
        // 保存到本地存储
        localStorage.setItem('portfolio_title', JSON.stringify({
            designerName,
            designerColor,
            subtitle: subtitleText
        }));
    }

    /**
     * RGB转十六进制
     */
    rgbToHex(rgb) {
        if (!rgb) return null;
        
        if (rgb.startsWith('#')) return rgb;
        
        const match = rgb.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (match) {
            const r = parseInt(match[1]).toString(16).padStart(2, '0');
            const g = parseInt(match[2]).toString(16).padStart(2, '0');
            const b = parseInt(match[3]).toString(16).padStart(2, '0');
            return `#${r}${g}${b}`;
        }
        
        return null;
    }

    /**
     * 进入编辑模式
     */
    enterEditMode() {
        this.isEditing = true;
        
        // 在body上添加edit-mode类
        document.body.classList.add('edit-mode');
        
        // 显示编辑UI
        if (this.editorUI) {
            this.editorUI.classList.remove('hidden');
        }
        
        // 显示功能菜单和退出按钮
        if (this.functionMenu) {
            this.functionMenu.style.display = 'block';
        }
        
        if (this.exitEditBtn) {
            this.exitEditBtn.style.display = 'block';
        }
        
        // 使内容可编辑
        document.querySelectorAll('.block-content').forEach(content => {
            content.setAttribute('contenteditable', 'true');
        });
        
        // 显示删除按钮和调整手柄
        document.querySelectorAll('.block-delete-btn, .block-resize-handle').forEach(el => {
            el.style.display = 'block';
        });
        
        // 加载保存的标题
        this.loadSavedTitle();
        
        // 初始化BlocksManager
        if (window.BlocksManager && window.BlocksManager.updateSortPanel) {
            window.BlocksManager.updateSortPanel();
        }
        
        console.log('Entered edit mode');
    }

    /**
     * 退出编辑模式
     */
    exitEditMode() {
        this.isEditing = false;
        
        // 从body上移除edit-mode类
        document.body.classList.remove('edit-mode');
        
        // 隐藏编辑UI
        if (this.editorUI) {
            this.editorUI.classList.add('hidden');
        }
        
        // 隐藏功能菜单和退出按钮
        if (this.functionMenu) {
            this.functionMenu.style.display = 'none';
        }
        
        if (this.exitEditBtn) {
            this.exitEditBtn.style.display = 'none';
        }
        
        // 隐藏文本工具条
        this.hideTextToolbar();
        
        // 隐藏功能菜单
        this.hideFunctionMenu();
        
        // 禁用内容编辑
        document.querySelectorAll('.block-content').forEach(content => {
            content.removeAttribute('contenteditable');
        });
        
        // 隐藏删除按钮和调整手柄
        document.querySelectorAll('.block-delete-btn, .block-resize-handle').forEach(el => {
            el.style.display = 'none';
        });
        
        // 保存所有更改到本地存储
        this.saveAllChanges();
        
        console.log('Exited edit mode');
    }

    /**
     * 加载保存的标题
     */
    loadSavedTitle() {
        const savedTitle = localStorage.getItem('portfolio_title');
        if (savedTitle) {
            try {
                const { designerName, designerColor, subtitle } = JSON.parse(savedTitle);
                const designerSpan = document.getElementById('designer-text');
                const subtitleElement = document.getElementById('subtitle-text');
                
                if (designerSpan) {
                    designerSpan.textContent = designerName;
                    designerSpan.style.color = designerColor;
                }
                
                if (subtitleElement) {
                    subtitleElement.textContent = subtitle;
                }
            } catch (e) {
                console.error('Failed to load saved title:', e);
            }
        }
    }

    /**
     * 保存所有更改
     */
    saveAllChanges() {
        // 保存项目块内容
        document.querySelectorAll('.content-block').forEach(block => {
            const content = block.querySelector('.block-content');
            if (content) {
                localStorage.setItem(`block_content_${block.id}`, content.innerHTML);
            }
        });
        
        // 保存标题
        const designerSpan = document.getElementById('designer-text');
        const subtitleElement = document.getElementById('subtitle-text');
        
        if (designerSpan && subtitleElement) {
            localStorage.setItem('portfolio_title', JSON.stringify({
                designerName: designerSpan.textContent,
                designerColor: designerSpan.style.color,
                subtitle: subtitleElement.textContent
            }));
        }
        
        // 保存贴纸数据
        if (window.StickersManager && window.StickersManager.saveToStorage) {
            window.StickersManager.saveToStorage();
        }
        
        // 保存区块顺序
        if (window.BlocksManager && window.BlocksManager.saveToStorage) {
            window.BlocksManager.saveToStorage();
        }
        
        console.log('All changes saved to localStorage');
    }
}

// 导出到全局作用域
if (typeof window !== 'undefined') {
    window.EditorUIManager = EditorUIManager;
}
