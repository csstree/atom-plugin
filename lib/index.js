'use babel';

import { Range, Point } from 'atom';
import { validateString } from 'csstree-validator';

export function activate() {
  require('atom-package-deps').install('csstree-validator');
}

function lint(editor, filePath) {
  let report = validateString(editor.getText());

  return Object.keys(report)
    .reduce((r, c) => r.concat(report[c]), [])
    .map(warning => {
      let range = new Range();

      range.start = new Point(warning.loc.start.line - 1, warning.loc.start.column - 1);
      range.end = new Point(warning.loc.end.line - 1, warning.loc.end.column - 1);

      return {
        type: 'Warning',
        severity: 'warning',
        text: warning.message,
        range,
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
