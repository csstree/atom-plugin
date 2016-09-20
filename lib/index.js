'use babel';

import { BufferedProcess, CompositeDisposable, Range, Point } from 'atom';
import { validateString }  from 'csstree-validator';

export function activate() {
  require('atom-package-deps').install('atom-csstree-validator');
}

function lint(editor, filePath) {
  let report = validateString(editor.getText());

  return Object.keys(report)
    .reduce((r, c) => r.concat(report[c]), [])
    .map(warning => {
      let range = new Range();
      let line = warning.line - 1;
      let column = warning.column - 1;

      range.start = new Point(line, column);

      if (warning.property) {
        range.end = new Point(line, column + warning.property.length);
      } else {
        let lineText = editor.buffer.lineForRow(line).slice(column);

        range.end = new Point(line, column + lineText.length);
      }

      return {
        type: 'Warning',
        severity: 'warning',
        text: warning.message,
        range: range,
        filePath
      }
    });
}

export function provideLinter() {
  return {
    name: 'csstree-validator',
    grammarScopes: ['source.css'],
    scope: 'file',
    lintOnFly: true,
    lint: (editor) => {
      let filePath = editor.getPath();
      let text = editor.getText();

      if (text) {
        try {
          return lint(editor, filePath);
        } catch (e) {
          atom.notifications.addError('CSSTree error', {
            detail: e.message,
            dismissable: true
          });
        }
      }

      return [];
    }
  };
};
