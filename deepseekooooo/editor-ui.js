// 编辑UI管理系统
class EditorUIManager {
    constructor() {
        this.isEditMode = false;
        this.currentSelection = null;
        this.textToolbar = null;
        this.init();
    }
    
    init() {
        this.createTextToolbar();
        this.bindEvents();
        this.loadEditState();
        this.initColorPalette();
    }
    
    createTextToolbar() {
        // 如果已存在，先移除
        const existingToolbar = document.getElementById('text-toolbar');
        if (existingToolbar) existingToolbar.remove();
        
        const toolbar = document.createElement('div');
        toolbar.id = 'text-toolbar';
        toolbar.className = 'hidden';
        toolbar.innerHTML = `
            <select id="font-size-select">
                <option value="0.875rem">小字注释</option>
                <option value="1rem" selected>普通文本</option>
                <option value="1.5rem">副标题</option>
            </select>
            <div class="color-palette" id="text-color-palette"></div>
            <button id="add-link-btn" class="toolbar-btn">🔗</button>
            <button id="remove-link-btn" class="toolbar-btn hidden">取消链接</button>
        `;
        
        document.body.appendChild(toolbar);
        this.textToolbar = toolbar;
        
        // 绑定工具条事件
        this.bindToolbarEvents();
    }
    
    initColorPalette() {
        const palette = document.getElementById('text-color-palette');
        if (!palette) return;
        
        palette.innerHTML = '';
        
        const colors = [
            {name: '黑色', value: '#333333', bright: '#000000'},
            {name: '莫兰迪粉', value: '#E8B4B8', bright: '#FFB6C1'},
            {name: '莫兰迪蓝', value: '#A5C9CA', bright: '#87CEEB'},
            {name: '莫兰迪绿', value: '#B5D5C5', bright: '#98FB98'},
            {name: '莫兰迪黄', value: '#F7DCB9', bright: '#FFD700'},
            {name: '莫兰迪紫', value: '#D0B8D8', bright: '#DA70D6'},
            {name: '莫兰迪橙', value: '#F3B7A0', bright: '#FFA07A'},
            {name: '莫兰迪红', value: '#E8A2A2', bright: '#FF6347'},
            {name: '莫兰迪青', value: '#B8E1DD', bright: '#AFEEEE'},
            {name: '莫兰迪棕', value: '#D7C0AE', bright: '#D2B48C'},
            {name: '莫兰迪灰', value: '#C4C4C4', bright: '#D3D3D3'},
            {name: '莫兰迪深蓝', value: '#8BA6B1', bright: '#4682B4'},
            {name: '莫兰迪浅绿', value: '#C8E6C9', bright: '#90EE90'}
        ];
        
        colors.forEach(color => {
            const colorOption = document.createElement('div');
            colorOption.className = 'color-option';
            colorOption.title = color.name;
            colorOption.style.background = color.value;
            colorOption.dataset.color = color.value;
            colorOption.dataset.brightColor = color.bright;
            
            colorOption.addEventListener('click', () => {
                this.changeTextColor(color.value);
            });
            
            palette.appendChild(colorOption);
        });
    }
    
    bindToolbarEvents() {
        // 字号选择
        const fontSizeSelect = document.getElementById('font-size-select');
        if (fontSizeSelect) {
            fontSizeSelect.addEventListener('change', (e) => {
                this.changeFontSize(e.target.value);
            });
        }
        
        // 添加链接按钮
        const addLinkBtn = document.getElementById('add-link-btn');
        if (addLinkBtn) {
            addLinkBtn.addEventListener('click', () => {
                this.showLinkModal();
            });
        }
        
        // 移除链接按钮
        const removeLinkBtn = document.getElementById('remove-link-btn');
        if (removeLinkBtn) {
            removeLinkBtn.addEventListener('click', () => {
                this.removeLink();
            });
        }
    }
    
    bindEvents() {
        // 文本选择监听
        document.addEventListener('selectionchange', () => {
            const selection = window.getSelection();
            if (selection.toString().trim().length > 0 && !selection.anchorNode.closest('.sticker')) {
                this.showTextToolbar(selection);
            } else {
                this.hideTextToolbar();
            }
        });
        
        // 点击页面其他区域关闭工具条
        document.addEventListener('mousedown', (e) => {
            if (!e.target.closest('#text-toolbar') && 
                !e.target.closest('.color-option') && 
                !e.target.closest('.toolbar-btn')) {
                this.hideTextToolbar();
            }
        });
        
        // 首页标题编辑
        this.initTitleEditing();
        
        // 链接模态框事件
        this.initLinkModalEvents();
    }
    
