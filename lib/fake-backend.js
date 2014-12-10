var _ = require('underscore');
var React = require('react/addons');

function defaultGuid() {
  return Math.floor(Math.random() * 10000000).toString(16);
}

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
    this.games = React.addons.update(this.games, {
      $push: [game]
    });
    this._listener(this);
    return game.id;
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
  },
  removeGame: function(id) {
    var game = _.findWhere(this.games, {id: id});
    var index = this.games.indexOf(game);

    this.games = React.addons.update(this.games, {
      $splice: [[index, 1]]
    });

    this._listener(this);
  }
};

module.exports = FakeBackend;
module.exports.defaultGuid = defaultGuid;
