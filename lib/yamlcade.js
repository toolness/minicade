var urlParse = require('url').parse;
var _ = require('underscore');
var yaml = require('js-yaml');

var SAFE_URL = /^https?:\/\//;

var SCHEMA_DEFAULTS = {
  required: false
};

var MINICADE_SCHEMA = {
  title: {type: String},
  games: {
    type: Array,
    required: true,
    itemSchema: {
      title: {type: String, default: 'Untitled Game'},
      description: {type: String},
      url: {type: String, regex: SAFE_URL, required: true},
      remixurl: {type: String, regex: SAFE_URL},
    }
  }
};

function isInstance(thing, type) {
  if (type == String)
    return typeof(thing) == 'string';
  if (type == Array)
    return Array.isArray(thing);
  throw new Error("unknown type: " + type.name);
}

function validateSchema(thing, schema) {
  var newThing = {};
  _.keys(schema).forEach(function(prop) {
    var s = _.defaults(schema[prop], SCHEMA_DEFAULTS);
    if (!(prop in thing)) {
      if (s.required)
        throw new Error('required property missing: ' + prop);
      if ('default' in s)
        newThing[prop] = s.default;
      return;
    }
    if (!isInstance(thing[prop], s.type))
      throw new Error('property is not a ' + s.type.name + ': ' + prop);
    if (s.regex && !s.regex.test(thing[prop]))
      throw new Error('invalid format for property: ' + prop);
    if (Array.isArray(thing[prop]) && s.itemSchema)
      newThing[prop] = thing[prop].map(function(item) {
        return validateSchema(item, s.itemSchema);
      });
    else
      newThing[prop] = thing[prop];
  });
  return newThing;
}

exports.parse = function(text) {
  var minicade = yaml.safeLoad(text);

  if (Array.isArray(minicade))
    minicade = {games: minicade};
  minicade = validateSchema(minicade, MINICADE_SCHEMA);
  minicade.games.forEach(function(game) {
    var parsed = urlParse(game.url);
    game.contenturl = game.url;

    if (/\.makes\.org$/.test(parsed.host)) {
      if (!/_$/.test(game.contenturl))
        game.contenturl += '_';
      if (!game.remixurl && !/_$/.test(game.url))
        game.remixurl = game.url + '/remix';
    } else if (/jsbin\.com$/.test(parsed.host)) {
      if (!game.remixurl)
        game.remixurl = game.url + '/edit';
    }
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
