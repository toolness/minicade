var yaml = require('js-yaml');

exports.parse = function(text) {
  var minicade = yaml.safeLoad(text);
  if (Array.isArray(minicade))
    minicade = {games: minicade};
  return minicade;
};
