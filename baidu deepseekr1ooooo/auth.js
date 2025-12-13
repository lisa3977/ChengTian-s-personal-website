let authState = {
    isAuthenticated: false,
    attempts: 0
};

function showAuthModal() {
    const modal = document.getElementById('auth-modal');
    modal.classList.remove('hidden');
    
    const passwordInput = document.getElementById('password-input');
    passwordInput.focus();
    
    // 回车键确认
    passwordInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            authenticate();
        }
    });
    
    document.getElementById('auth-submit').addEventListener('click', authenticate);
    document.getElementById('forgot-password').addEventListener('click', showSecurityQuestion);
}

function authenticate() {
    const passwordInput = document.getElementById('password-input');
    const password = passwordInput.value;
    
    if (password === 'password') {
        authState.isAuthenticated = true;
        authState.attempts = 0;
        hideAuthModal();
        enterEditMode();
    } else {
        authState.attempts++;
        alert('密码错误，请重试');
        passwordInput.value = '';
        passwordInput.focus();
    }
}

function showSecurityQuestion(e) {
    e.preventDefault();
    hideAuthModal();
    
    const securityModal = document.getElementById('security-modal');
    securityModal.classList.remove('hidden');
    
    const answerInput = document.getElementById('security-answer');
    answerInput.focus();
    
    document.getElementById('security-submit').addEventListener('click', validateSecurityAnswer);
}

function validateSecurityAnswer() {
    const answerInput = document.getElementById('security-answer');
    const answer = answerInput.value;
    
    // 这里应该是加密验证，示例中使用明文
    if (answer === '下巴上带着口罩') {
        alert('验证成功，密码已重置为默认值');
        hideSecurityModal();
        showAuthModal();
    } else {
        alert('答案错误，请重试');
        answerInput.value = '';
        answerInput.focus();
    }
}

function hideAuthModal() {
    document.getElementById('auth-modal').classList.add('hidden');
}

function hideSecurityModal() {
    document.getElementById('security-modal').classList.add('hidden');
}
