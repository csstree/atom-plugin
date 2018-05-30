'use babel';

import { Function } from './unsafeEval';

global.Function = Function;

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
  const report = validateString(editor.getText());

  return Object.keys(report)
    .reduce((prev, cur) => prev.concat(report[cur]), [])
    .map(({ line, column, loc, node, message, property }) => {
      debugger;
      const range = new Range();
      let type = TYPE_WARNING;
      let severity = SEVERITY_WARNING;

      if (loc && loc.start && loc.end) {
        range.start = new Point(line - 1, column - 1);

        if (!message.indexOf('Unknown property')) {
          range.end = new Point(range.start.row, range.start.column + property.length);
        } else {
          range.end = new Point(loc.end.line - 1, loc.end.column - 1);
        }
      } else {
        type = TYPE_ERROR;
        severity = SEVERITY_ERROR;

        if (node) {
          range.start = new Point(node.loc.start.line - 1, node.loc.start.column - 1);
          range.end = new Point(node.loc.end.line - 1, node.loc.end.column - 1);
        } else {
          range.start = new Point(line - 1, column - 1);
          range.end = new Point(line - 1, column);
        }
      }

      if (range.start.row === range.end.row && range.start.column === range.end.column) {
        range.end.column++;
      }

      return {
        type,
        severity,
        range,
        filePath,
        text: message
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
      const filePath = editor.getPath();
      const text = editor.getText();

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
