require.config
  paths:
    jquery: 'libs/jquery-1.5.1',
#    jquery_rightClick: 'libs/jquery.rightClick'
    underscore: 'libs/underscore',
    backbone: 'libs/backbone',
    text: 'libs/text'
    modernizr: 'libs/modernizr-1.7'


require ['views/game', 'modernizr', 'jquery'], (Game)->
  window.appview = new Game 9,9, 10
