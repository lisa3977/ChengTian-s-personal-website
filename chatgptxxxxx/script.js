/* script.js - 全局初始化与交互逻辑维护者 */

// 说明：此文件负责页面的核心行为：
// - 首页背景几何图形生成
// - 导航平滑滚动与高亮
// - 滚动时导航显示/隐藏（S 曲线动画）
// - 区块入场动画（Intersection Observer）
// - 本地存储的标题/副标题读取与保存（与 editor-ui 配合）

(function () {
  // ---------------------- 配置 ----------------------
  const SHAPE_COUNT = 50;
  const MORANDI = [
    getComputedStyle(document.documentElement).getPropertyValue('--m1').trim() || '#e0afa0',
    getComputedStyle(document.documentElement).getPropertyValue('--m2').trim() || '#c9cba3',
    getComputedStyle(document.documentElement).getPropertyValue('--m3').trim() || '#ffe1a8',
    getComputedStyle(document.documentElement).getPropertyValue('--m4').trim() || '#e6b3b3',
    getComputedStyle(document.documentElement).getPropertyValue('--m5').trim() || '#b5cbb7',
    getComputedStyle(document.documentElement).getPropertyValue('--m6').trim() || '#a3b9c9',
    getComputedStyle(document.documentElement).getPropertyValue('--m7').trim() || '#d7c0e2'
  ];

  // ---------------------- Helper ----------------------
  function rand(min, max) { return Math.random() * (max - min) + min; }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  // ---------------------- 背景几何图形 ----------------------
  function createBackgroundShapes() {
    const container = document.getElementById('background-shapes');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < SHAPE_COUNT; i++) {
      const el = document.createElement('div');
      const size = Math.floor(rand(30, 120));
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.left = rand(-10, 110) + '%';
      el.style.top = rand(-10, 110) + '%';
      el.style.background = MORANDI[Math.floor(Math.random() * MORANDI.length)];
      el.style.opacity = String(rand(0.18, 0.55));
      el.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';

      // 自定义动画偏移与时长，制造贝塞尔曲线效果（通过CSS变量在cursor/animation中使用）
      el.style.animationDuration = (rand(8, 20)).toFixed(2) + 's';
      el.style.animationDelay = (rand(0, 6)).toFixed(2) + 's';

      container.appendChild(el);
    }
  }

  // ---------------------- 导航 & 滚动 ----------------------
  function setupNav() {
    const nav = document.getElementById('navbar');
    const items = nav.querySelectorAll('li[data-target]');

    items.forEach(li => {
      li.addEventListener('click', () => {
        const targetId = li.getAttribute('data-target');
        const target = document.getElementById(targetId);
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      });
    });

    // 滚动时高亮
    const sections = Array.from(document.querySelectorAll('.block, .hero'))
      .map(el => ({ id: el.id || '', el }));

    function onScroll() {
      const y = window.scrollY + window.innerHeight / 3;
      // 高亮最近的区块
      let current = null;
      for (const s of sections) {
        if (!s.el) continue;
        const rect = s.el.getBoundingClientRect();
        const top = window.scrollY + rect.top;
        if (y >= top) current = s.id;
      }
      items.forEach(li => li.classList.toggle('active', li.getAttribute('data-target') === current));
    }

    // 导航隐藏/显示（S 曲线）
    let lastY = window.scrollY;
    let ticking = false;
    function onScrollHide() {
      const currentY = window.scrollY;
      const navEl = document.querySelector('.nav');
      if (currentY - lastY > 10) {
        navEl.classList.add('hide');
      } else if (lastY - currentY > 10 || currentY < 50) {
        navEl.classList.remove('hide');
      }
      lastY = currentY;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        window.requestAnimationFrame(() => { onScroll(); onScrollHide(); ticking = false; });
      }
      ticking = true;
    }, { passive: true });

    onScroll();
  }

  // ---------------------- 区块入场动画 ----------------------
  function setupObserver() {
    const blocks = document.querySelectorAll('.block');
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.15 });

    blocks.forEach(b => obs.observe(b));
  }

  // ---------------------- 本地存储（标题/副标题） ----------------------
  const STORAGE_KEY = 'portfolio_meta_v1';
  function loadMeta() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (data.name) document.getElementById('designer-name').textContent = data.name;
      if (data.subtitle) document.getElementById('subtitle').textContent = data.subtitle;
    } catch (e) { console.warn('加载本地 meta 出错', e); }
  }
  function saveMeta(meta) {
    try {
      const raw = JSON.stringify(meta);
      localStorage.setItem(STORAGE_KEY, raw);
    } catch (e) { console.warn('保存本地 meta 出错', e); }
  }

  // 对外暴露一个小接口给 editor-ui 使用
  window.PF = window.PF || {};
  window.PF.saveMeta = saveMeta;

  // ---------------------- 初始化 ----------------------
  function init() {
    createBackgroundShapes();
    setupNav();
    setupObserver();
    loadMeta();

    // 窗口尺寸变化时重排背景形状位置（简单重建）
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(createBackgroundShapes, 300);
    });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
