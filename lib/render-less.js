var less = require('less');

module.exports = function(options) {
  var lessCache = {};
  var parser = new less.Parser({
    paths: options.paths
  });

  return function renderLess(name) {
    return function(req, res, next) {
      function send() {
        res.type('text/css').send(lessCache[name]);
      }

      if (!(name in lessCache) || options.debug) {
        parser.parse('@import "' + name + '";', function(err, tree) {
          if (err) {
            console.log(err);
            return res.send('html:before { content: "LESS parse error!"; }');
          }
          lessCache[name] = tree.toCSS();
          send();
        });
      } else send();
    };
  }
};
