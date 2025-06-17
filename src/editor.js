// src/editor.js

/**
 * Initialise a basic WYSIWYG editor.
 * Supports font colour and simple formatting commands.
 *
 * @param {string} editorId - ID of the contenteditable element
 * @param {string} colorInputId - ID of the colour input element
 * @param {string} toolbarId - ID of the toolbar containing command buttons
 */
export function initEditor(editorId, colorInputId, toolbarId) {
  const editor = document.getElementById(editorId);
  if (!editor) return;
  const colorInput = document.getElementById(colorInputId);
  const toolbar = document.getElementById(toolbarId);

  // Use inline styles for color commands
  document.execCommand('styleWithCSS', false, true);

  if (colorInput) {
    colorInput.addEventListener('input', e => {
      document.execCommand('foreColor', false, e.target.value);
      editor.focus();
    });
  }

  if (toolbar) {
    toolbar.addEventListener('click', e => {
      const btn = e.target.closest('button[data-cmd]');
      if (!btn) return;
      const cmd = btn.dataset.cmd;
      if (!cmd) return;
      document.execCommand(cmd, false, null);
      editor.focus();
    });
  }
}
