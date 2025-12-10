// admin/auth.js - 身份认证系统

const ADMIN_PASSWORD_KEY = 'portfolio_admin_password';
const DEFAULT_PASSWORD = 'password';

// 初始化密码（首次访问时设置）
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

// 忘记密码 - 打开邮件客户端
function forgotPassword() {
    const mailto = `mailto:2019818415@qq.com?subject=Portfolio%20Password%20Reset&body=Hello,%20I%20forgot%20my%20portfolio%20password.%20Please%20help.`;
    window.open(mailto, '_blank');
}
