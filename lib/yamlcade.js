var yaml = require('js-yaml');

// TODO: Detect makes.org makes and point contenturl to _-suffixed URL.
// TODO: Ensure all URLs are http/https.
// TODO: Automatically set remix URLs for anything on Webmaker, jsbin,
//       jsfiddle.

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
