// cursor.js - 几何粒子鼠标特效（修复版）

class SimpleGeometricCursor {
  constructor() {
    this.particle = null;
    this.mouse = { x: 0, y: 0 };
    this.target = { x: 0, y: 0 };
    this.isFalling = false;
    
    // 只在桌面设备启用
    if (window.innerWidth > 768) {
      this.init();
    }
  }

  init() {
    // 创建粒子容器（不隐藏鼠标）
    this.container = document.createElement('div');
    this.container.id = 'geometric-cursor';
    this.container.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(this.container);

    // 创建初始粒子
    this.createParticle();

    // 监听鼠标移动
    document.addEventListener('mousemove', (e) => {
      this.target.x = e.clientX;
      this.target.y = e.clientY;
    });

    // 监听点击
    document.addEventListener('click', () => {
      if (this.particle && !this.isFalling) {
        this.fallAndReplace();
      }
    });

    // 启动动画循环
    this.animate();
  }

  createParticle() {
    const colors = [
      '#ff9aa2', '#ffb7b2', '#ffdac1', '#e2f0cb',
      '#b5eadd', '#c7ceea', '#d6a2e8', '#f8a5c2',
      '#63cdda', '#a29bfe', '#fdcb6e', '#55efc4'
    ];
    
    const shapes = ['circle', 'square', 'triangle'];
    
    const particle = document.createElement('div');
    particle.className = 'geometric-particle';
    
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];
    
    particle.style.cssText = `
      position: absolute;
      width: 24px;
      height: 24px;
      background: ${color};
      border-radius: ${shape === 'circle' ? '50%' : '4px'};
      clip-path: ${shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'};
      transform: translate(-50%, -50%);
      pointer-events: none;
      transition: opacity 0.3s ease;
      opacity: 0;
    `;
    
    this.container.appendChild(particle);
    this.particle = particle;
    
    // 淡入效果
    setTimeout(() => {
      if (this.particle) {
        this.particle.style.opacity = '1';
      }
    }, 10);
  }

  animate() {
    if (!this.particle || this.isFalling) {
      requestAnimationFrame(() => this.animate());
      return;
    }

    // 弹簧跟随算法（平滑）
    const dx = this.target.x - this.mouse.x;
    const dy = this.target.y - this.mouse.y;
    this.mouse.x += dx * 0.2; // 跟随系数
    this.mouse.y += dy * 0.2;
    
    this.particle.style.left = this.mouse.x + 'px';
    this.particle.style.top = this.mouse.y + 'px';
    
    requestAnimationFrame(() => this.animate());
  }

  fallAndReplace() {
    if (!this.particle) return;
    
    this.isFalling = true;
    
    // 开始下落动画
    let y = this.mouse.y;
    const fall = () => {
      y += 3; // 下落速度
      this.particle.style.top = y + 'px';
      this.particle.style.opacity = Math.max(0, 1 - (y - this.mouse.y) / 200);
      
      if (y < window.innerHeight + 100) {
        requestAnimationFrame(fall);
      } else {
        // 粒子消失，创建新的
        this.particle.remove();
        this.particle = null;
        this.isFalling = false;
        this.createParticle();
      }
    };
    
    fall();
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new SimpleGeometricCursor();
});
