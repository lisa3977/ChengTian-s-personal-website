// cursor.js
const particle = document.getElementById('cursor-particle');
let particleShape = ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)];
let particleColor = morandiColors[Math.floor(Math.random() * morandiColors.length)];
particle.classList.add(particleShape);
particle.style.background = particleColor;

let targetX = 0, targetY = 0;
let currentX = 0, currentY = 0;
const spring = 0.1;
const friction = 0.9;
let vx = 0, vy = 0;
let isDead = false;
let deadTimer;

function updateParticle() {
    if (!isDead) {
        vx += (targetX - currentX) * spring;
        vy += (targetY - currentY) * spring;
        vx *= friction;
        vy *= friction;
        currentX += vx;
        currentY += vy;
        particle.style.transform = `translate(${currentX}px, ${currentY}px)`;
    } else {
        currentY += 50 / 60; // 50px/s
        particle.style.transform = `translate(${currentX}px, ${currentY}px)`;
        if (currentY > window.innerHeight) {
            resetParticle();
        }
    }
    requestAnimationFrame(updateParticle);
}

document.addEventListener('mousemove', (e) => {
    targetX = e.clientX - particle.offsetWidth / 2;
    targetY = e.clientY - particle.offsetHeight / 2;
    checkHover(e);
});

document.addEventListener('click', () => {
    isDead = true;
    clearTimeout(deadTimer);
    deadTimer = setTimeout(() => {
        // 僵直200ms
    }, 200);
});

function resetParticle() {
    isDead = false;
    currentX = targetX;
    currentY = targetY;
    particle.style.opacity = 0;
    setTimeout(() => {
        particle.style.opacity = 1;
        particleShape = ['circle', 'square', 'triangle'][Math.floor(Math.random() * 3)];
        particleColor = morandiColors[Math.floor(Math.random() * morandiColors.length)];
        particle.className = 'particle ' + particleShape;
        particle.style.background = particleColor;
    }, 100);
}

function checkHover(e) {
    if (document.elementFromPoint(e.clientX, e.clientY).tagName !== 'BODY') {
        particle.style.width = particle.style.height = '4px';
        particle.style.animation = 'shake 0.1s infinite';
        particle.style.background = '#ff6b6b';
    } else {
        particle.style.width = particle.style.height = '';
        particle.style.animation = '';
        particle.style.background = particleColor;
    }
}

const shakeStyle = document.createElement('style');
shakeStyle.innerHTML = `
@keyframes shake {
    0% { transform: translate(1px, 1px); }
    50% { transform: translate(-1px, -1px); }
    100% { transform: translate(1px, 1px); }
}
`;
document.head.appendChild(shakeStyle);

updateParticle();