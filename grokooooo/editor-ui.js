// editor-ui.js
function initEditorUI() {
    document.getElementById('editor-add').addEventListener('click', () => {
        document.getElementById('editor-menu').classList.toggle('hidden');
    });
}