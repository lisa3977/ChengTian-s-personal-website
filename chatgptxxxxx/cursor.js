/* cursor.js - 鼠标粒子特效系统 */

// 说明：
// - 鼠标有一个主粒子跟随
// - 形状随机（圆/方/三角）
// - 颜色来自莫兰迪色盘
// - Q弹跟随效果（弹簧物理）
// - 点击后粒子进入死亡 → 下落 → 销毁 → 新粒子出生
// - 悬停可点击元素时进入“警告模式”
// - 最大粒子数量不超过 10

(function () {
  const layer = document.getElementById('cursor-layer');
  if (!layer) {
    console.warn('cursor-layer not found');
    return;
  }

  const MORANDI = [
    get('--m1'), get('--m2'), get('--m3'),
    get('--m4'), get('--m5'), get('--m6'), get('--m7')
  ];

  function get(v) {
    return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#ccc';
  }

  const particles = [];
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.addEventListener('mousedown', () => {
    killParticle();
  });

  // -----------------------------------------------------
  // 主粒子创建
  // -----------------------------------------------------
  function createParticle() {
    const p = document.createElement('div');

    const size = 14;
    p.style.width = size + 'px';
    p.style.height = size + 'px';

    const shape = Math.random();
    if (shape < 0.33) p.style.borderRadius = '50%';
    else if (shape < 0.66) p.style.borderRadius = '0';
    else {
      p.style.width = 0;
      p.style.height = 0;
      p.style.borderLeft = size / 2 + 'px solid transparent';
      p.style.borderRight = size / 2 + 'px solid transparent';
      p.style.borderBottom = size + 'px solid ' + randomColor();
    }

    p.style.background = randomColor();
    p.className = 'cursor-particle';

    layer.appendChild(p);

    return {
      el: p,
      x: mouseX,
      y: mouseY,
      vx: 0,
      vy: 0,
      alive: true,
      triangle: shape >= 0.66
    };
  }

  // 初始化只创建 1 个主粒子
  particles.push(createParticle());

  function randomColor() {
    return MORANDI[Math.floor(Math.random() * MORANDI.length)];
  }

  // -----------------------------------------------------
  // 悬停提示，可点击元素时警告闪烁
  // -----------------------------------------------------
  const clickableTags = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'VIDEO', 'IMG'];
  document.addEventListener('mouseover', e => {
    const p = particles[0];
    if (!p) return;
    if (clickableTags.includes(e.target.tagName)) {
      p.el.classList.add('cursor-warning');
    }
  });
  document.addEventListener('mouseout', e => {
    const p = particles[0];
    if (!p) return;
    if (clickableTags.includes(e.target.tagName)) {
      p.el.classList.remove('cursor-warning');
    }
  });

  // -----------------------------------------------------
  // 粒子死亡：点击时粒子下落
  // -----------------------------------------------------
  function killParticle() {
    const p = particles[0];
    if (!p || !p.alive) return;

    p.alive = false;
    const el = p.el;
    el.style.transition = 'transform 1s linear, opacity 1s linear';

    const startY = p.y;
    const fallY = startY + window.innerHeight;

    el.style.transform = `translate(${p.x}px, ${fallY}px)`;
    el.style.opacity = '0';

    setTimeout(() => {
      el.remove();
      particles.shift();
      spawnNew();
    }, 900);
  }

  function spawnNew() {
    const newP = createParticle();
    particles.unshift(newP);
  }

  // -----------------------------------------------------
  // Q 弹物理跟随
  // -----------------------------------------------------
  function animate() {
    const p = particles[0];
    if (p && p.alive) {
      const k = 0.15;  // 弹性系数
      const d = 0.80;  // 阻尼

      const dx = mouseX - p.x;
      const dy = mouseY - p.y;

      p.vx = p.vx * d + dx * k;
      p.vy = p.vy * d + dy * k;

      p.x += p.vx;
      p.y += p.vy;

      if (!p.triangle) {
        p.el.style.transform = `translate(${p.x}px, ${p.y}px)`;
      } else {
        // 三角形的 transform 不同
        p.el.style.transform = `translate(${p.x - 7}px, ${p.y - 7}px)`;
      }
    }

    requestAnimationFrame(animate);
  }

  animate();

})();
