require.config
  paths:
    jquery: 'libs/jquery-1.5.1',
    underscore: 'libs/underscore',
    backbone: 'libs/backbone',
    text: 'libs/text'
    modernizr: 'libs/modernizr-1.7'

require ['views/game', 'modernizr'], (Game, modernizr)->
  window.appview = new Game 9,9, 10
