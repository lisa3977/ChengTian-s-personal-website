// auth.js - 身份认证系统

const ADMIN_PASSWORD = 'password';

// 三击计数器
let clickCount = 0;
let clickTimer = null;

// 初始化事件监听
document.addEventListener('DOMContentLoaded', () => {
  document.body.addEventListener('click', handleBodyClick);
});

function handleBodyClick(e) {
  // 忽略在贴纸或输入框上的点击
  if (e.target.closest('.sticker') || 
      e.target.tagName === 'INPUT' || 
      e.target.tagName === 'TEXTAREA') {
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
      <div>
        <button onclick="submitPassword()">确定</button>
        <button onclick="closePasswordModal()">取消</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  
  const input = document.getElementById('pass-input');
  input.focus();
  
  // 👇 新增：回车确认
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      submitPassword();
    }
  });
}

// 全局函数供 HTML 调用
window.submitPassword = submitPassword;
window.closePasswordModal = closePasswordModal;
