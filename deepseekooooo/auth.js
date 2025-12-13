// 认证管理系统
class AuthManager {
    constructor() {
        this.DEFAULT_PASSWORD = 'password';
        this.SECURITY_ANSWER = '下巴上带着口罩';
        this.init();
    }
    
    init() {
        // 检查是否有保存的密码
        this.loadPassword();
        
        // 绑定事件
        this.bindEvents();
    }
    
    loadPassword() {
        if (!localStorage.getItem('portfolio_password')) {
            // 保存默认密码的加密版本
            localStorage.setItem('portfolio_password', this.encrypt(this.DEFAULT_PASSWORD));
        }
    }
    
    bindEvents() {
        // 密码输入回车确认
        const passwordInput = document.getElementById('password-input');
        if (passwordInput) {
            passwordInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.verifyPassword();
                }
            });
        }
        
        // 确认密码按钮
        const confirmBtn = document.getElementById('confirm-password-btn');
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.verifyPassword();
            });
        }
        
        // 忘记密码链接
        const forgotLink = document.getElementById('forgot-password-link');
        if (forgotLink) {
            forgotLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSecurityQuestion();
            });
        }
        
        // 安全问题确认
        const confirmAnswerBtn = document.getElementById('confirm-answer-btn');
        if (confirmAnswerBtn) {
            confirmAnswerBtn.addEventListener('click', () => {
                this.verifySecurityAnswer();
            });
        }
        
        // 安全问题取消
        const cancelSecurityBtn = document.getElementById('cancel-security-btn');
        if (cancelSecurityBtn) {
            cancelSecurityBtn.addEventListener('click', () => {
                this.hideSecurityQuestion();
                this.showPasswordModal();
            });
        }
    }
    
    encrypt(text) {
        // 简单加密：base64 + 反转
        return btoa(text.split('').reverse().join(''));
    }
    
    decrypt(text) {
        try {
            return atob(text).split('').reverse().join('');
        } catch (e) {
            return '';
        }
    }
    
    verifyPassword() {
        const passwordInput = document.getElementById('password-input');
        const password = passwordInput.value;
        const savedPassword = localStorage.getItem('portfolio_password');
        
        if (this.encrypt(password) === savedPassword) {
            this.onAuthSuccess();
        } else {
            this.showError('密码错误！');
            passwordInput.value = '';
            passwordInput.focus();
        }
    }
    
    showSecurityQuestion() {
        const authModal = document.getElementById('auth-modal');
        const securityModal = document.getElementById('security-modal');
        
        if (authModal) authModal.classList.add('hidden');
        if (securityModal) securityModal.classList.remove('hidden');
        
        const answerInput = document.getElementById('security-answer');
        if (answerInput) answerInput.focus();
    }
    
    hideSecurityQuestion() {
        const securityModal = document.getElementById('security-modal');
        if (securityModal) securityModal.classList.add('hidden');
    }
    
    verifySecurityAnswer() {
        const answerInput = document.getElementById('security-answer');
        const answer = answerInput.value.trim();
        
        if (this.encrypt(answer) === this.encrypt(this.SECURITY_ANSWER)) {
            // 重置密码为默认值
            localStorage.setItem('portfolio_password', this.encrypt(this.DEFAULT_PASSWORD));
            
            alert('密码已重置为默认值 "password"');
            this.hideSecurityQuestion();
            this.showPasswordModal();
            
            // 清空输入
            answerInput.value = '';
        } else {
            this.showError('答案错误！');
            answerInput.value = '';
            if (answerInput) answerInput.focus();
        }
    }
    
    showPasswordModal() {
        const authModal = document.getElementById('auth-modal');
        if (authModal) {
            authModal.classList.remove('hidden');
            const passwordInput = document.getElementById('password-input');
            if (passwordInput) {
                passwordInput.value = '';
                passwordInput.focus();
            }
        }
    }
    
    onAuthSuccess() {
        // 触发编辑模式
        if (window.portfolioApp && typeof window.portfolioApp.enterEditMode === 'function') {
            window.portfolioApp.enterEditMode();
        }
        
        // 隐藏模态框
        const authModal = document.getElementById('auth-modal');
        if (authModal) authModal.classList.add('hidden');
    }
    
    showError(message) {
        alert(message);
    }
}

// 初始化认证系统
document.addEventListener('DOMContentLoaded', () => {
    new AuthManager();
});