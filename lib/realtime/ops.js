var _ = require('underscore');
var React = require('react/addons');

var minicadeSchema = require('../minicade-schema');

// http://stackoverflow.com/a/105074
var defaultGuid = (function() {
  function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
               .toString(16)
               .substring(1);
  }
  return function() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
  };
})();

function Ops(guid) {
  this.games = [];
  this._guid = guid || defaultGuid;
}

Ops.prototype = {
  addGame: function(game) {
    game = _.pick(game, 'id', 'title', 'description', 'url', 'remixurl');
    minicadeSchema.validate({games: [game]});
    if (!game.id) game.id = this._guid();
    if (_.findWhere(this.games, {id: game.id})) return null;
    var changes = {$push: [game]};
    this.games = React.addons.update(this.games, changes);
    return changes;
  },
  changeGame: function(id, props) {
    var game = _.findWhere(this.games, {id: id});
    var index = this.games.indexOf(game);
    var changes = {};

    if (!game) return null;

    changes[index] = {};
    props = _.pick(props, 'title', 'description', 'url', 'remixurl');
    minicadeSchema.validate({games: [props]}, null, true);
    Object.keys(props).forEach(function(key) {
      changes[index][key] = {$set: props[key]};
    });
    this.games = React.addons.update(this.games, changes);
    return changes;
  },
  removeGame: function(id) {
    var game = _.findWhere(this.games, {id: id});
    var index = this.games.indexOf(game);
    var changes = {$splice: [[index, 1]]};

    if (!game) return null;

    this.games = React.addons.update(this.games, changes);
    return changes;
  }
};

module.exports = Ops;
module.exports.defaultGuid = defaultGuid;
