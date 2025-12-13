/**
 * 主脚本文件 - 个人作品集网站
 * 负责几何装饰元素生成、页面滚动特效、事件绑定和初始化
 */

// 莫兰迪色盘（12色）
const MORANDI_COLORS = [
    '#e57373', '#f06292', '#ba68c8', '#9575cd', '#7986cb', '#64b5f6',
    '#4fc3f7', '#4dd0e1', '#4db6ac', '#81c784', '#aed581', '#dce775'
];

// 几何装饰元素管理器
class GeometricDecorations {
    constructor() {
        this.container = document.getElementById('geometric-decorations');
        this.decorations = [];
        this.animationId = null;
        this.lastTime = 0;
        this.isMobile = window.innerWidth <= 768;
        
        // 贝塞尔曲线控制点
        this.bezierPoints = this.generateBezierPaths();
    }
    
    /**
     * 生成贝塞尔曲线路径的控制点
     */
    generateBezierPaths() {
        const paths = [];
        for (let i = 0; i < 20; i++) {
            paths.push({
                startX: Math.random() * window.innerWidth,
                startY: Math.random() * window.innerHeight,
                cp1X: Math.random() * window.innerWidth,
                cp1Y: Math.random() * window.innerHeight,
                cp2X: Math.random() * window.innerWidth,
                cp2Y: Math.random() * window.innerHeight,
                endX: Math.random() * window.innerWidth,
                endY: Math.random() * window.innerHeight,
                progress: 0,
                direction: Math.random() > 0.5 ? 1 : -1,
                speed: 0.1 + Math.random() * 0.2
            });
        }
        return paths;
    }
    
    /**
     * 创建几何装饰元素
     */
    createDecorations(count = 50) {
        if (this.isMobile) {
            // 移动端减少装饰元素数量
            count = 20;
        }
        
        for (let i = 0; i < count; i++) {
            this.createDecoration();
        }
    }
    
