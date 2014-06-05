var yaml = require('js-yaml');

exports.parse = function(text) {
  var minicade = yaml.safeLoad(text);
  if (Array.isArray(minicade))
    minicade = {games: minicade};
  if (!minicade.games) minicade.games = [];
  minicade.games.forEach(function(game) {
    game.contenturl = game.url;
  });
  return minicade;
};

exports.isValid = function(yaml) {
  try {
    exports.parse(yaml);
    return true;
  } catch (e) {
    return false;
  }
};
