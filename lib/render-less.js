var less = require('less');
var cssesc = require('cssesc');

function handleLessErr(res, err) {
  var message = 'LESS error: ' + err.message + ' in ' +
                err.filename + ' line ' + err.line;
  var css = "html:before { color: red; background: white; " +
            "white-space: pre; font-family: monospace; " +
            "content: '" + cssesc(message) + "'; }\n" +
            "body { display: none; }";
  console.error(message);
  res.send(css);
}

module.exports = function(options) {
  var lessCache = {};

  return function renderLess(name) {
    return function(req, res, next) {
      function send() {
        res.send(lessCache[name]);
      }

      res.type('text/css');
      if (!(name in lessCache) || options.debug) {
        var parser = new less.Parser({
          paths: options.paths
        });

        parser.parse('@import "' + name + '";', function(err, tree) {
          if (err) return handleLessErr(res, err);
          try {
            lessCache[name] = tree.toCSS();
          } catch (e) {
            return handleLessErr(res, e);
          }
          send();
        });
      } else send();
    };
  }
};