    showTextToolbar(selection) {
        if (!this.isEditMode) return;
        
        this.currentSelection = selection;
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        
        // 定位工具条
        this.textToolbar.style.left = `${rect.left + window.scrollX - 50}px`;
        this.textToolbar.style.top = `${rect.top + window.scrollY - 60}px`;
        this.textToolbar.classList.remove('hidden');
        
        // 检查是否有链接
        const hasLink = this.checkSelectionHasLink();
        const removeLinkBtn = document.getElementById('remove-link-btn');
        if (removeLinkBtn) {
            removeLinkBtn.classList.toggle('hidden', !hasLink);
        }
    }
    
    hideTextToolbar() {
        if (this.textToolbar) {
            this.textToolbar.classList.add('hidden');
        }
        this.currentSelection = null;
    }
    
    changeFontSize(size) {
        if (!this.currentSelection) return;
        
        const span = document.createElement('span');
        span.style.fontSize = size;
        
        const range = this.currentSelection.getRangeAt(0);
        const selectedText = range.toString();
        
        if (selectedText.trim()) {
            span.textContent = selectedText;
            range.deleteContents();
            range.insertNode(span);
            
            this.saveContentChanges();
        }
    }
    
    changeTextColor(color) {
        if (!this.currentSelection) return;
        
        const range = this.currentSelection.getRangeAt(0);
        const selectedText = range.toString();
        
        if (selectedText.trim()) {
            // 替换选中的文本
            const span = document.createElement('span');
            span.style.color = color;
            span.textContent = selectedText;
            
            range.deleteContents();
            range.insertNode(span);
            
            this.saveContentChanges();
        }
    }
    
    checkSelectionHasLink() {
        if (!this.currentSelection) return false;
        
        const range = this.currentSelection.getRangeAt(0);
        const parentElement = range.commonAncestorContainer.parentElement;
        
        return parentElement.tagName === 'A' || parentElement.closest('a');
    }
    
    initLinkModalEvents() {
        const confirmLinkBtn = document.getElementById('confirm-link-btn');
        const cancelLinkBtn = document.getElementById('cancel-link-btn');
        
        if (confirmLinkBtn) {
            confirmLinkBtn.addEventListener('click', () => {
                const urlInput = document.getElementById('link-url-input');
                if (urlInput) {
                    const url = urlInput.value.trim();
                    if (url) {
                        this.addLink(url);
                    }
                }
                this.hideLinkModal();
            });
        }
        
        if (cancelLinkBtn) {
            cancelLinkBtn.addEventListener('click', () => {
                this.hideLinkModal();
            });
        }
    }
    
    showLinkModal() {
        const modal = document.getElementById('link-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            const urlInput = document.getElementById('link-url-input');
            if (urlInput) {
                urlInput.value = '';
                urlInput.focus();
            }
        }
    }
    
