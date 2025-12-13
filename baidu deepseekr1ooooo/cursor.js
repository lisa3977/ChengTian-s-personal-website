class CursorEffect {
    constructor() {
        this.particles = [];
        this.maxParticles = 10;
        this.mainParticle = null;
        this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        this.canvas = null;
        this.ctx = null;
        
        if (!this.isMobile) {
            this.initialize();
        }
    }
    
    initialize() {
        this.createCanvas();
        this.createMainParticle();
        this.setupEventListeners();
        this.animate();
    }
    
    createCanvas() {
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.width = '100%';
        this.canvas.style.height = '100%';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        
        document.body.appendChild(this.canvas);
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createMainParticle() {
        this.mainParticle = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            targetX: window.innerWidth / 2,
            targetY: window.innerHeight / 2,
            size: 20,
            color: this.getRandomColor(),
            shape: this.getRandomShape(),
            velocity: { x: 0, y: 0 },
            state: 'alive'
        };
    }
    
    setupEventListeners() {
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('click', (e) => this.onClick(e));
        
        // 悬停可点击元素
        const clickableElements = document.querySelectorAll('button, a, .nav-item');
        clickableElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.onHoverStart(el));
            el.addEventListener('mouseleave', () => this.onHoverEnd());
        });
    }
    
    onMouseMove(e) {
        if (this.mainParticle) {
            this.mainParticle.targetX = e.clientX;
            this.mainParticle.targetY = e.clientY;
        }
    }
    
    onClick(e) {
        if (this.mainParticle) {
            // 粒子死亡效果
            this.killParticle(this.mainParticle);
            
            // 创建新粒子
            setTimeout(() => {
                this.createMainParticle();
            }, 200);
        }
    }
    
    onHoverStart(element) {
        if (this.mainParticle) {
            this.mainParticle.size = 4;
            this.mainParticle.color = '#ff6b6b';
            this.startShaking(this.mainParticle);
        }
    }
    
    onHoverEnd() {
        if (this.mainParticle) {
            this.mainParticle.size = 20;
            this.mainParticle.color = this.getRandomColor();
            this.stopShaking(this.mainParticle);
        }
    }
    
    killParticle(particle) {
        particle.state = 'dead';
        particle.velocity = { x: 0, y: 50 }; // 匀速下落
    }
    
    startShaking(particle) {
        particle.shaking = true;
        particle.shakeOffset = { x: 0, y: 0 };
    }
    
    stopShaking(particle) {
        particle.shaking = false;
        particle.shakeOffset = { x: 0, y: 0 };
    }
    
    animate() {
        if (this.isMobile) return;
        
        requestAnimationFrame(() => this.animate());
        
        this.updateParticles();
        this.renderParticles();
    }
    
    updateParticles() {
        // 更新主粒子位置（弹簧效果）
        if (this.mainParticle) {
            const dx = this.mainParticle.targetX - this.mainParticle.x;
            const dy = this.mainParticle.targetY - this.mainParticle.y;
            
            // 弹簧物理算法
            this.mainParticle.velocity.x += dx * 0.1;
            this.mainParticle.velocity.y += dy * 0.1;
            
            // 阻尼
            this.mainParticle.velocity.x *= 0.8;
            this.mainParticle.velocity.y *= 0.8;
            
            this.mainParticle.x += this.mainParticle.velocity.x;
            this.mainParticle.y += this.mainParticle.velocity.y;
            
            // 抖动效果
            if (this.mainParticle.shaking) {
                this.mainParticle.shakeOffset.x = (Math.random() - 0.5) * 4;
                this.mainParticle.shakeOffset.y = (Math.random() - 0.5) * 4;
            }
            
            // 死亡状态处理
            if (this.mainParticle.state === 'dead') {
                this.mainParticle.y += this.mainParticle.velocity.y;
                
                // 超出屏幕销毁
                if (this.mainParticle.y > window.innerHeight) {
                    this.mainParticle = null;
                }
            }
        }
    }
    
    renderParticles() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.mainParticle) {
            const renderX = this.mainParticle.x + (this.mainParticle.shakeOffset?.x || 0);
            const renderY = this.mainParticle.y + (this.mainParticle.shakeOffset?.y || 0);
            
            this.ctx.fillStyle = this.mainParticle.color;
            this.ctx.globalAlpha = 0.8;
            
            switch (this.mainParticle.shape) {
                case 'circle':
                    this.ctx.beginPath();
                    this.ctx.arc(renderX, renderY, this.mainParticle.size / 2, 0, Math.PI * 2);
                    this.ctx.fill();
                    break;
                case 'square':
                    this.ctx.fillRect(
                        renderX - this.mainParticle.size / 2,
                        renderY - this.mainParticle.size / 2,
                        this.mainParticle.size,
                        this.mainParticle.size
                    );
                    break;
                case 'triangle':
                    this.ctx.beginPath();
                    this.ctx.moveTo(renderX, renderY - this.mainParticle.size / 2);
                    this.ctx.lineTo(renderX + this.mainParticle.size / 2, renderY + this.mainParticle.size / 2);
                    this.ctx.lineTo(renderX - this.mainParticle.size / 2, renderY + this.mainParticle.size / 2);
                    this.ctx.closePath();
                    this.ctx.fill();
                    break;
            }
        }
    }
    
    getRandomColor() {
        const colors = [
            '#F48FB1', '#CE93D8', '#B39DDB', '#9FA8DA',
            '#90CAF9', '#81D4FA', '#80DEEA', '#80CBC4',
            '#A5D6A7', '#C5E1A5', '#E6EE9C', '#FFCC80'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    getRandomShape() {
        const shapes = ['circle', 'square', 'triangle'];
        return shapes[Math.floor(Math.random() * shapes.length)];
    }
}

// 初始化鼠标特效
let cursorEffect = new CursorEffect();
