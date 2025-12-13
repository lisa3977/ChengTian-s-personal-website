/**
 * 认证模块 - 处理编辑模式的密码认证
 */

// 认证状态
const AuthState = {
    isAuthenticated: false,
    maxAttempts: 3,
    attempts: 0,
    lockUntil: null
};

// 检查是否被锁定
function isLocked() {
    if (AuthState.lockUntil) {
        const now = Date.now();
        if (now < AuthState.lockUntil) {
            const remainingMinutes = Math.ceil((AuthState.lockUntil - now) / (1000 * 60));
            return {
                locked: true,
                remainingMinutes: remainingMinutes
            };
        } else {
            // 锁定时间已过，重置
            AuthState.lockUntil = null;
            AuthState.attempts = 0;
        }
    }
    return { locked: false };
}

// 验证密码
function validatePassword(password) {
    // 检查是否被锁定
    const lockStatus = isLocked();
    if (lockStatus.locked) {
        return {
            success: false,
            message: `账户已被锁定，请${lockStatus.remainingMinutes}分钟后再试`
        };
    }
    
    // 简单密码验证（实际应用中应该从服务器验证）
    const correctPassword = '123456'; // 默认密码
    
    if (password === correctPassword) {
        AuthState.isAuthenticated = true;
        AuthState.attempts = 0;
        return {
            success: true,
            message: '认证成功'
        };
    } else {
        AuthState.attempts++;
        
        if (AuthState.attempts >= AuthState.maxAttempts) {
            // 锁定账户15分钟
            AuthState.lockUntil = Date.now() + (15 * 60 * 1000);
            return {
                success: false,
                message: '密码错误次数过多，账户已被锁定15分钟'
            };
        }
        
        const remainingAttempts = AuthState.maxAttempts - AuthState.attempts;
        return {
            success: false,
            message: `密码错误，还剩${remainingAttempts}次尝试机会`
        };
    }
}

// 登出
function logout() {
    AuthState.isAuthenticated = false;
    return {
        success: true,
        message: '已退出编辑模式'
    };
}

// 检查认证状态
function checkAuth() {
    return AuthState.isAuthenticated;
}

// 重置密码（模拟）
function resetPassword(email) {
    // 在实际应用中，这里应该发送重置密码邮件
    console.log(`密码重置请求已发送到: ${email}`);
    return {
        success: true,
        message: '重置密码链接已发送到您的邮箱'
    };
}

// 导出函数
window.AuthModule = {
    validatePassword,
    logout,
    checkAuth,
    resetPassword,
    isLocked
};
