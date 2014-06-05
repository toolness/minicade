var SCORE_MULTIPLIER = {easy: 100, medium: 125, hard: 150};
var PLAY_TIME = {easy: 5, medium: 4, hard: 3};
var READ_DELAY = 1500;
var MAKES = JSON.parse($('meta[name=makes]').attr('content'));

var score = 0;

function showNewScore(display, newScore, cb) {
  var h1 = $('<h1></h1>').text(scoreStr(score)).appendTo(display);

  function scoreStr(value) { return 'Score ' + value; }

  function animateScore(value) {
    h1.delay(10).queue(function(next) {
      $(this).text(scoreStr(value));
      next();
    });
  }

  while (score < newScore) animateScore(++score);
  h1.delay(READ_DELAY).queue(function(next) { next(); cb(); });
}

function playMicrogames(display, difficulty) {
  MAKES.forEach(function(info) {
    display
      .screen(info.title).delay(READ_DELAY).queue(function play(next) {
        var url = info.contenturl;
        var microgame = FancyFriday.Microgame(url, {
          autoplay: true,
          difficulty: difficulty,
          playTime: PLAY_TIME[difficulty]
        });

        microgame.addEventListener("microgameended", function() {
          var newScore = score + Math.round(microgame.score *
                                            SCORE_MULTIPLIER[difficulty]);

          $(microgame).remove();
          showNewScore(display.empty(), newScore, next);
        });
        $("body").append(microgame);
      });
  });
};

$.fn.extend({
  screen: function(content) {
    this.queue(function(next) {
      $(this).empty().append($('<h1></h1>').text(content || ''));
      next();
    });
    return this;
  }
});

$("#play").click(function() {
  var display = $("#screen .screen-container");

  $('html').addClass('playing');
  display.screen("Ready Player One").delay(READ_DELAY);
  playMicrogames(display, 'easy');
  display.screen("Getting Harder Now...").delay(READ_DELAY);
  playMicrogames(display, 'medium');
  display.screen("Maximum Difficulty!").delay(READ_DELAY);
  playMicrogames(display, 'hard');
  display.delay(READ_DELAY).screen("Game Over")
    .delay(READ_DELAY * 2).queue(function(next) {
      window.location.reload();
      next();
    });

  return false;
});
