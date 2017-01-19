'use babel';

import { Range, Point } from 'atom';
import { validateString } from 'csstree-validator';

export function activate() {
  require('atom-package-deps').install('csstree-validator');
}

const TYPE_WARNING = 'Warning';
const TYPE_ERROR = 'Error';
const SEVERITY_WARNING = 'warning';
const SEVERITY_ERROR = 'error';

function lint(editor, filePath) {
  let report = validateString(editor.getText());

  return Object.keys(report)
    .reduce((r, c) => r.concat(report[c]), [])
    .map(warning => {
      let range = new Range();
      let type = TYPE_WARNING;
      let severity = SEVERITY_WARNING;

      range.start = new Point(warning.line - 1, warning.column - 1);

      if (warning.loc) {
        let endLine = warning.loc.end.line - 1;
        let endColumn = warning.loc.end.column - 1;

        if (!warning.message.indexOf('Unknown property')) {
          range.end = new Point(range.start.row, range.start.column + warning.property.length);
        } else {
          range.end = new Point(endLine, endColumn);
        }
      } else {
        type = TYPE_ERROR;
        severity = SEVERITY_ERROR;
        range.end = new Point(range.start.row, range.start.column + 1);
      }

      return {
        type,
        severity,
        range,
        filePath,
        text: warning.message
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
