var React = require('react/addons');

module.exports = function RealtimeClient(sendMessage, onChange) {
  var self = {
    games: [],
    addGame: function(game) {
      sendMessage({cmd: 'addGame', args: [game]});
    },
    changeGame: function(id, props) {
      sendMessage({cmd: 'changeGame', args: [id, props]});
    },
    removeGame: function(id) {
      sendMessage({cmd: 'removeGame', args: [id]});
    },
    receiveMessage: function(data) {
      messageHandlers[data.cmd].apply(messageHandlers, data.args);
    }
  };
  var messageHandlers = {
    setGames: function(newGames) {
      self.games = newGames;
      onChange();
    },
    updateGames: function(changes) {
      self.games = React.addons.update(self.games, changes);
      onChange();
    }
  };

  return self;
};
