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

function noop() {
}

function FakeBackend(listener, guid) {
  this.games = [];
  this._listener = listener || noop;
  this._guid = guid || defaultGuid;
  this._listener(this);
}

FakeBackend.prototype = {
  addGame: function(game) {
    game = _.pick(game, 'title', 'description', 'url');
    game.id = this._guid();
    var changes = {$push: [game]};
    this.games = React.addons.update(this.games, changes);
    this._listener(this);
    return changes;
  },
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
    this._listener(this);
    return changes;
  },
  removeGame: function(id) {
    var game = _.findWhere(this.games, {id: id});
    var index = this.games.indexOf(game);
    var changes = {$splice: [[index, 1]]};

    this.games = React.addons.update(this.games, changes);
    this._listener(this);
    return changes;
  }
};

module.exports = FakeBackend;
module.exports.defaultGuid = defaultGuid;