    /**
     * 创建单个装饰元素
     */
    createDecoration() {
        const decoration = document.createElement('div');
        decoration.className = 'geometric-decoration';
        
        // 随机形状
        const shapes = ['circle', 'square', 'triangle'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        
        // 随机尺寸（30px - 120px）
        const size = 30 + Math.random() * 90;
        
        // 随机颜色
        const color = MORANDI_COLORS[Math.floor(Math.random() * MORANDI_COLORS.length)];
        
        // 随机位置
        const left = Math.random() * 100;
        const top = Math.random() * 100;
        
        // 随机动画延迟
        const delay = Math.random() * 5;
        
        // 设置样式
        decoration.style.width = `${size}px`;
        decoration.style.height = `${size}px`;
        decoration.style.backgroundColor = color;
        decoration.style.left = `${left}%`;
        decoration.style.top = `${top}%`;
        decoration.style.animationDelay = `${delay}s`;
        
        // 设置形状类
        if (shape === 'circle') {
            decoration.style.borderRadius = '50%';
        } else if (shape === 'triangle') {
            decoration.style.width = '0';
            decoration.style.height = '0';
            decoration.style.backgroundColor = 'transparent';
            decoration.style.borderLeft = `${size/2}px solid transparent`;
            decoration.style.borderRight = `${size/2}px solid transparent`;
            decoration.style.borderBottom = `${size}px solid ${color}`;
        }
        
        // 随机贝塞尔曲线路径
        const pathIndex = Math.floor(Math.random() * this.bezierPoints.length);
        decoration.dataset.pathIndex = pathIndex;
        
        this.container.appendChild(decoration);
        this.decorations.push({
            element: decoration,
            pathIndex: pathIndex,
            currentProgress: Math.random()
        });
    }
    
    /**
     * 更新装饰元素位置（贝塞尔曲线动画）
     */
    updateDecorations(timestamp) {
        if (!this.lastTime) this.lastTime = timestamp;
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        this.decorations.forEach(decoration => {
            const path = this.bezierPoints[decoration.pathIndex];
            
            // 更新进度
            decoration.currentProgress += (path.speed * deltaTime) / 1000 * path.direction;
            
            // 边界检查
            if (decoration.currentProgress > 1) {
                decoration.currentProgress = 0;
            } else if (decoration.currentProgress < 0) {
                decoration.currentProgress = 1;
            }
            
            // 计算贝塞尔曲线位置
            const t = decoration.currentProgress;
            const x = this.cubicBezier(
                path.startX, path.cp1X, path.cp2X, path.endX, t
            );
            const y = this.cubicBezier(
                path.startY, path.cp1Y, path.cp2Y, path.endY, t
            );
            
            // 更新位置
            decoration.element.style.left = `${x}px`;
            decoration.element.style.top = `${y}px`;
        });
        
        this.animationId = requestAnimationFrame(this.updateDecorations.bind(this));
    }
    
    /**
     * 三次贝塞尔曲线计算
     */
    cubicBezier(p0, p1, p2, p3, t) {
        const u = 1 - t;
        const tt = t * t;
        const uu = u * u;
        const uuu = uu * u;
        const ttt = tt * t;
        
        return uuu * p0 + 
               3 * uu * t * p1 + 
               3 * u * tt * p2 + 
               ttt * p3;
    }
    
    /**
     * 开始动画
     */
    startAnimation() {
        if (!this.isMobile) {
            this.animationId = requestAnimationFrame(this.updateDecorations.bind(this));
        }
    }
    
    /**
     * 停止动画
     */
    stopAnimation() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    /**
     * 窗口大小改变时重新初始化
     */
    handleResize() {
        this.isMobile = window.innerWidth <= 768;
        this.bezierPoints = this.generateBezierPaths();
        
        // 重新计算装饰元素位置
        this.decorations.forEach((decoration, index) => {
            decoration.currentProgress = Math.random();
            const path = this.bezierPoints[decoration.pathIndex];
            
            const x = this.cubicBezier(
                path.startX, path.cp1X, path.cp2X, path.endX, decoration.currentProgress
            );
            const y = this.cubicBezier(
                path.startY, path.cp1Y, path.cp2Y, path.endY, decoration.currentProgress
            );
            
            decoration.element.style.left = `${x}px`;
            decoration.element.style.top = `${y}px`;
        });
    }
}

// 页面滚动特效管理器
class ScrollEffects {
    constructor() {
        this.sections = document.querySelectorAll('.content-block');
        this.navItems = document.querySelectorAll('.nav-item');
        this.lastScrollTop = 0;
        this.navbar = document.getElementById('navbar');
        this.isNavbarHidden = false;
        
        // 初始化Intersection Observer
        this.initIntersectionObserver();
    }
    
