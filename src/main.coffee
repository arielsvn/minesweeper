require.config
  paths:
    jquery: 'libs/jquery-1.5.1',
#    jquery_rightClick: 'libs/jquery.rightClick'
#    jqueryui: 'libs/jquery-ui-1.8.11'
    underscore: 'libs/underscore'
    backbone: 'libs/backbone'
    text: 'libs/text'
#    modernizr: 'libs/modernizr-1.7'

require ['views/game', 'jquery'], (Game)->
  game=new Game 9,9, 10
