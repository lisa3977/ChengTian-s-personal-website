// script.js - 基础页面交互

// 导航栏滚动效果
let lastScrollY = 0;
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.style.padding = '8px 5%';
        navbar.style.background = 'rgba(255, 255, 255, 0.9)';
    } else {
        navbar.style.padding = '12px 5%';
        navbar.style.background = 'rgba(255, 255, 255, 0.7)';
    }
});

// 首页漂浮图形（简化版）
document.addEventListener('DOMContentLoaded', () => {
    const shapesContainer = document.querySelector('.floating-shapes');
    const colors = [
        'var(--accent-pink)', 
        'var(--accent-blue)', 
        'var(--accent-yellow)', 
        'var(--accent-purple)',
        'var(--gold)'
    ];
    
    for (let i = 0; i < 6; i++) {
        const shape = document.createElement('div');
        shape.style.cssText = `
            position: absolute;
            width: 60px;
            height: 60px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            border-radius: ${Math.random() > 0.5 ? '50%' : '8px'};
            opacity: 0.7;
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            animation: float${i} ${15 + Math.random() * 10}s infinite ease-in-out;
        `;
        shapesContainer.appendChild(shape);
        
        // 动态生成关键帧
        const style = document.createElement('style');
        style.innerHTML = `
            @keyframes float${i} {
                0%, 100% { transform: translate(0, 0); }
                25% { transform: translate(${20 - Math.random() * 40}px, ${20 - Math.random() * 40}px); }
                50% { transform: translate(${40 - Math.random() * 80}px, ${40 - Math.random() * 80}px); }
                75% { transform: translate(${20 - Math.random() * 40}px, ${20 - Math.random() * 40}px); }
            }
        `;
        document.head.appendChild(style);
    }
});
