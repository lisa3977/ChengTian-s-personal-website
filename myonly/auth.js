// 认证系统
class AuthSystem {
    constructor() {
        // 从localStorage加载密码，如果没有则使用默认值
        this.defaultPassword = localStorage.getItem('portfolioPassword') || 'password';
        this.securityQuestion = '你画的最满意的人像当中身上哪个地方放有什么重要的东西？';
        this.securityAnswer = '下巴上带着口罩';
        this.isEditMode = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.checkEditMode();
    }

    bindEvents() {
        // 三击触发编辑模式
        let clickCount = 0;
        let lastClickTime = 0;
        
        document.addEventListener('click', (e) => {
            // 忽略可交互元素上的点击
            if (this.isInteractiveElement(e.target)) {
                return;
            }

            const currentTime = Date.now();
            
            if (currentTime - lastClickTime > 500) {
                clickCount = 1;
            } else {
                clickCount++;
            }
            
            lastClickTime = currentTime;
            
            if (clickCount === 3) {
                clickCount = 0;
                this.showAuthModal();
            }
        });

        // 密码输入框回车确认
        document.getElementById('password-input')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.authenticate();
            }
        });

        // 认证提交按钮
        document.getElementById('auth-submit')?.addEventListener('click', () => {
            this.authenticate();
        });

        // 忘记密码链接
        document.getElementById('forgot-password')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showSecurityModal();
        });

        // 安全问题提交
        document.getElementById('security-submit')?.addEventListener('click', () => {
            this.verifySecurityAnswer();
        });

        // 安全问题输入框回车
        document.getElementById('security-answer')?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.verifySecurityAnswer();
            }
        });
    }

    isInteractiveElement(element) {
        const interactiveTags = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'];
        const interactiveClasses = ['sticker', 'block-delete-btn', 'editor-btn', 'menu-option', 'toolbar-btn'];
        
        // 检查标签名
        if (interactiveTags.includes(element.tagName)) {
            return true;
        }
        
        // 检查类名
        for (const className of interactiveClasses) {
            if (element.classList.contains(className)) {
                return true;
            }
        }
        
        // 检查父元素
        let parent = element.parentElement;
        while (parent) {
            for (const className of interactiveClasses) {
                if (parent.classList.contains(className)) {
                    return true;
                }
            }
            parent = parent.parentElement;
        }
        
        return false;
    }

    showAuthModal() {
        if (this.isEditMode) return;
        
        const modal = document.getElementById('auth-modal');
        modal.classList.remove('hidden');
        
        const passwordInput = document.getElementById('password-input');
        passwordInput.value = '';
        passwordInput.focus();
    }

    hideAuthModal() {
        const modal = document.getElementById('auth-modal');
        modal.classList.add('hidden');
    }

    showSecurityModal() {
        this.hideAuthModal();
        
        const modal = document.getElementById('security-modal');
        modal.classList.remove('hidden');
        
        const answerInput = document.getElementById('security-answer');
        answerInput.value = '';
        answerInput.focus();
    }

    hideSecurityModal() {
        const modal = document.getElementById('security-modal');
        modal.classList.add('hidden');
    }

    authenticate() {
        const passwordInput = document.getElementById('password-input');
        const password = passwordInput.value.trim();
        
        if (!password) {
            alert('请输入密码！');
            passwordInput.focus();
            return;
        }
        
        if (password === this.defaultPassword) {
            this.enterEditMode();
            this.hideAuthModal();
        } else {
            alert('密码错误！请重试。');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }

    verifySecurityAnswer() {
        const answerInput = document.getElementById('security-answer');
        const answer = answerInput.value.trim();
        
        if (!answer) {
            alert('请输入答案！');
            answerInput.focus();
            return;
        }
        
        // 简单加密验证（实际应用中应该使用更安全的加密方式）
        const encryptedAnswer = this.simpleEncrypt(answer);
        const storedAnswer = this.simpleEncrypt(this.securityAnswer);
        
        if (encryptedAnswer === storedAnswer) {
            // 重置密码为默认值并保存到localStorage
            this.defaultPassword = 'password';
            localStorage.setItem('portfolioPassword', 'password');
            alert('验证成功！密码已重置为默认密码 "password"。');
            this.hideSecurityModal();
            this.showAuthModal();
        } else {
            alert('答案错误！请重试。');
            answerInput.value = '';
            answerInput.focus();
        }
    }

    simpleEncrypt(text) {
        // 简单的加密函数（仅用于演示）
        let result = '';
        for (let i = 0; i < text.length; i++) {
            const charCode = text.charCodeAt(i);
            result += String.fromCharCode(charCode + 1);
        }
        return btoa(result);
    }

    enterEditMode() {
        this.isEditMode = true;
        document.body.classList.add('edit-mode');
        
        // 显示编辑UI
        const editorUI = document.getElementById('editor-ui');
        editorUI.classList.remove('hidden');
        
        // 触发编辑模式事件
        const event = new CustomEvent('editModeEntered');
        document.dispatchEvent(event);
        
        // 保存编辑模式状态
        localStorage.setItem('portfolioEditMode', 'true');
        
        console.log('进入编辑模式');
    }

    exitEditMode() {
        this.isEditMode = false;
        document.body.classList.remove('edit-mode');
        
        // 隐藏编辑UI
        const editorUI = document.getElementById('editor-ui');
        editorUI.classList.add('hidden');
        
        // 触发退出编辑模式事件
        const event = new CustomEvent('editModeExited');
        document.dispatchEvent(event);
        
        // 清除编辑模式状态
        localStorage.removeItem('portfolioEditMode');
        
        console.log('退出编辑模式');
    }

    checkEditMode() {
        // 检查localStorage中是否有编辑模式状态
        const editMode = localStorage.getItem('portfolioEditMode');
        if (editMode === 'true') {
            this.isEditMode = true;
            document.body.classList.add('edit-mode');
            
            // 显示编辑UI
            const editorUI = document.getElementById('editor-ui');
            if (editorUI) {
                editorUI.classList.remove('hidden');
            }
            
            // 触发编辑模式事件
            const event = new CustomEvent('editModeEntered');
            document.dispatchEvent(event);
        } else {
            this.isEditMode = false;
            document.body.classList.remove('edit-mode');
            
            // 确保编辑UI隐藏
            const editorUI = document.getElementById('editor-ui');
            if (editorUI) {
                editorUI.classList.add('hidden');
            }
        }
    }

    toggleEditMode() {
        if (this.isEditMode) {
            this.exitEditMode();
        } else {
            this.showAuthModal();
        }
    }
}

// 初始化认证系统
const authSystem = new AuthSystem();

// 导出供其他模块使用
window.authSystem = authSystem;
