(function() {
  var _ = require('underscore');

  function FakeBackend(listener) {
    this.games = [];
    this._listener = listener;
    setTimeout(this._listener.bind(this, this.games), 0);
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

  var GameRow = React.createClass({
    handleEdit: function() {
      this.props.onEdit(this.props.game);
    },
    handleRemove: function() {
      if (window.confirm(
        "Are you sure you want to remove the game '" +
        this.props.game.title + "' from your minicade? This cannot be undone."
      )) {
        this.props.onRemove(this.props.game);
      }
    },
    render: function() {
      var game = this.props.game;

      return (
        <div className="row">
          <div className="col-sm-8">
            <h6><a href={game.url} target="_blank">{game.title}</a></h6>
            <p><small>{game.description}</small></p>
            <button onClick={this.handleEdit}>Edit</button>
            <button onClick={this.handleRemove}>Remove</button>
          </div>
        </div>
      );
    }
  });

  var AddOrEditGameRow = React.createClass({
    componentDidMount: function() {
      this.refs.title.getDOMNode().focus();
    },
    handleSubmit: function(e) {
      e.preventDefault();
      this.props.onSubmit({
        id: this.props.game.id,
        title: this.refs.title.getDOMNode().value,
        description: this.refs.description.getDOMNode().value,
        url: this.refs.description.getDOMNode().value
      });
    },
    handleCancel: function(e) {
      e.preventDefault();
      this.props.onCancel(this.props.game);
    },
    render: function() {
      var game = this.props.game;

      return (
        <div className="row">
          <div className="col-sm-8">
            <form onSubmit={this.handleSubmit}>
              <input ref="title" type="text" defaultValue={game.title} placeholder="title"/>
              <input ref="description" type="text" defaultValue={game.description} placeholder="description"/>
              <input ref="url" type="text" defaultValue={game.url} placeholder="http://"/>
              <button type="submit">Save</button>
              <button onClick={this.handleCancel}>Cancel</button>
            </form>
          </div>
        </div>
      );
    }
  });

  var FirebaseMinicade = React.createClass({
    getInitialState: function() {
      return {
        editingGame: null,
        newGame: null
      };
    },
    handleRemoveGame: function(game) {
      this.props.backend.removeGame(game.id);
    },
    handleEditGame: function(game) {
      this.setState({
        editingGame: game.id,
        newGame: null
      });
    },
    handleEditGameSubmit: function(game) {
      this.setState({editingGame: null});
      this.props.backend.changeGame(game.id, game);
    },
    handleEditGameCancel: function(game) {
      this.setState({editingGame: null});
    },
    handleAddGame: function() {
      this.setState({
        editingGame: null,
        newGame: {
          id: null,
          title: '',
          description: '',
          url: ''
        }
      });
    },
    handleAddGameSubmit: function(game) {
      this.setState({newGame: null});
      this.props.backend.addGame(game);
    },
    handleAddGameCancel: function(game) {
      this.setState({newGame: null});
    },
    render: function() {
      var bin = this.props.bin;
      var games = this.props.games;
      var rows;

      if (games.length || this.state.newGame) {
        rows = (
          <div className="playlist-rows">
            {games.map(function(game) {
              return (
                this.state.editingGame == game.id
                ? <AddOrEditGameRow key={game.id} game={game} onSubmit={this.handleEditGameSubmit} onCancel={this.handleEditGameCancel}/>
                : <GameRow key={game.id} game={game} onEdit={this.handleEditGame} onRemove={this.handleRemoveGame}/>
              );
            }, this)}
            {this.state.newGame
             ? <AddOrEditGameRow game={this.state.newGame} onSubmit={this.handleAddGameSubmit} onCancel={this.handleAddGameCancel}/>
             : null}
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
          {this.state.newGame
           ? null
           : <button className="btn btn-awsm" onClick={this.handleAddGame}>Add Game</button>}
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
