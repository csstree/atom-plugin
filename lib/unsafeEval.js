var vm,
  slice = [].slice;

vm = require('vm');

exports.allowUnsafeEval = function(fn) {
  var previousEval;
  previousEval = global["eval"];
  try {
    global["eval"] = function(source) {
      return vm.runInThisContext(source);
    };
    return fn();
  } finally {
    global["eval"] = previousEval;
  }
};

exports.allowUnsafeNewFunction = function(fn) {
  var previousFunction;
  previousFunction = global.Function;
  try {
    global.Function = exports.Function;
    return fn();
  } finally {
    global.Function = previousFunction;
  }
};

exports.Function = function() {
  var body, i, j, len, paramList, paramLists, params;
  paramLists = 2 <= arguments.length ? slice.call(arguments, 0, i = arguments.length - 1) : (i = 0, []), body = arguments[i++];
  params = [];
  for (j = 0, len = paramLists.length; j < len; j++) {
    paramList = paramLists[j];
    if (typeof paramList === 'string') {
      paramList = paramList.split(/\s*,\s*/);
    }
    params.push.apply(params, paramList);
  }
  return vm.runInThisContext("(function(" + (params.join(', ')) + ") {\n  " + body + "\n})");
};

exports.Function.prototype = global.Function.prototype;