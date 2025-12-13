// 鼠标粒子系统
class CursorParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 10;
        this.mainParticle = null;
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (!this.isMobile) {
            this.init();
        }
    }
    
    init() {
        // 创建主粒子
        this.createMainParticle();
        
        // 鼠标移动监听
        document.addEventListener('mousemove', (e) => {
            this.updateMainParticle(e);
        });
        
        // 鼠标点击监听
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // 左键
                this.handleClick(e);
            }
        });
        
        // 悬停监听
        this.initHoverEffects();
        
        // 动画循环
        this.animate();
    }
    
    createMainParticle() {
        const container = document.getElementById('cursor-particle-container');
        if (!container) return;
        
        this.mainParticle = this.createParticle(container, 20);
        this.mainParticle.element.style.opacity = '0.7';
        this.mainParticle.element.style.zIndex = '10001';
    }
    
    createParticle(container, size = 15) {
        const particle = {
            element: null,
            x: 0,
            y: 0,
            targetX: 0,
            targetY: 0,
            vx: 0,
            vy: 0,
            size: size,
            color: this.getRandomColor(),
            shape: this.getRandomShape(),
            state: 'alive', // alive, dying, dead
            fallSpeed: 0,
            opacity: 0.7,
            rotation: 0
        };
        
        const element = document.createElement('div');
        element.className = `particle ${particle.shape}`;
        
        if (particle.shape === 'triangle') {
            element.style.cssText = `
                position: absolute;
                width: 0;
                height: 0;
                border-left: ${particle.size/2}px solid transparent;
                border-right: ${particle.size/2}px solid transparent;
                border-bottom: ${particle.size}px solid ${particle.color};
                background: none !important;
                pointer-events: none;
                transform: translate(-50%, -50%);
                opacity: ${particle.opacity};
            `;
        } else {
            element.style.cssText = `
                position: absolute;
                width: ${particle.size}px;
                height: ${particle.size}px;
                background: ${particle.color};
                border-radius: ${particle.shape === 'circle' ? '50%' : '4px'};
                pointer-events: none;
                transform: translate(-50%, -50%);
                opacity: ${particle.opacity};
            `;
        }
        
        container.appendChild(element);
        particle.element = element;
        
        return particle;
    }
    
    updateMainParticle(e) {
        if (!this.mainParticle) return;
        
        // 弹簧物理效果
        const dx = e.clientX - this.mainParticle.x;
        const dy = e.clientY - this.mainParticle.y;
        
        this.mainParticle.vx += dx * 0.1;
        this.mainParticle.vy += dy * 0.1;
        
        // 阻尼
        this.mainParticle.vx *= 0.8;
        this.mainParticle.vy *= 0.8;
        
        this.mainParticle.x += this.mainParticle.vx;
        this.mainParticle.y += this.mainParticle.vy;
        
        // 更新位置
        this.mainParticle.element.style.left = `${this.mainParticle.x}px`;
        this.mainParticle.element.style.top = `${this.mainParticle.y}px`;
        
        // 轻微旋转
        this.mainParticle.rotation += 0.5;
        this.mainParticle.element.style.transform = `translate(-50%, -50%) rotate(${this.mainParticle.rotation}deg)`;
    }
    
    handleClick(e) {
        if (!this.mainParticle) return;
        
        // 主粒子进入死亡状态
        this.mainParticle.state = 'dying';
        this.mainParticle.fallSpeed = 0;
        
        // 200ms僵直
        setTimeout(() => {
            this.mainParticle.state = 'falling';
            this.mainParticle.fallSpeed = 50; // px/秒
        }, 200);
        
        // 创建新粒子
        const container = document.getElementById('cursor-particle-container');
        if (!container) return;
        
        const newParticle = this.createParticle(container, 20);
        
        // 淡入动画
        newParticle.element.style.opacity = '0';
        newParticle.x = e.clientX;
        newParticle.y = e.clientY;
        newParticle.targetX = e.clientX;
        newParticle.targetY = e.clientY;
        
        // 淡入
        let opacity = 0;
        const fadeIn = () => {
            opacity += 0.05;
            newParticle.element.style.opacity = opacity.toString();
            
            if (opacity < 0.7) {
                requestAnimationFrame(fadeIn);
            }
        };
        fadeIn();
        
        // 替换主粒子
        setTimeout(() => {
            if (this.mainParticle.element) {
                this.mainParticle.element.remove();
            }
            this.mainParticle = newParticle;
        }, 200);
    }
    
    initHoverEffects() {
        const clickableElements = document.querySelectorAll('a, button, [data-clickable]');
        
        clickableElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (this.mainParticle) {
                    this.mainParticle.element.style.width = '4px';
                    this.mainParticle.element.style.height = '4px';
                    this.mainParticle.element.style.background = '#ff6b6b';
                    this.mainParticle.element.classList.add('warning');
                }
            });
            
            el.addEventListener('mouseleave', () => {
                if (this.mainParticle) {
                    this.mainParticle.element.style.width = '20px';
                    this.mainParticle.element.style.height = '20px';
                    this.mainParticle.element.style.background = this.mainParticle.color;
                    this.mainParticle.element.classList.remove('warning');
                }
            });
        });
    }
    
    getRandomColor() {
        const colors = [
            '#E8B4B8', '#A5C9CA', '#B5D5C5', '#F7DCB9', '#D0B8D8',
            '#F3B7A0', '#E8A2A2', '#B8E1DD', '#D7C0AE', '#C4C4C4',
            '#8BA6B1', '#C8E6C9'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    getRandomShape() {
        const shapes = ['circle', 'square', 'triangle'];
        return shapes[Math.floor(Math.random() * shapes.length)];
    }
    
    animate() {
        // 更新所有粒子
        this.particles.forEach((particle, index) => {
            if (particle.state === 'falling') {
                particle.y += particle.fallSpeed / 60; // 60fps
                particle.element.style.top = `${particle.y}px`;
                
                // 如果落出屏幕，移除
                if (particle.y > window.innerHeight + 100) {
                    if (particle.element) {
                        particle.element.remove();
                    }
                    this.particles.splice(index, 1);
                }
            }
        });
        
        // 清理超出数量的粒子
        if (this.particles.length > this.maxParticles) {
            const toRemove = this.particles.splice(0, this.particles.length - this.maxParticles);
            toRemove.forEach(p => {
                if (p.element) p.element.remove();
            });
        }
        
        requestAnimationFrame(() => this.animate());
    }
}

// 初始化粒子系统
document.addEventListener('DOMContentLoaded', () => {
    new CursorParticleSystem();
});