var hljs = require('highlight.js');
var SafeString = require('nunjucks').runtime.SafeString;

var NunjucksTransformExtension = require('./nunjucks-transform-extension');

var staticCache = {};

function removeBaseIndent(code) {
  var lines = code.split('\n').slice(1, -1);
  var baseIndent = lines.length ? lines[0].match(/^(\s+)/) : null;
  var baseIndentIndex = baseIndent ? baseIndent[1].length : 0;
  return lines.map(function(line) {
    return line.slice(baseIndentIndex);
  }).join('\n');
}

function staticHighlighter(language) {
  return function() {
    return function(text, render) {
      if (!(text in staticCache)) {
        staticCache[text] = '<pre class="hljs">' +
          hljs.highlight(language, removeBaseIndent(text)).value +
          '</pre>';
      }
      return staticCache[text];
    };
  };
}

module.exports = staticHighlighter;
module.exports.removeBaseIndent = removeBaseIndent;
module.exports.nunjucks = NunjucksTransformExtension({
  _highlighters: {},
  tag: 'highlight',
  mapArgs: function(args) { return {language: args}; },
  transform: function(body, ctx) {
    var lang = ctx.language;
    if (!(lang in this._highlighters))
      this._highlighters[lang] = staticHighlighter(lang)();
    return new SafeString(this._highlighters[lang](body));
  }
});
