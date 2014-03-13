var FancyFriday = (function() {
  var FOCUS_CHECK_INTERVAL = 10;
  var DEFAULT_PLAY_TIME = 5;
  var DEFAULT_ENDING_TIME = 2;
  var DEFAULT_DIFFICULTY = "easy";
  var SANDBOX_PERMISSIONS = [
    'allow-same-origin',
    'allow-scripts',
    'allow-pointer-lock',
  ];

  var FancyFriday = {};
  var CustomEvent = function CustomEvent(type, params) {
    params = params || {bubbles: false, cancelable: false};
    var event = document.createEvent('CustomEvent');
    event.initCustomEvent(type, params.bubbles, params.cancelable,
                          params.detail);
    return event;
  };

  FancyFriday.Microgame = function Microgame(url, options) {
    options = options || {};

    var microgame = document.createElement('div');
    var timeBar = document.createElement('div');
    var timeRemaining = document.createElement('div');
    var iframe = document.createElement('iframe');
    var difficulty = options.difficulty || DEFAULT_DIFFICULTY;
    var playTime = options.playTime || DEFAULT_PLAY_TIME;
    var endingTime = options.endingTime || DEFAULT_ENDING_TIME;
    var outOfTimeTimeout;

    if (typeof(options.sandbox) == 'undefined')
      options.sandbox = SANDBOX_PERMISSIONS;

    if (Array.isArray(options.sandbox))
      options.sandbox = options.sandbox.join(' ');

    if (typeof(options.sandbox) == 'string')
      iframe.sandbox = options.sandbox;

    iframe.src = url + (url.indexOf('?') == -1 ? '?' : '&') +
                 'playTime=' + playTime +
                 '&endingTime=' + endingTime +
                 '&difficulty=' + difficulty +
                 '&cacheBust=' + Date.now();
    microgame.classList.add('ff-microgame');
    microgame.classList.add('ff-loading');
    timeBar.classList.add('ff-time-bar');
    timeBar.appendChild(timeRemaining);
    timeRemaining.classList.add('ff-time-remaining');
    microgame.appendChild(timeBar);
    microgame.appendChild(iframe);

    microgame.MICROGAME_LOADING = 0;
    microgame.MICROGAME_READY = 1;
    microgame.MICROGAME_PLAYING = 2;
    microgame.MICROGAME_ENDING = 3;
    microgame.MICROGAME_ENDED = 4;

    microgame.microgameState = microgame.MICROGAME_LOADING;
    microgame.score = 0;
    microgame.autoplay = options.autoplay || false;

    microgame.handleMessage = function(data) {
      data = typeof(data) == 'string' ? {type: data} : data;

      if (!data) return;
      if (data.score >= 0 && data.score <= 1) microgame.score = data.score;

      if (data.type == "end")
        microgame.dispatchEvent(new CustomEvent("microgameending"));
    };

    microgame.send = function(message) {
      if (typeof(message) == "string") message = {type: message};
      iframe.contentWindow.postMessage(message, "*");
    };

    microgame.play = function() {
      if (microgame.microgameState < microgame.MICROGAME_READY)
        microgame.autoplay = true;
      if (microgame.microgameState != microgame.MICROGAME_READY) return;

      microgame.microgameState = microgame.MICROGAME_PLAYING;
      microgame.classList.remove("ff-loading");

      var focusCheckInterval = setInterval(function() {
        iframe.contentWindow.focus();
        if (document.activeElement !== iframe) return;
        clearInterval(focusCheckInterval);
        timeRemaining.style.transition = "width linear " + playTime + "s";
        timeRemaining.style.width = "0%";
        outOfTimeTimeout = setTimeout(function() {
          microgame.dispatchEvent(new CustomEvent("microgameending"));
          microgame.send("outoftime");
        }, playTime * 1000);
        microgame.send({type: "play"});
      }, FOCUS_CHECK_INTERVAL);
    };

    iframe.addEventListener("load", function() {
      if (microgame.microgameState != microgame.MICROGAME_LOADING) return;

      microgame.microgameState = microgame.MICROGAME_READY;
      microgame.dispatchEvent(new CustomEvent("microgameready"));
    });

    microgame.addEventListener("microgameready", function(e) {
      if (microgame.autoplay) microgame.play();
    });

    microgame.addEventListener("microgameending", function(e) {
      if (microgame.microgameState != microgame.MICROGAME_PLAYING) return;

      microgame.microgameState = microgame.MICROGAME_ENDING;
      var curtain = document.createElement('div');
      curtain.classList.add('ff-invisible-curtain');
      microgame.appendChild(curtain);
      clearTimeout(outOfTimeTimeout);
      timeBar.classList.add('ff-ending');
      setTimeout(function() {
        microgame.microgameState = microgame.MICROGAME_ENDED;
        microgame.dispatchEvent(new CustomEvent("microgameended"));
      }, endingTime * 1000);
    });

    return microgame;
  }

  window.addEventListener("message", function(e) {
    var microgames = document.querySelectorAll(".ff-microgame > iframe");

    for (var i = 0; i < microgames.length; i++)
      if (e.source === microgames[i].contentWindow)
        microgames[i].parentNode.handleMessage(e.data);
  }, false);

  return FancyFriday;
})();
