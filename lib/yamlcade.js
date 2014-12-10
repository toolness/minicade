var yaml = require('js-yaml');

var minicadeSchema = require('./minicade-schema');

exports.parse = function(text) {
  var minicade = yaml.safeLoad(text);

  if (Array.isArray(minicade))
    minicade = {games: minicade};
  minicade = minicadeSchema.validate(minicade);
  minicade.games.forEach(minicadeSchema.embellishGame);
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
