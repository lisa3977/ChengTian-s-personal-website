// stickers.js
let stickers = [];

function initStickers() {
    document.getElementById('add-text').addEventListener('click', addTextSticker);
    document.getElementById('add-image').addEventListener('click', addImageSticker);
    document.getElementById('add-video').addEventListener('click', addVideoSticker);
}

function addSticker(type, content) {
    const sticker = document.createElement('div');
    sticker.classList.add('sticker');
    sticker.style.left = `${window.innerWidth / 2 - 100}px`;
    sticker.style.top = `${window.pageYOffset + window.innerHeight / 2 - 80}px`;

    if (type === 'text') {
        sticker.classList.add('sticker-text');
        sticker.innerHTML = '<p contenteditable="true">编辑文本</p>';
        sticker.querySelector('p').addEventListener('mouseup', showToolbar);
    } else if (type === 'image') {
        const img = document.createElement('img');
        img.src = content; // 假设content是URL
        sticker.appendChild(img);
        addLinkButton(sticker);
    } else if (type === 'video') {
        const video = document.createElement('video');
        video.src = content;
        video.controls = true;
        sticker.appendChild(video);
        addLinkButton(sticker);
    }

    document.body.appendChild(sticker);
    makeDraggable(sticker);
    makeResizable(sticker);
    attachToBlock(sticker);
    stickers.push(sticker);
    saveToLocalStorage();
}

function addTextSticker() {
    addSticker('text');
}

function addImageSticker() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => addSticker('image', reader.result); // Base64 or upload to assets
        reader.readAsDataURL(file);
    };
    input.click();
}

function addVideoSticker() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => addSticker('video', reader.result);
        reader.readAsDataURL(file);
    };
    input.click();
}

function makeDraggable(el) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    el.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if (!isEditing) return;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e.preventDefault();
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        el.style.top = (el.offsetTop - pos2) + "px";
        el.style.left = (el.offsetLeft - pos1) + "px";
        attachToBlock(el);
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function makeResizable(el) {
    const resizer = document.createElement('div');
    resizer.className = 'resizer';
    resizer.style.width = '10px';
    resizer.style.height = '10px';
    resizer.style.background = 'gray';
    resizer.style.position = 'absolute';
    resizer.style.right = 0;
    resizer.style.bottom = 0;
    resizer.style.cursor = 'se-resize';
    el.appendChild(resizer);

    resizer.addEventListener('mousedown', initResize);

    function initResize(e) {
        if (!isEditing) return;
        window.addEventListener('mousemove', resize);
        window.addEventListener('mouseup', stopResize);
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = parseInt(document.defaultView.getComputedStyle(el).width, 10);
        const startHeight = parseInt(document.defaultView.getComputedStyle(el).height, 10);

        function resize(e) {
            const width = startWidth + e.clientX - startX;
            const height = startHeight + e.clientY - startY;
            el.style.width = width + 'px';
            el.style.height = height + 'px';
        }

        function stopResize() {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResize);
        }
    }
}

function attachToBlock(sticker) {
    const blocks = document.querySelectorAll('.block');
    let maxOverlap = 0;
    let parentBlock = null;
    blocks.forEach(block => {
        const overlap = getOverlapArea(sticker.getBoundingClientRect(), block.getBoundingClientRect());
        if (overlap > maxOverlap) {
            maxOverlap = overlap;
            parentBlock = block;
        }
    });
    if (parentBlock && maxOverlap > sticker.offsetWidth * sticker.offsetHeight / 2) {
        parentBlock.appendChild(sticker);
        sticker.style.position = 'absolute';
        // 调整位置相对block
    } else {
        document.body.appendChild(sticker);
        sticker.style.position = 'absolute';
    }
}

function getOverlapArea(rect1, rect2) {
    const xOverlap = Math.max(0, Math.min(rect1.right, rect2.right) - Math.max(rect1.left, rect2.left));
    const yOverlap = Math.max(0, Math.min(rect1.bottom, rect2.bottom) - Math.max(rect1.top, rect2.top));
    return xOverlap * yOverlap;
}

function showToolbar(e) {
    const toolbar = document.createElement('div');
    toolbar.classList.add('tool-bar');
    toolbar.innerHTML = `
        <select id="font-size">
            <option value="1.5rem">副标题</option>
            <option value="1rem">普通</option>
            <option value="0.875rem">小字</option>
        </select>
        <input type="color" id="text-color">
        <button id="add-link">添加链接</button>
    `;
    document.body.appendChild(toolbar);
    toolbar.style.top = `${e.target.offsetTop - 40}px`;
    toolbar.style.left = `${e.target.offsetLeft}px`;
    toolbar.style.display = 'block';

    document.getElementById('font-size').addEventListener('change', (ev) => {
        document.execCommand('fontSize', false, ev.target.value);
    });
    document.getElementById('text-color').addEventListener('change', (ev) => {
        document.execCommand('foreColor', false, ev.target.value);
    });
    document.getElementById('add-link').addEventListener('click', () => {
        const url = prompt('输入链接');
        if (url) document.execCommand('createLink', false, url);
    });

    document.addEventListener('click', (ev) => {
        if (!toolbar.contains(ev.target) && !e.target.contains(ev.target)) {
            toolbar.remove();
        }
    });
}

function addLinkButton(sticker) {
    sticker.addEventListener('mouseover', () => {
        if (!isEditing) return;
        const btn = document.createElement('button');
        btn.innerText = '链接';
        btn.style.position = 'absolute';
        btn.style.top = '0';
        btn.style.right = '0';
        sticker.appendChild(btn);
        btn.addEventListener('click', () => {
            const url = prompt('输入链接');
            if (url) sticker.onclick = () => window.open(url);
        });
    });
    sticker.addEventListener('mouseout', () => {
        const btn = sticker.querySelector('button');
        if (btn) btn.remove();
    });
}

function getStickersData() {
    return stickers.map(s => ({
        type: s.classList.contains('sticker-text') ? 'text' : s.querySelector('img') ? 'image' : 'video',
        content: s.innerHTML,
        left: s.style.left,
        top: s.style.top,
        width: s.style.width,
        height: s.style.height
    }));
}

function setStickersData(data) {
    data.forEach(d => {
        addSticker(d.type, d.content);
        const s = stickers[stickers.length - 1];
        s.style.left = d.left;
        s.style.top = d.top;
        s.style.width = d.width;
        s.style.height = d.height;
    });
}