    hideLinkModal() {
        const modal = document.getElementById('link-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    addLink(url) {
        if (!this.currentSelection || !url) return;
        
        const range = this.currentSelection.getRangeAt(0);
        const selectedText = range.toString();
        
        if (selectedText.trim()) {
            // 创建链接
            const link = document.createElement('a');
            link.href = url;
            link.target = '_blank';
            link.textContent = selectedText;
            
            // 应用明亮颜色
            const currentColor = this.getCurrentTextColor();
            const brightColor = this.getBrightColor(currentColor);
            link.style.color = brightColor;
            link.style.textDecoration = 'underline';
            
            range.deleteContents();
            range.insertNode(link);
            
            this.saveContentChanges();
        }
    }
    
    removeLink() {
        if (!this.currentSelection) return;
        
        const range = this.currentSelection.getRangeAt(0);
        const linkElement = range.commonAncestorContainer.closest('a');
        
        if (linkElement) {
            const text = document.createTextNode(linkElement.textContent);
            linkElement.parentNode.replaceChild(text, linkElement);
            this.saveContentChanges();
        }
    }
    
    getCurrentTextColor() {
        if (!this.currentSelection) return '#333333';
        
        const range = this.currentSelection.getRangeAt(0);
        const element = range.commonAncestorContainer.parentElement;
        const color = window.getComputedStyle(element).color;
        
        return color || '#333333';
    }
    
    getBrightColor(color) {
        const palette = document.querySelectorAll('.color-option');
        for (const option of palette) {
            const optionColor = option.dataset.color;
            if (optionColor && optionColor.toLowerCase() === color.toLowerCase()) {
                return option.dataset.brightColor || color;
            }
        }
        return color;
    }
    
    initTitleEditing() {
        const designerName = document.querySelector('.designer-name');
        const subtitle = document.querySelector('.subtitle');
        
        if (designerName) {
            designerName.addEventListener('dblclick', () => {
                if (this.isEditMode) {
                    this.editTitle(designerName);
                }
            });
        }
        
        if (subtitle) {
            subtitle.addEventListener('dblclick', () => {
                if (this.isEditMode) {
                    this.editTitle(subtitle);
                }
            });
        }
    }
    
    editTitle(element) {
        const currentText = element.textContent;
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.style.cssText = `
            font-size: inherit;
            font-family: inherit;
            background: white;
            border: 2px solid var(--morandi-pink);
            border-radius: 4px;
            padding: 4px 8px;
            width: 80%;
            max-width: 300px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `;
        
        // 保存原始样式
        const originalDisplay = element.style.display;
        const originalContent = element.innerHTML;
        
        // 替换元素
        element.style.display = 'none';
        element.parentNode.insertBefore(input, element.nextSibling);
        input.focus();
        input.select();
        
        // 保存编辑
        const saveEdit = () => {
            const newText = input.value.trim() || currentText;
            element.textContent = newText;
            element.style.display = originalDisplay;
            input.remove();
            
            // 保存到本地存储
            if (element.classList.contains('designer-name')) {
                localStorage.setItem('designer_name', newText);
            } else if (element.classList.contains('subtitle')) {
                localStorage.setItem('subtitle', newText);
            }
        };
        
        // 取消编辑
        const cancelEdit = () => {
            element.style.display = originalDisplay;
            input.remove();
        };
        
        // 回车保存
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEdit();
            } else if (e.key === 'Escape') {
                cancelEdit();
            }
        });
        
        // 失去焦点保存
        input.addEventListener('blur', saveEdit);
        
        // 点击外部保存
        document.addEventListener('mousedown', (e) => {
            if (!input.contains(e.target) && e.target !== element) {
                saveEdit();
            }
        }, { once: true });
    }
    
    enterEditMode() {
        this.isEditMode = true;
        
        // 显示编辑UI
        const sortPanel = document.getElementById('sort-panel');
        const editorMenu = document.getElementById('editor-menu');
        
        if (sortPanel) sortPanel.classList.remove('hidden');
        if (editorMenu) editorMenu.classList.remove('hidden');
        
        // 使内容可编辑
        this.makeContentEditable();
        
        // 初始化区块管理器
        if (window.blocksManager && typeof window.blocksManager.initSortPanel === 'function') {
            window.blocksManager.initSortPanel();
        }
        
        // 保存编辑模式状态
        localStorage.setItem('edit_mode', 'true');
    }
    
    exitEditMode() {
        this.isEditMode = false;
        
        // 隐藏编辑UI
        const sortPanel = document.getElementById('sort-panel');
        const editorMenu = document.getElementById('editor-menu');
        const menuOptions = document.getElementById('menu-options');
        
        if (sortPanel) sortPanel.classList.add('hidden');
        if (editorMenu) editorMenu.classList.add('hidden');
        if (menuOptions) menuOptions.classList.add('hidden');
        
        // 隐藏文本工具条
        this.hideTextToolbar();
        
        // 使内容不可编辑
        this.makeContentNonEditable();
        
        // 保存所有内容
        this.saveAllContent();
        
        // 清除编辑模式状态
        localStorage.removeItem('edit_mode');
        
        // 刷新页面以应用更改
        window.location.reload();
    }
    
    makeContentEditable() {
        document.querySelectorAll('.block-content').forEach(content => {
            content.setAttribute('contenteditable', 'true');
            content.style.minHeight = '100px';
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
    
    saveContentChanges() {
        // 保存所有内容块
        const blocks = {};
        document.querySelectorAll('.content-block').forEach((block) => {
            const blockId = block.dataset.blockId;
            if (blockId) {
                blocks[blockId] = {
                    html: block.innerHTML,
                    height: block.style.height
                };
            }
        });
        
        localStorage.setItem('portfolio_blocks', JSON.stringify(blocks));
    }
    
    saveAllContent() {
        this.saveContentChanges();
        
        // 保存首页标题
        const designerName = document.querySelector('.designer-name')?.textContent;
        const subtitle = document.querySelector('.subtitle')?.textContent;
        
        if (designerName) localStorage.setItem('designer_name', designerName);
        if (subtitle) localStorage.setItem('subtitle', subtitle);
        
        // 保存贴纸
        if (window.stickersManager && typeof window.stickersManager.saveStickers === 'function') {
            window.stickersManager.saveStickers();
        }
    }
    
    loadEditState() {
        const isEditMode = localStorage.getItem('edit_mode') === 'true';
        if (isEditMode) {
            // 延迟进入编辑模式，等待其他组件初始化
            setTimeout(() => {
                this.enterEditMode();
            }, 500);
        }
        
        // 加载保存的内容
        this.loadSavedContent();
    }
    
    loadSavedContent() {
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
    }
}

// 初始化编辑UI管理器
document.addEventListener('DOMContentLoaded', () => {
    window.editorUIManager = new EditorUIManager();
});