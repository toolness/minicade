(function() {
  var RealtimeClient = require('./lib/realtime/client');

  var GameRow = React.createClass({
    handleEdit: function(e) {
      e.preventDefault();
      this.props.onEdit(this.props.game);
    },
    handleRemove: function(e) {
      e.preventDefault();
      if (window.confirm(
        "Are you sure you want to remove the game '" +
        this.props.game.title + "' from your minicade? This cannot be undone."
      )) {
        this.props.onRemove(this.props.game);
      }
    },
    handleClone: function(e) {
      e.preventDefault();
      this.props.onClone(this.props.game);
    },
    handleRemix: function(e) {
      window.open(this.props.game.remixurl);
    },
    render: function() {
      var game = this.props.game;

      return (
        <div className="row">
          <div className="col-sm-8">
            <h6><a href={game.url} target="_blank">{game.title}</a></h6>
            <p><small>{game.description}</small></p>
          </div>
          <div className="col-sm-4 text-right">
            {game.remixurl
             ? <h6>
                 <button className="btn btn-awsm btn-awsmblue btn-xs" onClick={this.handleRemix}>Remix Game</button>
               </h6>
             : null}
            <ul className="list-inline" style={{marginTop: 10, marginBottom: 10}}>
              <li><a href="#" onClick={this.handleEdit}><span className="glyphicon glyphicon-pencil"></span><span className="sr-only">Edit</span></a></li>
              <li><a href="#" onClick={this.handleRemove}><span className="glyphicon glyphicon-trash"></span><span className="sr-only">Remove</span></a></li>
              <li><a href="#" onClick={this.handleClone}><span className="glyphicon glyphicon-retweet"></span><span className="sr-only">Clone</span></a></li>
            </ul>
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
        url: this.refs.url.getDOMNode().value,
        remixurl: this.refs.remixurl.getDOMNode().value
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
          <div className="col-sm-12">
            <br/>
            <p>Enter information about the minigame below.</p>
            <form className="form" role="form" onSubmit={this.handleSubmit}>
              <div className="form-group">
                <label>Title (required)</label>
                <input ref="title" className="form-control input-sm" type="text" required defaultValue={game.title}/>
              </div>
              <div className="form-group">
                <label>Description</label>
                <input ref="description" className="form-control input-sm" type="text" defaultValue={game.description}/>
              </div>
              <div className="form-group">
                <label>URL (required)</label>
                <input ref="url" className="form-control input-sm" type="url" required defaultValue={game.url} placeholder="http://"/>
              </div>
              <div className="form-group">
                <label>Remix URL</label>
                <input ref="remixurl" className="form-control input-sm" type="url" defaultValue={game.remixurl} placeholder="http://"/>
              </div>
              <ul className="list-inline">
                <li><button className="btn btn-awsm btn-xs" type="submit">Save</button></li>
                <li><button className="btn btn-awsm btn-awsmblue btn-xs" onClick={this.handleCancel}>Cancel</button></li>
              </ul>
            </form>
          </div>
        </div>
      );
    }
  });

  var RealtimeMinicade = React.createClass({
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
    handleCloneGame: function(game) {
      this.setState({
        editingGame: null,
        newGame: {
          id: null,
          title: game.title,
          description: game.description,
          url: game.url,
          remixurl: game.remixurl
        }
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
          url: '',
          remixurl: ''
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
                : <GameRow key={game.id} game={game} onEdit={this.handleEditGame} onRemove={this.handleRemoveGame} onClone={this.handleCloneGame}/>
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
            {games.length
             ? <div>
                 <p>This is an arcade of {games.length} {games.length == 1 ? "minigame" : "minigames"}.</p>
                 <a href="#play" className="btn btn-awsm">Play Minicade</a>
                 <br/>
                 <br/>
               </div>
             : null}
            <div className="row joystick">
              <img src="/images/joystick.png"/>
            </div>
            {rows}
            <br/>
            {this.state.newGame
             ? null
             : <button className="btn btn-awsm btn-sm" onClick={this.handleAddGame}><span className="glyphicon glyphicon-plus"></span> Add Game</button>}
          </div>
        </section>
      );
    }
  });

  $(function() {
    var bin = $('meta[name=bin]').attr('content');
    var backend = RealtimeClient(function sendMessage(data) {
      // TODO: What if we're not connected to the server yet?
      ws.send(JSON.stringify(data));
    }, function onChange() {
      var app = React.render(
        <RealtimeMinicade bin={bin} backend={backend} games={backend.games}/>,
        $('#page')[0]
      );
      // For use in debug console only!
      window.app = app;

      // For use by minicade.js.
      window.MAKES = backend.games.map(function(game) {
        return {title: game.title, contenturl: game.url};
      });
    });

    var ws = new WebSocket('ws://' + location.host + '/f/' + bin);
    ws.addEventListener('close', function() {
      // TODO: Attempt to re-establish the connection.
    });
    ws.addEventListener('message', function(event) {
      backend.receiveMessage(JSON.parse(event.data));
    });
  });
})();
