// 编辑UI管理系统 - 个人博客可视化编辑展示网站
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
                <option value="1.25rem">小标题</option>
                <option value="1.5rem">大标题</option>
            </select>
            <button id="custom-font-size-btn" class="toolbar-btn">自定义</button>
            <div class="color-palette" id="text-color-palette"></div>
            <button id="add-link-btn" class="toolbar-btn">🔗 添加超链接</button>
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
        
        // 14种颜色：12种莫兰迪色系+纯黑+纯白
        const colors = [
            {name: '纯黑', value: '#000000', bright: '#333333'},
            {name: '纯白', value: '#FFFFFF', bright: '#F5F5F5'},
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
        
        // 自定义字号按钮
        const customFontSizeBtn = document.getElementById('custom-font-size-btn');
        if (customFontSizeBtn) {
            customFontSizeBtn.addEventListener('click', () => {
                this.showCustomFontSizeModal();
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
        
        // 链接模态框事件
        this.initLinkModalEvents();
        
        // 自定义字号模态框事件
        this.initCustomFontSizeModalEvents();
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
    
    initCustomFontSizeModalEvents() {
        const confirmFontSizeBtn = document.getElementById('confirm-font-size-btn');
        const cancelFontSizeBtn = document.getElementById('cancel-font-size-btn');
        
        if (confirmFontSizeBtn) {
            confirmFontSizeBtn.addEventListener('click', () => {
                const fontSizeInput = document.getElementById('font-size-input');
                if (fontSizeInput) {
                    const size = fontSizeInput.value.trim();
                    if (size && !isNaN(size) && size > 0) {
                        this.changeFontSize(`${size}px`);
                    }
                }
                this.hideCustomFontSizeModal();
            });
        }
        
        if (cancelFontSizeBtn) {
            cancelFontSizeBtn.addEventListener('click', () => {
                this.hideCustomFontSizeModal();
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
    
    showCustomFontSizeModal() {
        const modal = document.getElementById('custom-font-size-modal');
        if (modal) {
            modal.classList.remove('hidden');
            
            const fontSizeInput = document.getElementById('font-size-input');
            if (fontSizeInput) {
                fontSizeInput.value = '16';
                fontSizeInput.focus();
                fontSizeInput.select();
            }
        }
    }
    
    hideCustomFontSizeModal() {
        const modal = document.getElementById('custom-font-size-modal');
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
            
            // 应用明亮颜色（同色系亮度/纯度提高）
            const currentColor = this.getCurrentTextColor();
            const brightColor = this.getBrightColor(currentColor);
            link.style.color = brightColor;
            link.style.textDecoration = 'underline';
            link.style.fontWeight = 'bold';
            
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
        
        if (sortPanel) sortPanel.classList.add('hidden');
        if (editorMenu) editorMenu.classList.add('hidden');
        
        // 隐藏文本工具条
        this.hideTextToolbar();
        
        // 使内容不可编辑
        this.makeContentNonEditable();
        
        // 保存所有内容
        this.saveAllContent();
        
        // 清除编辑模式状态
        localStorage.removeItem('edit_mode');
    }
    
    makeContentEditable() {
        // 使文本框可编辑
        document.querySelectorAll('.sticker[data-type="text"] textarea').forEach(textarea => {
            textarea.removeAttribute('readonly');
            textarea.style.pointerEvents = 'auto';
        });
    }
    
    makeContentNonEditable() {
        // 使文本框不可编辑
        document.querySelectorAll('.sticker[data-type="text"] textarea').forEach(textarea => {
            textarea.setAttribute('readonly', 'true');
            textarea.style.pointerEvents = 'none';
        });
    }
    
    saveContentChanges() {
        // 保存所有项目块
        const blocks = [];
        document.querySelectorAll('.project-block').forEach((block) => {
            const blockId = block.dataset.blockId;
            if (blockId) {
                blocks.push({
                    id: blockId,
                    title: block.querySelector('.block-title')?.textContent || '',
                    color: block.style.backgroundColor || '',
                    height: block.style.height || '',
                    position: parseInt(block.style.order || '0')
                });
            }
        });
        
        localStorage.setItem('blog_blocks', JSON.stringify(blocks));
        
        // 保存粘贴框
        const stickers = [];
        document.querySelectorAll('.sticker').forEach((sticker) => {
            const stickerId = sticker.dataset.stickerId;
            if (stickerId) {
                const type = sticker.dataset.type;
                const content = type === 'text' ? 
                    sticker.querySelector('textarea')?.value || '' :
                    type === 'image' ?
                    sticker.querySelector('img')?.src || '' :
                    type === 'video' ?
                    sticker.querySelector('video')?.src || '' : '';
                
                stickers.push({
                    id: stickerId,
                    type: type,
                    content: content,
                    x: sticker.style.left || '0px',
                    y: sticker.style.top || '0px',
                    width: sticker.style.width || '200px',
                    height: sticker.style.height || '150px',
                    parentBlockId: sticker.dataset.parentBlockId || ''
                });
            }
        });
        
        localStorage.setItem('blog_stickers', JSON.stringify(stickers));
    }
    
    saveAllContent() {
        this.saveContentChanges();
    }
}

// 初始化编辑UI管理器
document.addEventListener('DOMContentLoaded', () => {
    window.editorUIManager = new EditorUIManager();
});
