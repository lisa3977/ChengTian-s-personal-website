// 全局变量
let currentSection = 'home';
let isAuthenticated = false;
let boxes = [];
let uploadInput = null;
let authInput = null;
let authForm = null;

// 初始化函数
function init() {
    // 初始化上传功能
    initUpload();
    // 初始化身份认证
    initAuth();
    // 初始化方框页
    initBoxes();
    // 初始化滑动动画
    initAnimations();
}

// 初始化上传功能
function initUpload() {
    // 获取上传输入框
    uploadInput = document.getElementById('uploadInput');
    if (uploadInput) {
        uploadInput.addEventListener('change', handleUpload);
    }

    // 添加上传按钮
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', handleUpload);
    }
}

// 处理上传
function handleUpload(e) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // 遍历文件
    for (let file of files) {
        // 创建新方框页
        const box = createBoxPage(file.name, file.type);
        boxes.push(box);
        // 添加到页面
        document.getElementById('contentArea').appendChild(box);
    }
}

// 创建方框页
function createBoxPage(title, type) {
    const box = document.createElement('div');
    box.className = 'box-page';
    box.innerHTML = `
        <div class="box-header">
            <h3>${title}</h3>
            <button class="btn-edit">编辑</button>
            <button class="btn-delete">删除</button>
        </div>
        <div class="box-body">
            <p>文件类型: ${type}</p>
            <p>文件大小: ${formatFileSize(file.size)}</p>
            <div class="box-content">
                <textarea placeholder="输入内容..."></textarea>
            </div>
        </div>
    `;
    return box;
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 初始化身份认证
function initAuth() {
    // 获取身份认证表单
    authForm = document.getElementById('authForm');
    if (authForm) {
        authForm.addEventListener('submit', handleAuth);
    }

    // 获取输入框
    authInput = document.getElementById('authInput');
    if (authInput) {
        authInput.addEventListener('input', checkAuth);
    }
}

// 处理身份认证
function handleAuth(e) {
    e.preventDefault();
    const password = authInput.value;
    if (password === 'password') {
        isAuthenticated = true;
        alert('身份认证成功！');
        // 可以在这里添加更多功能，如解锁页面
        document.getElementById('contentArea').style.display = 'block';
    } else {
        alert('密码错误！');
    }
}

// 检查身份认证
function checkAuth() {
    if (authInput.value === 'password') {
        // 可以在这里添加更多功能，如解锁页面
        document.getElementById('contentArea').style.display = 'block';
    }
}

// 初始化方框页
function initBoxes() {
    // 创建空白方框页
    const blankBox = createBoxPage('空白方框页', 'text/plain');
    document.getElementById('contentArea').appendChild(blankBox);
    boxes.push(blankBox);
}

// 初始化滑动动画
function initAnimations() {
    // 首页淡入淡出
    const homeSection = document.getElementById('home');
    if (homeSection) {
        homeSection.classList.add('fade-in');
        setTimeout(() => {
            homeSection.classList.add('active');
        }, 500);
    }

    // 其他页面淡入淡出
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.classList.add('fade-in');
        setTimeout(() => {
            section.classList.add('active');
        }, 500);
    });
}

// 重置页面
function resetPage() {
    // 清空所有方框页
    boxes.forEach(box => box.remove());
    boxes = [];
}

// 启动初始化
document.addEventListener('DOMContentLoaded', init);
