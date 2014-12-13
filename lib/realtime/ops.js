var _ = require('underscore');
var React = require('react/addons');

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
  // TODO: Validate inputs, throw exception on failure.
  addGame: function(game) {
    game = _.pick(game, 'title', 'description', 'url');
    game.id = this._guid();
    var changes = {$push: [game]};
    this.games = React.addons.update(this.games, changes);
    return changes;
  },
  // TODO: Validate inputs, throw exception on failure.
  changeGame: function(id, props) {
    var game = _.findWhere(this.games, {id: id});
    var index = this.games.indexOf(game);
    var changes = {};

    changes[index] = {};
    props = _.pick(props, 'title', 'description', 'url');
    Object.keys(props).forEach(function(key) {
      changes[index][key] = {$set: props[key]};
    });
    this.games = React.addons.update(this.games, changes);
    return changes;
  },
  // TODO: Validate inputs, throw exception on failure.
  removeGame: function(id) {
    var game = _.findWhere(this.games, {id: id});
    var index = this.games.indexOf(game);
    var changes = {$splice: [[index, 1]]};

    this.games = React.addons.update(this.games, changes);
    return changes;
  }
};

module.exports = Ops;
module.exports.defaultGuid = defaultGuid;
