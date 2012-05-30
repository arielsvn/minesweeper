
require.config({
  paths: {
    jquery: 'libs/jquery-1.5.1',
    underscore: 'libs/underscore',
    backbone: 'libs/backbone',
    text: 'libs/text'
  }
});

require(['views/game', 'jquery'], function(Game) {
  var game;
  return game = new Game(9, 9, 10);
});
