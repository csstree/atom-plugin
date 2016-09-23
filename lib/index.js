'use babel';

import { BufferedProcess, CompositeDisposable, Range, Point } from 'atom';
import { validateString } from 'csstree-validator';
import { findEnd } from './scanner';

export function activate() {
  require('atom-package-deps').install('csstree-validator');
}

function lint(editor, filePath) {
  let report = validateString(editor.getText());

  return Object.keys(report)
    .reduce((r, c) => r.concat(report[c]), [])
    .map(warning => {
      let range = new Range();
      let line = warning.line - 1;
      let column = warning.column - 1;
      let columnEnd = !warning.message.indexOf('Unknown property') ? column + warning.property.length : findEnd(editor.buffer.lineForRow(line), column) - 1;

      range.start = new Point(line, column);
      range.end = new Point(line, columnEnd);

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
