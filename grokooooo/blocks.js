// blocks.js
const content = document.getElementById('content');
const navUl = document.querySelector('#navbar ul');
const blockList = document.getElementById('block-list');

let blocks = [];

// 初始化区块
function initBlocks() {
    // 示例初始区块
    addBlock('项目1');
    addBlock('项目2');

    document.getElementById('add-block').addEventListener('click', () => addBlock(prompt('新区块标题')));
    document.getElementById('editor-exit').addEventListener('click', exitEditMode);
}

// 添加区块
function addBlock(title) {
    const id = `block-${blocks.length + 1}`;
    const section = document.createElement('section');
    section.id = id;
    section.classList.add('section', 'block');
    section.innerHTML = `
        <h2 class="block-title">${title}</h2>
        <div class="resize-handle"></div>
        <button class="block-delete">×</button>
    `;
    content.appendChild(section);

    // 导航项
    const navItem = document.createElement('li');
    navItem.id = `nav-${id}`;
    navItem.classList.add('nav-item');
    navItem.innerText = title;
    navItem.addEventListener('click', () => scrollToSection(id));
    navUl.appendChild(navItem);

    // 排序列表
    const listItem = document.createElement('li');
    listItem.innerText = title;
    listItem.draggable = true;
    blockList.appendChild(listItem);

    blocks.push({ id, title, element: section, nav: navItem, list: listItem });

    // 拖拽排序
    new Sortable(blockList, {
        animation: 150,
        onEnd: reorderBlocks
    });

    // 高度调整
    const handle = section.querySelector('.resize-handle');
    let startY, startHeight;
    handle.addEventListener('mousedown', (e) => {
        startY = e.clientY;
        startHeight = section.offsetHeight;
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);
    });
    function resize(e) {
        const delta = e.clientY - startY;
        if (delta > 0) { // 仅向下延长
            section.style.height = `${Math.max(startHeight + delta, 200)}px`;
        }
    }
    function stopResize() {
        document.removeEventListener('mousemove', resize);
        document.removeEventListener('mouseup', stopResize);
    }

    // 删除
    section.querySelector('.block-delete').addEventListener('click', () => {
        if (confirm('确认删除？')) {
            section.remove();
            navItem.remove();
            listItem.remove();
            blocks = blocks.filter(b => b.id !== id);
            saveToLocalStorage();
        }
    });

    // 设置颜色
    section.querySelector('.block-title').style.setProperty('--color', morandiColors[blocks.length % morandiColors.length]);
    section.querySelector('.block-title::before').style.background = morandiColors[blocks.length % morandiColors.length];

    observer.observe(section);
    saveToLocalStorage();
}

function reorderBlocks() {
    const order = Array.from(blockList.children).map(li => li.innerText);
    blocks.sort((a, b) => order.indexOf(a.title) - order.indexOf(b.title));
    blocks.forEach(block => content.appendChild(block.element));
    saveToLocalStorage();
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function exitEditMode() {
    isEditing = false;
    document.getElementById('editor-panel').classList.add('hidden');
    document.getElementById('editor-add').classList.add('hidden');
    document.getElementById('editor-menu').classList.add('hidden');
    document.getElementById('editor-exit').classList.add('hidden');
    document.querySelectorAll('.resize-handle, .block-delete').forEach(el => el.style.display = 'none');
    saveToLocalStorage();
}

function getBlocksData() {
    return blocks.map(b => ({
        id: b.id,
        title: b.title,
        height: b.element.style.height
    }));
}

function setBlocksData(data) {
    data.forEach(d => {
        addBlock(d.title);
        const block = blocks.find(b => b.title === d.title);
        block.element.style.height = d.height;
    });
}