var _ = require('underscore');
var React = require('react/addons');

var Ops = require('./ops');

module.exports = function RealtimeClient(sendMessage, onChange) {
  var ops = new Ops();
  var self = {
    addGame: function(game) {
      game = _.extend({}, game, {id: Ops.defaultGuid()});
      ops.addGame(game);
      sendMessage({cmd: 'addGame', args: [game]});
      onChange();
    },
    changeGame: function(id, props) {
      ops.changeGame(id, props);
      sendMessage({cmd: 'changeGame', args: [id, props]});
      onChange();
    },
    removeGame: function(id) {
      ops.removeGame(id);
      sendMessage({cmd: 'removeGame', args: [id]});
      onChange();
    },
    receiveMessage: function(data) {
      if (data.cmd == 'setGames') {
        ops.games = data.args[0];
        onChange();
      } else {
        var changes = ops[data.cmd].apply(ops, data.args);
        if (changes)
          onChange();
      }
    }
  };

  Object.defineProperty(self, 'games', {
    get: function() { return ops.games; }
  });

  return self;
};
