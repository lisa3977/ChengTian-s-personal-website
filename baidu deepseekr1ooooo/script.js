// 页面初始化
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
    setupEventListeners();
    initializeCursorEffect();
});

function initializePage() {
    // 检查是否在编辑模式
    const isEditMode = localStorage.getItem('editMode') === 'true';
    if (isEditMode) {
        enterEditMode();
    }
}

function setupEventListeners() {
    // 三击进入编辑模式
    let clickCount = 0;
    let clickTimer;
    
    document.addEventListener('click', function(e) {
        // 忽略可交互元素
        if (e.target.matches('button, input, a, .sticker')) {
            return;
        }
        
        clickCount++;
        
        if (clickCount === 1) {
            clickTimer = setTimeout(() => {
                clickCount = 0;
            }, 500);
        }
        
        if (clickCount === 3) {
            clearTimeout(clickTimer);
            clickCount = 0;
            showAuthModal();
        }
    });
    
    // 导航栏滚动隐藏
    let lastScrollTop = 0;
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const navbar = document.getElementById('navbar');
        
        if (scrollTop > 100) {
            if (scrollTop > lastScrollTop) {
                // 向下滚动
                navbar.style.transform = 'translateY(-100%)';
            } else {
                // 向上滚动
                navbar.style.transform = 'translateY(0)';
            }
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
        
        // 区块入场动画
        animateBlocksOnScroll();
        
        // 导航高亮
        highlightActiveNav();
    });
}

function animateBlocksOnScroll() {
    const blocks = document.querySelectorAll('.content-block');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1
    });
    
    blocks.forEach(block => {
        observer.observe(block);
    });
}

function highlightActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navItems = document.querySelectorAll('.nav-item');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.scrollY >= sectionTop - 100 && 
            window.scrollY < sectionTop + sectionHeight - 100) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-section') === currentSection) {
            item.classList.add('active');
        }
    });
}
