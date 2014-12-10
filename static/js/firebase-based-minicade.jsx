var FirebaseMinicade = React.createClass({
  getInitialState: function() {
    return {
      games: []
    };
  },
  render: function() {
    var bin = this.props.bin;
    var games = this.state.games;
    var rows;

    if (games.length) {
      rows = (
        <div className="playlist-rows">
          {games.map(function(game) {
            return (
              <div className="row" ref={game.id}>
                <div className="col-sm-12 instructions">
                  <p>TODO: UI for game {game.id}</p>
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

  var app = React.render(
    <FirebaseMinicade bin={bin}/>,
    $('#page')[0]
  );

  // For use in debug console only!
  window.app = app;
});
