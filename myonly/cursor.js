/**
 * 鼠标粒子特效管理器
 * 处理鼠标跟随粒子、点击交互、悬停提示等特效
 */
class CursorParticleManager {
    constructor() {
        this.particles = [];
        this.maxParticles = 10;
        this.mainParticle = null;
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        this.init();
    }

    /**
     * 初始化粒子系统
     */
    init() {
        if (this.isMobile) {
            // 移动设备禁用复杂粒子特效
            console.log('移动设备检测到，禁用鼠标粒子特效');
            return;
        }

        this.createMainParticle();
        this.bindEvents();
        this.startAnimation();
    }

    /**
     * 创建主粒子
     */
    createMainParticle() {
        this.mainParticle = this.createParticle({
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            isMain: true
        });
    }

    /**
     * 创建粒子
     */
    createParticle(options = {}) {
        const particle = {
            id: Date.now() + Math.random(),
            x: options.x || 0,
            y: options.y || 0,
            vx: 0,
            vy: 0,
            size: options.size || this.getRandomSize(),
            color: options.color || this.getRandomColor(),
            shape: options.shape || this.getRandomShape(),
            opacity: 1,
            state: 'alive', // alive, dying, dead
            isMain: options.isMain || false,
            element: null,
            spring: 0.1,
            friction: 0.85,
            deathTimer: 0,
            hoverTarget: null,
            isHovering: false
        };

        // 创建DOM元素
        particle.element = document.createElement('div');
        particle.element.className = 'cursor-particle';
        particle.element.style.cssText = `
            position: fixed;
            width: ${particle.size}px;
            height: ${particle.size}px;
            background-color: ${particle.color};
            border-radius: ${particle.shape === 'circle' ? '50%' : particle.shape === 'triangle' ? '0' : '4px'};
            pointer-events: none;
            z-index: 9999;
            transform: translate(-50%, -50%);
            opacity: ${particle.opacity};
            transition: opacity 0.2s ease;
        `;

        // 三角形特殊处理
        if (particle.shape === 'triangle') {
            particle.element.style.width = '0';
            particle.element.style.height = '0';
            particle.element.style.borderLeft = `${particle.size / 2}px solid transparent`;
            particle.element.style.borderRight = `${particle.size / 2}px solid transparent`;
            particle.element.style.borderBottom = `${particle.size}px solid ${particle.color}`;
            particle.element.style.background = 'none';
            particle.element.style.borderRadius = '0';
        }

        document.body.appendChild(particle.element);
        this.updateParticlePosition(particle);

        if (!particle.isMain) {
            this.particles.push(particle);
        }

        return particle;
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        // 鼠标移动
        document.addEventListener('mousemove', (e) => {
            this.handleMouseMove(e);
        });

        // 鼠标点击
        document.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // 左键点击
                this.handleMouseClick(e);
            }
        });

        // 鼠标悬停检测
        document.addEventListener('mouseover', (e) => {
            this.handleMouseOver(e);
        });

        document.addEventListener('mouseout', (e) => {
            this.handleMouseOut(e);
        });

        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.cleanupOffscreenParticles();
        });
    }

    /**
     * 处理鼠标移动
     */
    handleMouseMove(e) {
        if (!this.mainParticle) return;

        // 弹簧物理算法实现Q弹跟随效果
        const dx = e.clientX - this.mainParticle.x;
        const dy = e.clientY - this.mainParticle.y;

        this.mainParticle.vx += dx * this.mainParticle.spring;
        this.mainParticle.vy += dy * this.mainParticle.spring;
        this.mainParticle.vx *= this.mainParticle.friction;
        this.mainParticle.vy *= this.mainParticle.friction;

        this.mainParticle.x += this.mainParticle.vx;
        this.mainParticle.y += this.mainParticle.vy;

        this.updateParticlePosition(this.mainParticle);
    }

    /**
     * 处理鼠标点击
     */
    handleMouseClick(e) {
        if (!this.mainParticle) return;

        // 主粒子进入死亡状态
        this.mainParticle.state = 'dying';
        this.mainParticle.deathTimer = 200; // 200ms僵直时间

        // 创建新粒子
        setTimeout(() => {
            this.createNewMainParticle(e.clientX, e.clientY);
        }, 200);

        // 创建下落粒子
        const fallingParticle = this.createParticle({
            x: this.mainParticle.x,
            y: this.mainParticle.y,
            size: this.mainParticle.size,
            color: this.mainParticle.color,
            shape: this.mainParticle.shape
        });

        // 设置下落动画
        fallingParticle.state = 'falling';
        fallingParticle.vy = 50; // 50px/秒下落速度
    }

    /**
     * 处理鼠标悬停
     */
    handleMouseOver(e) {
        if (!this.mainParticle) return;

        const target = e.target;
        const isClickable = target.matches('a, button, [role="button"], .clickable, .editable, .function-option, .delete-block-btn, .font-size-btn, .color-option, .link-btn, .apply-link-btn, .save-title-btn, .cancel-title-btn, .function-menu-toggle, .exit-edit-btn');

        if (isClickable && !this.mainParticle.isHovering) {
            this.mainParticle.isHovering = true;
            this.mainParticle.hoverTarget = target;
            this.enterHoverState();
        }
    }

    /**
     * 处理鼠标移出
     */
    handleMouseOut(e) {
        if (!this.mainParticle) return;

        const target = e.target;
        if (this.mainParticle.hoverTarget === target && this.mainParticle.isHovering) {
            this.mainParticle.isHovering = false;
            this.mainParticle.hoverTarget = null;
            this.exitHoverState();
        }
    }

    /**
     * 进入悬停状态（预警状态）
     */
    enterHoverState() {
        if (!this.mainParticle) return;

        // 粒子缩小至4px并快速抖动
        this.mainParticle.element.style.width = '4px';
        this.mainParticle.element.style.height = '4px';
        this.mainParticle.element.style.backgroundColor = '#ff6b6b'; // 警示红色
        
        // 三角形特殊处理
        if (this.mainParticle.shape === 'triangle') {
            this.mainParticle.element.style.borderLeft = '2px solid transparent';
            this.mainParticle.element.style.borderRight = '2px solid transparent';
            this.mainParticle.element.style.borderBottom = '4px solid #ff6b6b';
        }

        // 快速抖动动画
        this.mainParticle.element.style.animation = 'particleShake 0.1s infinite alternate';
    }

    /**
     * 退出悬停状态
     */
    exitHoverState() {
        if (!this.mainParticle) return;

        // 恢复原始大小和颜色
        this.mainParticle.element.style.width = `${this.mainParticle.size}px`;
        this.mainParticle.element.style.height = `${this.mainParticle.size}px`;
        this.mainParticle.element.style.backgroundColor = this.mainParticle.color;
        
        // 三角形特殊处理
        if (this.mainParticle.shape === 'triangle') {
            this.mainParticle.element.style.borderLeft = `${this.mainParticle.size / 2}px solid transparent`;
            this.mainParticle.element.style.borderRight = `${this.mainParticle.size / 2}px solid transparent`;
            this.mainParticle.element.style.borderBottom = `${this.mainParticle.size}px solid ${this.mainParticle.color}`;
        }

        // 停止抖动动画
        this.mainParticle.element.style.animation = '';
    }

    /**
     * 创建新的主粒子
     */
    createNewMainParticle(x, y) {
        // 移除旧的主粒子
        if (this.mainParticle && this.mainParticle.element) {
            this.mainParticle.element.remove();
        }

        // 创建新的主粒子
        this.mainParticle = this.createParticle({
            x: x,
            y: y,
            isMain: true
        });

        // 淡入效果
        this.mainParticle.element.style.opacity = '0';
        setTimeout(() => {
            if (this.mainParticle && this.mainParticle.element) {
                this.mainParticle.element.style.opacity = '1';
            }
        }, 10);
    }

    /**
     * 更新粒子位置
     */
    updateParticlePosition(particle) {
        if (!particle.element) return;

        particle.element.style.left = `${particle.x}px`;
        particle.element.style.top = `${particle.y}px`;
    }

    /**
     * 动画循环
     */
    startAnimation() {
        const animate = () => {
            this.updateParticles();
            this.cleanupParticles();
            requestAnimationFrame(animate);
        };
        animate();
    }

    /**
     * 更新所有粒子
     */
    updateParticles() {
        // 更新主粒子状态
        if (this.mainParticle) {
            this.updateMainParticle();
        }

        // 更新其他粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            this.updateParticle(particle);
        }
    }

    /**
     * 更新主粒子
     */
    updateMainParticle() {
        if (this.mainParticle.state === 'dying') {
            this.mainParticle.deathTimer -= 16; // 假设60fps
            if (this.mainParticle.deathTimer <= 0) {
                this.mainParticle.state = 'dead';
            }
        }
    }

    /**
     * 更新单个粒子
     */
    updateParticle(particle) {
        if (particle.state === 'falling') {
            // 垂直下落
            particle.y += particle.vy / 60; // 转换为每帧移动距离
            this.updateParticlePosition(particle);

            // 检查是否超出屏幕
            if (particle.y > window.innerHeight + particle.size) {
                particle.state = 'dead';
            }
        }

        // 更新透明度
        if (particle.state === 'dead') {
            particle.opacity -= 0.05;
            if (particle.element) {
                particle.element.style.opacity = particle.opacity;
            }
        }
    }

    /**
     * 清理粒子
     */
    cleanupParticles() {
        // 清理死亡粒子
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (particle.state === 'dead' && particle.opacity <= 0) {
                if (particle.element) {
                    particle.element.remove();
                }
                this.particles.splice(i, 1);
            }
        }

        // 确保不超过最大粒子数
        while (this.particles.length > this.maxParticles) {
            const particle = this.particles.shift();
            if (particle && particle.element) {
                particle.element.remove();
            }
        }
    }

    /**
     * 清理超出屏幕的粒子
     */
    cleanupOffscreenParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            
            if (particle.y > window.innerHeight + 100 || 
                particle.y < -100 || 
                particle.x > window.innerWidth + 100 || 
                particle.x < -100) {
                
                if (particle.element) {
                    particle.element.remove();
                }
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * 获取随机尺寸（30px至120px）
     */
    getRandomSize() {
        return Math.floor(Math.random() * 91) + 30; // 30-120
    }

    /**
     * 获取随机颜色（12色莫兰迪活力色盘）
     */
    getRandomColor() {
        const colors = [
            '#e57373', // 莫兰迪红
            '#f06292', // 莫兰迪粉
            '#ba68c8', // 莫兰迪紫
            '#9575cd', // 莫兰迪紫蓝
            '#7986cb', // 莫兰迪蓝
            '#64b5f6', // 莫兰迪天蓝
            '#4fc3f7', // 莫兰迪浅蓝
            '#4dd0e1', // 莫兰迪青
            '#4db6ac', // 莫兰迪绿青
            '#81c784', // 莫兰迪绿
            '#aed581', // 莫兰迪浅绿
            '#ffd54f', // 莫兰迪黄
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    /**
     * 获取随机形状
     */
    getRandomShape() {
        const shapes = ['circle', 'square', 'triangle'];
        return shapes[Math.floor(Math.random() * shapes.length)];
    }

    /**
     * 启用粒子特效
     */
    enable() {
        if (this.isMobile) return;
        
        if (!this.mainParticle) {
            this.createMainParticle();
        }
        
        // 显示所有粒子
        if (this.mainParticle && this.mainParticle.element) {
            this.mainParticle.element.style.display = 'block';
        }
        
        this.particles.forEach(particle => {
            if (particle.element) {
                particle.element.style.display = 'block';
            }
        });
    }

    /**
     * 禁用粒子特效
     */
    disable() {
        // 隐藏所有粒子
        if (this.mainParticle && this.mainParticle.element) {
            this.mainParticle.element.style.display = 'none';
        }
        
        this.particles.forEach(particle => {
            if (particle.element) {
                particle.element.style.display = 'none';
            }
        });
    }

    /**
     * 销毁粒子系统
     */
    destroy() {
        // 移除所有粒子元素
        if (this.mainParticle && this.mainParticle.element) {
            this.mainParticle.element.remove();
        }
        
        this.particles.forEach(particle => {
            if (particle.element) {
                particle.element.remove();
            }
        });
        
        this.particles = [];
        this.mainParticle = null;
    }
}

// 导出到全局对象
window.CursorParticleManager = CursorParticleManager;

// 添加抖动动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes particleShake {
        0% { transform: translate(-50%, -50%) translateX(-1px); }
        100% { transform: translate(-50%, -50%) translateX(1px); }
    }
`;
document.head.appendChild(style);
