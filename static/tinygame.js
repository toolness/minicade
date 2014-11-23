/*!
 * Tinygame v0.2
 * https://github.com/toolness/fancy-friday
 */

var Tinygame = (function() {
  var DEFAULTS = {playTime: 5, endingTime: 2, difficulty: "easy"};

  var Tinygame = {};
  var queryArgs = getQueryArgs(window.location.search);
  var inDevelopmentMode = !('playTime' in queryArgs) || queryArgs.dev == '1';
  var metagame = inDevelopmentMode ? window : window.parent;
  var script = document.scripts[document.scripts.length-1];
  var preventReadyOnLoad = false;

  function getArg(name) {
    var attrName = 'data-' + name.toLowerCase();

    if (name in queryArgs) return queryArgs[name];
    if (script.hasAttribute(attrName))
      return script.getAttribute(attrName);
    return DEFAULTS[name];
  }

  function getTimeArg(name) {
    value = parseFloat(getArg(name));
    return (isNaN(value) || value <= 0) ? DEFAULTS[name] : value;
  }

  // This is based on http://stackoverflow.com/a/2091331/2422398.
  function getQueryArgs(searchString) {
    var args = {};
    var query = searchString.substring(1);
    var pairs = query.split('&');
    for (var i = 0; i < pairs.length; i++) {
      var pair = pairs[i].split('=');
      args[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1]);
    }
    return args;
  }

  function startDevelopmentMode() {
    var timeBar = document.createElement('div');
    var timeRemaining = document.createElement('div');
    var outOfTimeTimeout;
    var hasStartedPlaying = false;

    function cleanup() {
      clearTimeout(outOfTimeTimeout);
      if (timeBar) {
        timeBar.parentNode.removeChild(timeBar);
        timeBar = null;
        timeRemaining = null;
      }
    }

    function startPlaying() {
      if (hasStartedPlaying) return;
      hasStartedPlaying = true;
      timeRemaining.style.width = "0";
      window.postMessage({type: "play"}, "*");
      outOfTimeTimeout = setTimeout(function() {
        cleanup();
        window.postMessage({type: "outoftime"}, "*");
      }, Tinygame.playTime * 1000);
    }

    function addTimeBar() { document.body.appendChild(timeBar); }

    timeBar.style.position = "absolute";
    timeBar.style.top = "0";
    timeBar.style.left = "0";
    timeBar.style.width = "100%";
    timeBar.style.height = "8px";
    timeBar.style.backgroundColor = "rgba(255, 255, 255, 0.8)";
    timeBar.style.zIndex = "100000";

    timeRemaining.style.width = "100%";
    timeRemaining.style.height = "100%";
    timeRemaining.style.transition = "width linear " + Tinygame.playTime + "s";
    timeRemaining.style.backgroundColor = "rgba(0, 0, 0, 0.5)";

    timeBar.appendChild(timeRemaining);
    if (document.body)
      addTimeBar();
    else
      window.addEventListener("DOMContentLoaded", addTimeBar, false);

    if (window.parent !== window)
      // The user may be in an editor like Thimble or jsbin; we'll bind
      // alt-R to make it easy for the user to reload the page and start
      // the microgame over.
      window.addEventListener("keydown", function(event) {
        if (event.altKey && String.fromCharCode(event.keyCode) == 'R') {
          event.preventDefault();
          window.location.reload();
        }
      }, true);

    window.addEventListener("message", function(event) {
      var data = event.data;

      if (!data) return;
      if (data.type == 'ready') {
        startPlaying();        
      } else if (data.type == 'end') {
        cleanup();
      }
    });
  }

  Tinygame.playTime = getTimeArg('playTime');
  Tinygame.endingTime = getTimeArg('endingTime');
  Tinygame.difficulty = getArg('difficulty');
  Tinygame.loading = function() {
    preventReadyOnLoad = true;
  };
  Tinygame.loaded = function() {
    metagame.postMessage({type: 'ready'}, '*');
  };
  Tinygame.end = function(score) {
    var data = {type: 'end'};
    if (typeof(score) == 'number') data.score = score;
    metagame.postMessage(data, "*");
  };
  Tinygame.win = Tinygame.end.bind(Tinygame, 1.0);
  Tinygame.lose = Tinygame.end.bind(Tinygame, 0);

  window.addEventListener("load", function() {
    if (!preventReadyOnLoad)
      metagame.postMessage({type: 'ready'}, '*');
  }, false);

  window.addEventListener("message", function(event) {
    if (!event.data || typeof(event.data) != "object") return;
    var handler = Tinygame['on' + event.data.type];
    if (typeof(handler) == 'function') handler(event.data);
  }, false);

  if (inDevelopmentMode) startDevelopmentMode();

  return Tinygame;
})();
