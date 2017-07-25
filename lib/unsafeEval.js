'use babel';

const vm = require('vm');

exports.Function = function (...args) {
  const adjustedLength = Math.max(args.length, 1)
  const paramLists = args.slice(0, adjustedLength - 1)
  const body = args[adjustedLength - 1];
  const params = [];

  for (let paramList of paramLists) {
    if (typeof paramList === 'string') {
      paramList = paramList.split(/\s*,\s*/);
    }

    params.push(...paramList);
  }

  return vm.runInThisContext(`\
(function(${params.join(', ')}) {
  ${body}
})\
`);
};

exports.Function.prototype = global.Function.prototype;