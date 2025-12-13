/* auth.js - 编辑模式进入 & 密码验证系统 */

// ------------------------------
// 系统说明：
// 用户三击空白区域 → 弹出密码框 → 输入密码（默认 password）
// 如果忘记密码 → 跳转安全问题验证
// 验证成功 → 重置密码 = 'password'
// ------------------------------

(function () {
  const EDIT_TRIGGER_DELAY = 350; // 三击最大间隔
  const DEFAULT_PASSWORD = 'password';
  const STORAGE_KEY = 'pf_password_v1';
  const SECURITY_Q = "你画的最满意的人像当中身上哪个地方放有什么重要的东西？";
  const SECURITY_A = "下巴上带着口罩"; // 加密处理（简单方案:base64）
  const ENC_A = btoa(SECURITY_A);

  // ------------------------------
  // 工具函数
  // ------------------------------
  function loadPassword() {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_PASSWORD;
  }

  function savePassword(pw) {
    localStorage.setItem(STORAGE_KEY, pw);
  }

  function createDialog(html) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    const dialog = wrapper.firstChild;
    document.body.appendChild(dialog);
    return dialog;
  }

  function closeDialog(dialog) {
    dialog.remove();
  }

  // ------------------------------
  // 密码输入弹窗
  // ------------------------------
  function showPasswordDialog() {
    const dlg = createDialog(`
      <div class="auth-dialog">
        <div class="auth-box">
          <h3>请输入编辑密码</h3>
          <input id="auth-input" type="password" placeholder="password">
          <div class="auth-buttons">
            <button id="auth-ok">确认</button>
            <button id="auth-reset">忘记密码？</button>
            <button id="auth-cancel">取消</button>
          </div>
        </div>
      </div>
    `);

    const input = dlg.querySelector('#auth-input');
    input.focus();

    function verify() {
      const pw = loadPassword();
      if (input.value === pw) {
        closeDialog(dlg);
        window.PF.startEditMode();
      } else {
        input.value = '';
        input.placeholder = '密码错误';
      }
    }

    dlg.querySelector('#auth-ok').onclick = verify;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') verify(); });

    dlg.querySelector('#auth-reset').onclick = () => {
      closeDialog(dlg);
      showSecurityQuestion();
    };

    dlg.querySelector('#auth-cancel').onclick = () => closeDialog(dlg);
  }

  // ------------------------------
  // 安全问题验证窗口
  // ------------------------------
  function showSecurityQuestion() {
    const dlg = createDialog(`
      <div class="auth-dialog">
        <div class="auth-box">
          <h3>安全问题</h3>
          <p>${SECURITY_Q}</p>
          <input id="sec-input" type="text" placeholder="请输入答案">
          <div class="auth-buttons">
            <button id="sec-ok">确认</button>
            <button id="sec-cancel">取消</button>
          </div>
        </div>
      </div>
    `);

    const input = dlg.querySelector('#sec-input');
    input.focus();

    function verifyA() {
      if (input.value.trim() && btoa(input.value.trim()) === ENC_A) {
        // 重置密码
        savePassword(DEFAULT_PASSWORD);
        alert('密码已重置为：password');
        closeDialog(dlg);
        showPasswordDialog();
      } else {
        input.value = '';
        input.placeholder = '答案错误';
      }
    }

    dlg.querySelector('#sec-ok').onclick = verifyA;
    input.addEventListener('keydown', e => { if (e.key === 'Enter') verifyA(); });

    dlg.querySelector('#sec-cancel').onclick = () => closeDialog(dlg);
  }

  // ------------------------------
  // 三击触发编辑模式
  // ------------------------------
  let lastClickTime = 0;
  let clickCount = 0;

  function onBodyClick(e) {
    // 在可交互元素上点击无效
    if (e.target.closest('button, input, textarea, img, video, a, .sticker')) return;

    const now = Date.now();
    if (now - lastClickTime < EDIT_TRIGGER_DELAY) {
      clickCount++;
    } else {
      clickCount = 1;
    }
    lastClickTime = now;

    if (clickCount === 3) {
      clickCount = 0;
      showPasswordDialog();
    }
  }

  document.addEventListener('click', onBodyClick);

  // ------------------------------
  // 样式注入
  // ------------------------------
  const style = document.createElement('style');
  style.textContent = `
    .auth-dialog {
      position: fixed;
      left: 0; top: 0;
      width: 100%; height: 100%;
      background: rgba(0,0,0,0.4);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 999;
    }
    .auth-box {
      background: white;
      padding: 20px 26px;
      border-radius: 12px;
      width: 320px;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
    }
    .auth-box h3 {
      margin-top: 0;
      margin-bottom: 6px;
      font-size: 1.4rem;
    }
    .auth-box input {
      width: 100%;
      padding: 10px;
      border-radius: 8px;
      margin: 10px 0;
      border: 1px solid #ccc;
    }
    .auth-buttons {
      display: flex;
      justify-content: space-between;
      gap: 10px;
    }
    .auth-buttons button {
      flex: 1;
      padding: 10px 0;
      border-radius: 8px;
      border: none;
      background: var(--m6);
      cursor: pointer;
    }
    .auth-buttons button:hover {
      filter: brightness(1.15);
    }
  `;
  document.head.appendChild(style);

})();
