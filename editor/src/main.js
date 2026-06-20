import { createEditor } from './editor/grapes-init.js';
import { wireToolbar } from './editor/toolbar.js';
import { FileIO } from './lib/file-io.js';

const editor = createEditor();
const fileIO = new FileIO(editor);
wireToolbar(editor, fileIO);

window.__RB_EDITOR__ = { editor, fileIO };

editor.on('load', () => {
  fileIO.setStatus('Editor ready — open an HTML file or start editing');
});