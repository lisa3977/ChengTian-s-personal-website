// script.js - 基础交互与动画

let lastScrollY = 0;

// 导航栏 S 型隐藏
window.addEventListener('scroll', () => {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  
  if (window.scrollY > 100 && window.scrollY > lastScrollY) {
    // 向下滑动 -> 隐藏
    navbar.style.transform = 'translateY(-100%)';
  } else {
    // 向上滑动或顶部 -> 显示
    navbar.style.transform = 'translateY(0)';
  }
  lastScrollY = window.scrollY;
});

// 首页漂浮图形
function createFloatingShapes() {
  const container = document.getElementById('floating-container');
  if (!container) return;
  
  const colors = [
    '#ff9aa2','#ffb7b2','#ffdac1','#e2f0cb',
    '#b5eadd','#c7ceea','#d6a2e8','#f8a5c2',
    '#63cdda','#a29bfe','#fdcb6e','#55efc4'
  ];
  
  for (let i = 0; i < 60; i++) {
    const shape = document.createElement('div');
    shape.className = 'floating-shape';
    
    // 随机大小
    const size = 30 + Math.random() * 90;
    shape.style.width = `${size}px`;
    shape.style.height = `${size}px`;
    
    // 随机颜色
    shape.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    
    // 随机形状
    const shapeType = Math.random();
    if (shapeType > 0.7) {
      shape.style.borderRadius = '50%'; // 圆形
    } else if (shapeType > 0.4) {
      shape.style.clipPath = 'polygon(50% 0%, 0% 100%, 100% 100%)'; // 三角形
    }
    // 其他为方形（默认）
    
    // 随机位置
    shape.style.left = `${Math.random() * 100}%`;
    shape.style.top = `${Math.random() * 100}%`;
    shape.style.opacity = 0.5 + Math.random() * 0.4;
    
    // 随机动画
    const duration = 20 + Math.random() * 30;
    const x = (Math.random() - 0.5) * 300;
    const y = (Math.random() - 0.5) * 300;
    
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes float${i} {
        0%, 100% { transform: translate(0, 0); }
        25% { transform: translate(${x}px, ${y}px); }
        50% { transform: translate(${x*1.2}px, ${y*1.2}px); }
        75% { transform: translate(${x*0.8}px, ${y*0.8}px); }
      }
    `;
    document.head.appendChild(style);
    
    shape.style.animation = `float${i} ${duration}s infinite linear`;
    container.appendChild(shape);
  }
}

// 区块入场动画
function initScrollAnimations() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });
  
  document.querySelectorAll('.block').forEach(block => {
    block.style.opacity = '0';
    block.style.transform = 'translateY(20px)';
    block.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(block);
  });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  createFloatingShapes();
  initScrollAnimations();
  
  // 确保退出编辑按钮存在
  if (!document.getElementById('exit-edit-btn')) {
    console.warn('Exit edit button not found');
  }
});
