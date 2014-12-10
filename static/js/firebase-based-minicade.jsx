(function() {
  var _ = require('underscore');

  function FakeBackend(listener) {
    this.games = [];
    this._listener = listener;
    this._listener(this.games);
  }

  FakeBackend.prototype = {
    addGame: function(game) {
      game = _.pick(game, 'title', 'description', 'url');
      game.id = Math.floor(Math.random() * 10000000).toString(16);
      this.games = React.addons.update(this.games, {
        $push: [game]
      });
      this._listener(this.games);
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
      this._listener(this.games);
    },
    removeGame: function(id) {
      var game = _.findWhere(this.games, {id: id});
      var index = this.games.indexOf(game);

      this.games = React.addons.update(this.games, {
        $splice: [[index, 1]]
      });

      this._listener(this.games);
    }
  };

  var FirebaseMinicade = React.createClass({
    render: function() {
      var bin = this.props.bin;
      var games = this.props.games;
      var rows;

      if (games.length) {
        rows = (
          <div className="playlist-rows">
            {games.map(function(game) {
              return (
                <div className="row" key={game.id}>
                  <div className="col-sm-12 instructions">
                    <p>TODO: UI for game {game.id}, "{game.title}"</p>
                  </div>
                </div>
              );
            })}
          </div>
        );
      } else {
        rows = (
          <div className="playlist-rows">
            <div className="row">
              <div className="col-sm-12 instructions">
                <p>There are no games in this minicade.</p>
              </div>
            </div>
          </div>
        );
      }

      return (
        <section>
          <div className="container">
            <h2 className="subheading">
              <span className="tag-name">{bin}</span>
            </h2>
            <div className="row joystick">
              <img src="/images/joystick.png"/>
            </div>
            {rows}
          </div>
        </section>
      );
    }
  });

  $(function() {
    var bin = $('meta[name=bin]').attr('content');

    function renderApp(games) {
      var app = React.render(
        <FirebaseMinicade bin={bin} backend={backend} games={games}/>,
        $('#page')[0]
      );
      // For use in debug console only!
      window.app = app;
    }

    var backend = new FakeBackend(renderApp);

    // For use in debug console only!
    window.backend = backend;
  });
})();