    /**
     * 初始化Intersection Observer
     */
    initIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateSectionIn(entry.target);
                    this.highlightNavItem(entry.target.id);
                }
            });
        }, observerOptions);
        
        // 观察所有内容区块
        this.sections.forEach(section => {
            this.observer.observe(section);
        });
    }
    
    /**
     * 区块进入动画
     */
    animateSectionIn(section) {
        section.style.opacity = '1';
        section.style.transform = 'translateY(0)';
    }
    
    /**
     * 高亮导航项
     */
    highlightNavItem(sectionId) {
        this.navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${sectionId}`) {
                item.classList.add('active');
            }
        });
    }
    
    /**
     * 处理导航栏隐藏/显示
     */
    handleNavbarScroll() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100 && scrollTop > this.lastScrollTop) {
            // 向下滚动超过100px，隐藏导航栏（S型曲线）
            if (!this.isNavbarHidden) {
                this.navbar.style.transform = 'translateY(-100%)';
                this.navbar.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                this.isNavbarHidden = true;
            }
        } else if (scrollTop < this.lastScrollTop) {
            // 向上滚动，显示导航栏
            if (this.isNavbarHidden) {
                this.navbar.style.transform = 'translateY(0)';
                this.navbar.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
                this.isNavbarHidden = false;
            }
        }
        
        this.lastScrollTop = scrollTop;
    }
    
    /**
     * 初始化平滑滚动
     */
    initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                
                const targetId = anchor.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

// 主应用程序
class PortfolioApp {
    constructor() {
        this.geometricDecorations = null;
        this.scrollEffects = null;
        this.authSystem = null;
        this.blocksManager = null;
        this.stickersManager = null;
        this.editorUIManager = null;
        this.cursorParticleManager = null;
        
        this.isInitialized = false;
    }
    
    /**
     * 初始化应用程序
     */
    async init() {
        if (this.isInitialized) return;
        
        try {
            // 1. 初始化几何装饰
            this.geometricDecorations = new GeometricDecorations();
            this.geometricDecorations.createDecorations(50);
            
            // 2. 初始化滚动特效
            this.scrollEffects = new ScrollEffects();
            this.scrollEffects.initSmoothScroll();
            
            // 3. 初始化认证系统
            this.authSystem = new AuthSystem();
            
            // 4. 初始化区块管理器
            this.blocksManager = new BlocksManager();
            
            // 5. 初始化贴纸管理器
            this.stickersManager = new StickersManager();
            
            // 6. 初始化编辑器UI管理器
            this.editorUIManager = new EditorUIManager();
            
            // 7. 初始化鼠标粒子管理器
            this.cursorParticleManager = new CursorParticleManager();
            
            // 8. 绑定事件
            this.bindEvents();
            
            // 9. 恢复保存的数据
            this.restoreSavedData();
            
            // 10. 开始动画
            setTimeout(() => {
                this.geometricDecorations.startAnimation();
            }, 1000);
            
            this.isInitialized = true;
            console.log('Portfolio app initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize portfolio app:', error);
        }
    }
    
    /**
     * 绑定全局事件
     */
    bindEvents() {
        // 窗口大小改变事件
        window.addEventListener('resize', () => {
            if (this.geometricDecorations) {
                this.geometricDecorations.handleResize();
            }
        });
        
        // 滚动事件（导航栏隐藏/显示）
        window.addEventListener('scroll', () => {
            if (this.scrollEffects) {
                this.scrollEffects.handleNavbarScroll();
            }
        });
        
        // 导航项悬停效果
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                item.style.transform = 'scale(1.1)';
                item.style.transition = 'transform 0.2s ease';
            });
            
            item.addEventListener('mouseleave', () => {
                item.style.transform = 'scale(1)';
            });
        });
        
        // 阻止在可交互元素上触发三击
        document.querySelectorAll('button, input, .sticker, .sticker *').forEach(element => {
            element.addEventListener('click', (e) => {
                e.stopPropagation();
            });
        });
    }
    
    /**
     * 恢复保存的数据
     */
    restoreSavedData() {
        try {
            // 恢复首页标题
            const savedDesignerName = localStorage.getItem('designerName');
            const savedDesignerColor = localStorage.getItem('designerColor');
            const savedSubtitle = localStorage.getItem('subtitle');
            
            if (savedDesignerName) {
                const designerSpan = document.getElementById('designer-text');
                if (designerSpan) {
                    designerSpan.textContent = savedDesignerName;
                }
            }
            
            if (savedDesignerColor) {
                const designerSpan = document.getElementById('designer-text');
                if (designerSpan) {
                    designerSpan.style.color = savedDesignerColor;
                }
            }
            
            if (savedSubtitle) {
                const subtitleElement = document.getElementById('subtitle-text');
                if (subtitleElement) {
                    subtitleElement.textContent = savedSubtitle;
                }
            }
            
            // 默认预览模式：不自动进入编辑模式
            // 只有在用户明确输入密码验证后才进入编辑模式
            // 清除之前的编辑模式状态，确保默认是预览模式
            localStorage.setItem('editMode', 'false');
            localStorage.setItem('isAuthenticated', 'false');
            
            // 恢复区块顺序和高度
            if (this.blocksManager) {
                this.blocksManager.restoreFromStorage();
            }
            
            // 恢复贴纸
            if (this.stickersManager) {
                this.stickersManager.loadStickersFromStorage();
            }
            
        } catch (error) {
            console.error('Failed to restore saved data:', error);
        }
    }
    
    /**
     * 进入编辑模式
     */
    enterEditMode() {
        if (this.authSystem) {
            this.authSystem.enterEditMode();
        }
    }
    
    /**
     * 退出编辑模式
     */
    exitEditMode() {
        if (this.authSystem) {
            this.authSystem.exitEditMode();
        }
    }
    
    /**
     * 保存所有数据到本地存储
     */
    saveAllData() {
        try {
            // 保存首页标题
            const designerSpan = document.getElementById('designer-text');
            const subtitleElement = document.getElementById('subtitle-text');
            
            if (designerSpan) {
                localStorage.setItem('designerName', designerSpan.textContent);
                localStorage.setItem('designerColor', designerSpan.style.color);
            }
            
            if (subtitleElement) {
                localStorage.setItem('subtitle', subtitleElement.textContent);
            }
            
            // 保存编辑模式状态
            localStorage.setItem('editMode', this.authSystem ? this.authSystem.isEditMode : 'false');
            
            // 保存区块数据
            if (this.blocksManager) {
                this.blocksManager.saveToStorage();
            }
            
            // 保存贴纸数据
            if (this.stickersManager) {
                this.stickersManager.saveToStorage();
            }
            
            console.log('All data saved to localStorage');
            
        } catch (error) {
            console.error('Failed to save data:', error);
        }
    }
    
    /**
     * 初始化自动保存功能
     */
    initAutoSave() {
        // 监听内容变化
        this.setupAutoSaveListeners();
        
        // 定期保存（每30秒）
        this.autoSaveInterval = setInterval(() => {
            if (this.authSystem && this.authSystem.isEditMode) {
                this.saveAllData();
            }
        }, 30000);
        
        // 页面卸载前保存
        window.addEventListener('beforeunload', () => {
            if (this.authSystem && this.authSystem.isEditMode) {
                this.saveAllData();
            }
        });
    }
    
    /**
     * 设置自动保存监听器
     */
    setupAutoSaveListeners() {
        // 监听项目块内容变化
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' || mutation.type === 'characterData') {
                    if (this.authSystem && this.authSystem.isEditMode) {
                        // 延迟保存，避免频繁操作
                        clearTimeout(this.saveTimeout);
                        this.saveTimeout = setTimeout(() => {
                            this.saveAllData();
                        }, 1000);
                    }
                }
            });
        });
        
        // 观察内容区域
        const contentArea = document.getElementById('content-area');
        if (contentArea) {
            observer.observe(contentArea, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
        
        // 观察贴纸容器
        const stickersContainer = document.getElementById('stickers-container');
        if (stickersContainer) {
            observer.observe(stickersContainer, {
                childList: true,
                subtree: true,
                characterData: true
            });
        }
        
        // 监听输入事件
        document.addEventListener('input', (e) => {
            if (this.authSystem && this.authSystem.isEditMode) {
                if (e.target.classList.contains('editable') || 
                    e.target.classList.contains('block-content') ||
                    e.target.classList.contains('mixed-text')) {
                    clearTimeout(this.saveTimeout);
                    this.saveTimeout = setTimeout(() => {
                        this.saveAllData();
                    }, 1000);
                }
            }
        });
    }
}

// 全局应用程序实例
let portfolioApp = null;

// DOM加载完成后初始化应用程序
document.addEventListener('DOMContentLoaded', () => {
    portfolioApp = new PortfolioApp();
    portfolioApp.init();
});

// 窗口加载完成后确保所有资源已加载
window.addEventListener('load', () => {
    // 确保几何装饰元素正确显示
    if (portfolioApp && portfolioApp.geometricDecorations) {
        setTimeout(() => {
            portfolioApp.geometricDecorations.startAnimation();
        }, 500);
    }
});

// 导出全局函数供HTML调用
window.enterEditMode = function() {
    if (portfolioApp) {
        portfolioApp.enterEditMode();
    }
};

window.exitEditMode = function() {
    if (portfolioApp) {
        portfolioApp.exitEditMode();
    }
};

window.saveAllData = function() {
    if (portfolioApp) {
        portfolioApp.saveAllData();
    }
};

// 开发工具函数
if (typeof window !== 'undefined') {
    window.debugPortfolio = function() {
        console.log('=== Portfolio App Debug Info ===');
        console.log('App initialized:', portfolioApp ? portfolioApp.isInitialized : 'false');
        console.log('Edit mode:', portfolioApp && portfolioApp.authSystem ? portfolioApp.authSystem.isEditMode : 'false');
        console.log('LocalStorage keys:', Object.keys(localStorage));
        console.log('Geometric decorations:', portfolioApp && portfolioApp.geometricDecorations ? 
            portfolioApp.geometricDecorations.decorations.length : 0);
        console.log('===============================');
    };
}
