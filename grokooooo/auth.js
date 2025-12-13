// auth.js
let isEditing = false;
const defaultPassword = 'password';
const securityQuestion = "你画的最满意的人像当中身上哪个地方放有什么重要的东西？";
const securityAnswerHash = btoa('下巴上带着口罩'); // 简单加密

function initAuth() {
    let clickCount = 0;
    let clickTimer;
    document.body.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT' || e.target.classList.contains('sticker')) return;
        clickCount++;
        if (clickCount === 1) {
            clickTimer = setTimeout(() => clickCount = 0, 300);
        } else if (clickCount === 3) {
            clearTimeout(clickTimer);
            clickCount = 0;
            showAuthModal();
        }
    });

    document.getElementById('auth-confirm').addEventListener('click', verifyPassword);
    document.getElementById('password-input').addEventListener('keyup', (e) => { if (e.key === 'Enter') verifyPassword(); });
    document.getElementById('forgot-password').addEventListener('click', showSecurityModal);
    document.getElementById('security-confirm').addEventListener('click', verifySecurity);
}

function showAuthModal() {
    document.getElementById('auth-modal').classList.remove('hidden');
}

function verifyPassword() {
    const input = document.getElementById('password-input').value;
    if (input === localStorage.getItem('password') || input === defaultPassword) {
        enterEditMode();
    } else {
        alert('密码错误');
    }
}

function showSecurityModal() {
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('security-modal').classList.remove('hidden');
}

function verifySecurity() {
    const answer = document.getElementById('security-answer').value;
    if (btoa(answer) === securityAnswerHash) {
        localStorage.setItem('password', defaultPassword);
        alert('密码已重置为 "password"');
        document.getElementById('security-modal').classList.add('hidden');
        showAuthModal();
    } else {
        alert('答案错误');
    }
}

function enterEditMode() {
    isEditing = true;
    document.getElementById('auth-modal').classList.add('hidden');
    document.getElementById('editor-panel').classList.remove('hidden');
    document.getElementById('editor-add').classList.remove('hidden');
    document.getElementById('editor-exit').classList.remove('hidden');
    document.querySelectorAll('.resize-handle, .block-delete').forEach(el => el.style.display = 'block');
    saveToLocalStorage(); // 定期保存
}