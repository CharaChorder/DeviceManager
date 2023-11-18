// ../../node_modules/.pnpm/just-extend@6.2.0/node_modules/just-extend/index.mjs
var objectExtend = extend;
function extend() {
  var args = [].slice.call(arguments);
  var deep = false;
  if (typeof args[0] == "boolean") {
    deep = args.shift();
  }
  var result = args[0];
  if (isUnextendable(result)) {
    throw new Error("extendee must be an object");
  }
  var extenders = args.slice(1);
  var len = extenders.length;
  for (var i = 0; i < len; i++) {
    var extender = extenders[i];
    for (var key in extender) {
      if (Object.prototype.hasOwnProperty.call(extender, key)) {
        var value = extender[key];
        if (deep && isCloneable(value)) {
          var base = Array.isArray(value) ? [] : {};
          result[key] = extend(
            true,
            Object.prototype.hasOwnProperty.call(result, key) && !isUnextendable(result[key]) ? result[key] : base,
            value
          );
        } else {
          result[key] = value;
        }
      }
    }
  }
  return result;
}
function isCloneable(obj) {
  return Array.isArray(obj) || {}.toString.call(obj) == "[object Object]";
}
function isUnextendable(val) {
  return !val || typeof val != "object" && typeof val != "function";
}

// src/extendDictionary.mts
var initExtendDictionary = () => (base, part) => objectExtend({}, base, part);
var extendDictionary = initExtendDictionary();
export {
  extendDictionary,
  initExtendDictionary
};
