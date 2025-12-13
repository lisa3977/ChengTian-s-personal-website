// script.js
// 主脚本，整合所有模块

// 莫兰迪色盘
const morandiColors = [
    '#a8d8ea', '#aa96da', '#a8e6cf', '#dcedc1', '#ffd3b6',
    '#ffaaa5', '#ff8c94', '#ffccbc', '#c7ceea', '#b5ead7',
    '#e0bbea', '#f8bbd0'
];

// 装饰几何图形
function createDecorations() {
    const home = document.getElementById('home');
    for (let i = 0; i < 60; i++) {
        const shape = document.createElement('div');
        const shapes = ['circle', 'square', 'triangle'];
        shape.classList.add('decoration', shapes[Math.floor(Math.random() * 3)]);
        shape.style.width = shape.style.height = `${Math.random() * 90 + 30}px`;
        shape.style.background = morandiColors[Math.floor(Math.random() * morandiColors.length)];
        shape.style.position = 'absolute';
        shape.style.left = `${Math.random() * 100}%`;
        shape.style.top = `${Math.random() * 100}%`;
        shape.style.animation = `bezierPath ${Math.random() * 10 + 5}s infinite ease-in-out`;
        home.appendChild(shape);
    }
}

// CSS for decorations
const style = document.createElement('style');
style.innerHTML = `
.decoration {
    opacity: 0.6;
}
.circle { border-radius: 50%; }
.triangle { clip-path: polygon(50% 0%, 0% 100%, 100% 100%); }
@keyframes bezierPath {
    0% { transform: translate(0, 0); }
    25% { transform: translate(50px, -30px); }
    50% { transform: translate(-20px, 50px); }
    75% { transform: translate(30px, 20px); }
    100% { transform: translate(0, 0); }
}
`;
document.head.appendChild(style);

// 导航栏隐藏/显示
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > lastScroll && currentScroll > 100) {
        document.getElementById('navbar').classList.add('hidden');
    } else {
        document.getElementById('navbar').classList.remove('hidden');
    }
    lastScroll = currentScroll;
    highlightNav();
});

// 导航高亮
function highlightNav() {
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        const rect = section.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            document.getElementById(`nav-${section.id}`).classList.add('active');
        }
    });
}

// 区块入场动画
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.section').forEach(section => observer.observe(section));

// CSS for animation
const animStyle = document.createElement('style');
animStyle.innerHTML = `
.animate-in {
    animation: fadeUp 0.6s ease;
}
@keyframes fadeUp {
    from { opacity: 0; transform: translateY(50px); }
    to { opacity: 1; transform: translateY(0); }
}
`;
document.head.appendChild(animStyle);

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    createDecorations();
    initAuth();
    initBlocks();
    initStickers();
    initEditorUI();
    initCursor();
    loadFromLocalStorage();
});

// 保存到localStorage
function saveToLocalStorage() {
    // 保存区块、贴纸、标题等
    const data = {
        blocks: getBlocksData(),
        stickers: getStickersData(),
        designerName: document.getElementById('designer-name').innerText,
        designerColor: document.getElementById('designer-name').style.color,
        subtitle: document.getElementById('subtitle').innerText
    };
    localStorage.setItem('portfolioData', JSON.stringify(data));
}

// 加载从localStorage
function loadFromLocalStorage() {
    const data = JSON.parse(localStorage.getItem('portfolioData'));
    if (data) {
        setBlocksData(data.blocks);
        setStickersData(data.stickers);
        document.getElementById('designer-name').innerText = data.designerName;
        document.getElementById('designer-name').style.color = data.designerColor;
        document.getElementById('subtitle').innerText = data.subtitle;
    }
}

// 首页标题编辑
document.getElementById('designer-name').addEventListener('dblclick', editTitle);
document.getElementById('subtitle').addEventListener('dblclick', editTitle);

function editTitle(e) {
    if (!isEditing) return;
    const input = document.createElement('input');
    input.value = e.target.innerText;
    e.target.innerHTML = '';
    e.target.appendChild(input);
    input.focus();
    input.addEventListener('blur', () => {
        e.target.innerText = input.value;
        saveToLocalStorage();
    });
    if (e.target.id === 'designer-name') {
        // 添加颜色选择器
        const colorPicker = document.createElement('input');
        colorPicker.type = 'color';
        colorPicker.value = rgbToHex(e.target.style.color);
        e.target.appendChild(colorPicker);
        colorPicker.addEventListener('change', () => {
            e.target.style.color = colorPicker.value;
            saveToLocalStorage();
        });
    }
}

function rgbToHex(rgb) {
    if (!rgb) return '#f8bbd0';
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// 移动端适配
if (/Mobi|Android/i.test(navigator.userAgent)) {
    // 禁用粒子等
    document.getElementById('cursor-particle').style.display = 'none';
}