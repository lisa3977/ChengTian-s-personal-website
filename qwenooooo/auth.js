// auth.js - 身份认证系统（含安全问题找回）

const ADMIN_PASSWORD_KEY = 'portfolio_admin_password';
const DEFAULT_PASSWORD = 'password';

// 安全问题（加密存储）
const SECURITY_QUESTION = "你画的最满意的人像当中身上哪个地方放有什么重要的东西？";
const ENCRYPTED_ANSWER = "V+K67O75ByL5RiRo5+Sr5kqL5yY5"; // "下巴上带着口罩" 加密后

// 初始化密码
function initAuth() {
  if (!localStorage.getItem(ADMIN_PASSWORD_KEY)) {
    localStorage.setItem(ADMIN_PASSWORD_KEY, btoa(DEFAULT_PASSWORD));
  }
}

// 验证密码
function verifyPassword(input) {
  const stored = localStorage.getItem(ADMIN_PASSWORD_KEY);
  return btoa(input) === stored;
}

// 解密答案
function decryptAnswer(encrypted) {
  return decodeURIComponent(atob(encrypted.split('').reverse().join('')));
}

// 三击计数器
let clickCount = 0;
let clickTimer = null;

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  document.body.addEventListener('click', handleBodyClick);
});

function handleBodyClick(e) {
  // 忽略在贴纸或输入框上的点击
  if (e.target.closest('.sticker') || 
      e.target.tagName === 'INPUT' || 
      e.target.tagName === 'TEXTAREA' || 
      e.target.tagName === 'BUTTON') {
    return;
  }

  clickCount++;
  if (clickCount === 3) {
    showPasswordModal();
    clickCount = 0;
    clearTimeout(clickTimer);
  } else {
    clearTimeout(clickTimer);
    clickTimer = setTimeout(() => {
      clickCount = 0;
    }, 300);
  }
}

function showPasswordModal() {
  if (document.getElementById('password-modal')) return;
  
  const modal = document.createElement('div');
  modal.id = 'password-modal';
  modal.innerHTML = `
    <div class="modal-content">
      <h3>🔒 身份验证</h3>
      <p>请输入管理员密码以进入编辑模式</p>
      <input type="password" id="pass-input" placeholder="密码" autocomplete="off">
      <div class="forgot-password" style="margin: 12px 0; text-align: center;">
        <button onclick="showForgotPassword()" style="background:none; border:none; color:var(--color-5); cursor:pointer; text-decoration:underline;">
          忘记密码？
        </button>
      </div>
      <div>
        <button onclick="submitPassword()">确定</button>
        <button onclick="closePasswordModal()">取消</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  const input = document.getElementById('pass-input');
  input.focus();
  
  // 回车确认
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitPassword();
    }
  });
}

function submitPassword() {
  const input = document.getElementById('pass-input');
  if (input && verifyPassword(input.value)) {
    enableEditMode();
    closePasswordModal();
  } else {
    alert('密码错误！');
  }
}

function showForgotPassword() {
  const modal = document.getElementById('password-modal');
  modal.innerHTML = `
    <div class="modal-content">
      <h3>🔑 找回密码</h3>
      <p>${SECURITY_QUESTION}</p>
      <input type="text" id="security-answer" placeholder="请输入答案" autocomplete="off">
      <div>
        <button onclick="verifySecurityAnswer()">提交</button>
        <button onclick="showPasswordModal()">返回</button>
      </div>
    </div>
  `;
  
  document.getElementById('security-answer').focus();
}

function verifySecurityAnswer() {
  const answer = document.getElementById('security-answer').value.trim();
  const realAnswer = decryptAnswer(ENCRYPTED_ANSWER);
  
  if (answer === realAnswer) {
    alert(`✅ 验证成功！\n密码已重置为：${DEFAULT_PASSWORD}\n请牢记新密码！`);
    localStorage.setItem(ADMIN_PASSWORD_KEY, btoa(DEFAULT_PASSWORD));
    closeModal();
    showPasswordModal();
  } else {
    alert('❌ 答案错误！请重试。');
  }
}

function closePasswordModal() {
  const modal = document.getElementById('password-modal');
  if (modal) modal.remove();
}

// 修改密码
function changePassword(oldPass, newPass) {
  if (!verifyPassword(oldPass)) {
    alert('旧密码错误！');
    return false;
  }
  localStorage.setItem(ADMIN_PASSWORD_KEY, btoa(newPass));
  alert('密码修改成功！');
  return true;
}

// 全局函数供 HTML 调用
window.submitPassword = submitPassword;
window.closePasswordModal = closePasswordModal;
window.showForgotPassword = showForgotPassword;
window.verifySecurityAnswer = verifySecurityAnswer;
