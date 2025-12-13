// 鼠标粒子系统 - 个人博客可视化编辑展示网站
class CursorParticleSystem {
    constructor() {
        this.particles = [];
        this.maxParticles = 15;
        this.mainParticle = null;
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        this.isEditMode = false;
        
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
        
        // 监听编辑模式变化
        this.listenToEditModeChanges();
    }
    
    createMainParticle() {
        const container = document.getElementById('cursor-particle-container');
        if (!container) {
            // 创建容器
            const newContainer = document.createElement('div');
            newContainer.id = 'cursor-particle-container';
            newContainer.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                z-index: 9999;
            `;
            document.body.appendChild(newContainer);
            this.container = newContainer;
        } else {
            this.container = container;
        }
        
        this.mainParticle = this.createParticle(this.container, 20);
        this.mainParticle.element.style.opacity = '0.7';
        this.mainParticle.element.style.zIndex = '10001';
        this.mainParticle.element.style.transition = 'all 0.3s ease';
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
            state: 'alive', // alive, dying, dead, falling
            fallSpeed: 0,
            opacity: 0.7,
            rotation: 0,
            scale: 1
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
                transition: all 0.3s ease;
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
                transition: all 0.3s ease;
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
        this.mainParticle.element.style.transform = `translate(-50%, -50%) rotate(${this.mainParticle.rotation}deg) scale(${this.mainParticle.scale})`;
    }
    
    handleClick(e) {
        if (!this.mainParticle) return;
        
        // 创建点击粒子效果
        this.createClickEffect(e.clientX, e.clientY);
        
        // 如果点击的是可编辑元素，改变主粒子样式
        const target = e.target;
        if (target.closest('.project-block') || target.closest('.sticker')) {
            this.mainParticle.element.style.background = '#ff6b6b';
            this.mainParticle.element.style.transform = `translate(-50%, -50%) scale(1.5)`;
            
            setTimeout(() => {
                if (this.mainParticle && this.mainParticle.element) {
                    this.mainParticle.element.style.background = this.mainParticle.color;
                    this.mainParticle.element.style.transform = `translate(-50%, -50%) scale(1)`;
                }
            }, 300);
        }
    }
    
    createClickEffect(x, y) {
        if (!this.container) return;
        
        // 创建多个小粒子
        for (let i = 0; i < 5; i++) {
            const particle = this.createParticle(this.container, 8 + Math.random() * 8);
            particle.x = x;
            particle.y = y;
            particle.state = 'exploding';
            
            // 随机方向
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 3;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            
            // 添加到粒子数组
            this.particles.push(particle);
            
            // 设置粒子消失
            setTimeout(() => {
                particle.state = 'fading';
                particle.element.style.opacity = '0';
                
                setTimeout(() => {
                    if (particle.element) {
                        particle.element.remove();
                    }
                    const index = this.particles.indexOf(particle);
                    if (index > -1) {
                        this.particles.splice(index, 1);
                    }
                }, 500);
            }, 800 + Math.random() * 400);
        }
    }
    
    initHoverEffects() {
        // 项目块悬停效果
        document.addEventListener('mouseover', (e) => {
            const target = e.target;
            
            if (target.closest('.project-block')) {
                if (this.mainParticle) {
                    this.mainParticle.scale = 1.3;
                    this.mainParticle.element.style.background = '#4ecdc4';
                }
            } else if (target.closest('.sticker')) {
                if (this.mainParticle) {
                    this.mainParticle.scale = 0.8;
                    this.mainParticle.element.style.background = '#ff6b6b';
                }
            } else if (target.closest('a, button')) {
                if (this.mainParticle) {
                    this.mainParticle.scale = 1.5;
                    this.mainParticle.element.style.background = '#45b7d1';
                }
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            const target = e.target;
            
            if (target.closest('.project-block') || 
                target.closest('.sticker') || 
                target.closest('a, button')) {
                if (this.mainParticle) {
                    this.mainParticle.scale = 1;
                    this.mainParticle.element.style.background = this.mainParticle.color;
                }
            }
        });
    }
    
    listenToEditModeChanges() {
        // 监听编辑模式变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    const target = mutation.target;
                    if (target.id === 'sort-panel' || target.id === 'editor-menu') {
                        this.isEditMode = !target.classList.contains('hidden');
                        this.updateCursorForEditMode();
                    }
                }
            });
        });
        
        // 观察编辑UI元素
        const sortPanel = document.getElementById('sort-panel');
        const editorMenu = document.getElementById('editor-menu');
        
        if (sortPanel) {
            observer.observe(sortPanel, { attributes: true });
            this.isEditMode = !sortPanel.classList.contains('hidden');
        }
        
        if (editorMenu) {
            observer.observe(editorMenu, { attributes: true });
            this.isEditMode = !editorMenu.classList.contains('hidden');
        }
        
        this.updateCursorForEditMode();
    }
    
    updateCursorForEditMode() {
        if (!this.mainParticle) return;
        
        if (this.isEditMode) {
            // 编辑模式：粒子变为编辑样式
            this.mainParticle.element.style.border = '2px solid #4ecdc4';
            this.mainParticle.element.style.boxShadow = '0 0 10px rgba(78, 205, 196, 0.5)';
            this.mainParticle.color = '#4ecdc4';
            this.mainParticle.element.style.background = '#4ecdc4';
        } else {
            // 预览模式：粒子恢复普通样式
            this.mainParticle.element.style.border = 'none';
            this.mainParticle.element.style.boxShadow = 'none';
            this.mainParticle.color = this.getRandomColor();
            this.mainParticle.element.style.background = this.mainParticle.color;
        }
    }
    
    getRandomColor() {
        // 使用莫兰迪色系
        const colors = [
            '#E8B4B8', '#A5C9CA', '#B5D5C5', '#F7DCB9', '#D0B8D8',
            '#F3B7A0', '#E8A2A2', '#B8E1DD', '#D7C0AE', '#C4C4C4',
            '#8BA6B1', '#C8E6C9', '#000000', '#FFFFFF'
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
            if (particle.state === 'exploding') {
                // 爆炸效果
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // 减速
                particle.vx *= 0.95;
                particle.vy *= 0.95;
                
                // 缩小
                particle.scale *= 0.98;
                
                particle.element.style.left = `${particle.x}px`;
                particle.element.style.top = `${particle.y}px`;
                particle.element.style.transform = `translate(-50%, -50%) scale(${particle.scale})`;
            } else if (particle.state === 'falling') {
                // 下落效果
                particle.y += particle.fallSpeed / 60;
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
    // 只在非移动设备上初始化
    if (!/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) {
        window.cursorParticleSystem = new CursorParticleSystem();
    }
});
