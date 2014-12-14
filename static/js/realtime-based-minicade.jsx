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
    render: function() {
      var game = this.props.game;
      var embellishedGame = RealtimeClient.embellish(this.props.game);

      return (
        <div className="row">
          <div className="col-sm-8">
            <h6><a href={game.url} target="_blank">{game.title}</a></h6>
            <p><small>{game.description}</small></p>
          </div>
          <div className="col-sm-4 text-right">
            <ul className="list-inline" style={{marginTop: 10, marginBottom: 10}}>
              <li><a href="#" onClick={this.handleEdit}><span className="glyphicon glyphicon-pencil"></span><span className="sr-only">Edit</span></a></li>
              <li><a href="#" onClick={this.handleRemove}><span className="glyphicon glyphicon-trash"></span><span className="sr-only">Remove</span></a></li>
              <li><a href="#" onClick={this.handleClone}><span className="glyphicon glyphicon-retweet"></span><span className="sr-only">Clone</span></a></li>
              {embellishedGame.remixurl
               ? <li>
                   <button className="btn btn-awsm btn-awsmblue btn-xs" onClick={this.props.onRemix.bind(null, game, embellishedGame)}>{embellishedGame.remixaction}</button>
                 </li>
               : null}
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
              <div className="row">
                <div className="col-sm-6 form-group">
                  <label>Title (required)</label>
                  <input ref="title" className="form-control input-sm" type="text" required defaultValue={game.title}/>
                </div>
                <div className="col-sm-6 form-group">
                  <label>Description</label>
                  <input ref="description" className="form-control input-sm" type="text" defaultValue={game.description}/>
                </div>
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

  var RemixModal = React.createClass({
    $modal: function() {
      return $(this.refs.modal.getDOMNode());
    },
    handlePostMessage: function(e) {
      if (e.source && e.source === this.remixWindow) {
        var match = e.data.match(
          /^minicade:(url|remixurl):(https?:\/\/.+)$/
        );
        if (!match) return;
        var field = match[1];
        var url = match[2];
        if (!this.refs[field]) return;
        this.refs[field].getDOMNode().value = url;
      }
    },
    handleModalHidden: function() {
      this.props.onClose();
    },
    handleOkay: function() {
      this.remixWindow = window.open(this.props.embellishedGame.remixurl);
      this.setState({step: 2});
    },
    handleSubmit: function(e) {
      var game = this.props.game;
      e.preventDefault();
      this.props.onSubmit({
        id: game.id,
        url: this.refs.url.getDOMNode().value,
        remixurl: game.remixurl && this.refs.remixurl.getDOMNode().value
      });
      this.$modal().modal('hide');
    },
    getInitialState: function() {
      return {
        step: 1
      };
    },
    componentDidMount: function() {
      window.addEventListener("message", this.handlePostMessage, false);
      this.$modal().modal()
        .on('hidden.bs.modal', this.handleModalHidden);
    },
    componentWillUnmount: function() {
      window.removeEventListener("message", this.handlePostMessage, false);
      this.$modal().data('bs.modal', null)
        .off('hidden.bs.modal', this.handleModalHidden);
    },
    render: function() {
      var game = this.props.game;
      var remixtool = this.props.embellishedGame.remixtool ||
                      'a different website';
      var content;

      if (this.state.step == 1) {
        content = (
          <div>
            <div className="modal-body">
              <p>You are about to start remixing <strong>{game.title}</strong> in {remixtool}.</p>
              <p>When you're done remixing, please take note of the URL of your remix. If it's different from <code>{game.url}</code>, you will need to edit your Minicade to point to your remix.</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-awsm" data-dismiss="modal">Nevermind</button>
              <button className="btn btn-awsm" onClick={this.handleOkay}>Okay</button>
            </div>
          </div>
        );
      } else {
        content = (
          <form onSubmit={this.handleSubmit} className="form">
            <div className="modal-body">
              <p>Done remixing? Please update the information below if your game's URL changed.</p>
              <div className="form-group">
                <label>URL (required)</label>
                <input ref="url" className="form-control input-sm" type="url" required defaultValue={game.url} placeholder="http://"/>
              </div>
              {game.remixurl
              ? <div className="form-group">
                  <label>Remix URL</label>
                  <input ref="remixurl" className="form-control input-sm" type="url" defaultValue={game.remixurl} placeholder="http://"/>
                </div>
              : null}
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-awsm">Done</button>
            </div>
          </form>
        );
      }

      return (
        <div ref="modal" className="modal fade">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <button type="button" className="close" data-dismiss="modal" aria-hidden="true">&times;</button>
                <h4 className="modal-title">Remix {game.title}</h4>
              </div>
              {content}
            </div>
          </div>
        </div>
      );
    }
  });

  var ConnectionStatus = React.createClass({
    render: function() {
      return (
        <p style={{
          color: 'lightgray',
          opacity: this.props.connected ? 0 : 1,
          transition: 'opacity 0.5s',
          webkitTransition: 'opacity 0.5s'
        }}><small>
          <span className="glyphicon glyphicon-flash"></span>
          Connecting to server&hellip;
        </small></p>
      );
    }
  });

  var RealtimeMinicade = React.createClass({
    getInitialState: function() {
      return {
        modal: null,
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
    handleCloseModal: function() {
      this.setState({modal: null});
    },
    handleRemixGame: function(game, embellishedGame) {
      this.setState({
        modal: <RemixModal game={game} embellishedGame={embellishedGame} onClose={this.handleCloseModal} onSubmit={this.handleEditGameSubmit}/>
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
                : <GameRow key={game.id} game={game} onEdit={this.handleEditGame} onRemove={this.handleRemoveGame} onClone={this.handleCloneGame} onRemix={this.handleRemixGame}/>
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
            {this.state.modal}
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
            <ConnectionStatus connected={this.props.connected}/>
          </div>
        </section>
      );
    }
  });

  $(function() {
    var bin = $('meta[name=bin]').attr('content');
    var sendQueue = [];
    var onChange = function() {
      var connected = (ws.readyState == WebSocket.OPEN);
      var app = React.render(
        <RealtimeMinicade bin={bin} backend={backend} games={backend.games} connected={connected}/>,
        $('#page')[0]
      );
      // For use in debug console only!
      window.app = app;

      // For use by minicade.js.
      window.MAKES = backend.games.map(function(game) {
        return {
          title: game.title,
          contenturl: RealtimeClient.embellish(game).contenturl
        };
      });
    };
    var backend = RealtimeClient(function sendMessage(data) {
      data = JSON.stringify(data);
      if (ws.readyState == WebSocket.OPEN) {
        ws.send(data);
      } else {
        sendQueue.push(data);
      }
    }, onChange);

    var ws = new ReconnectingWebSocket('ws://' + location.host + '/f/' + bin);
    ws.addEventListener('open', function() {
      sendQueue.splice(0).forEach(ws.send.bind(ws));
      onChange();
    });
    ws.addEventListener('close', onChange);
    ws.addEventListener('error', onChange);
    ws.addEventListener('message', function(event) {
      backend.receiveMessage(JSON.parse(event.data));
    });
    onChange();
  });
})();
