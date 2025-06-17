// src/editor.js

/**
 * Initialise a basic WYSIWYG editor with font colour support.
 * @param {string} editorId - ID of the contenteditable element
 * @param {string} colorInputId - ID of the colour input element
 */
export function initEditor(editorId, colorInputId) {
  const editor = document.getElementById(editorId);
  const colorInput = document.getElementById(colorInputId);
  if (!editor || !colorInput) return;

  // Use inline styles for color commands
  document.execCommand('styleWithCSS', false, true);

  colorInput.addEventListener('input', e => {
    document.execCommand('foreColor', false, e.target.value);
    editor.focus();
  });
}
