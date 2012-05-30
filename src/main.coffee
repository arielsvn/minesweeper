require.config
  paths:
    jquery: 'libs/jquery-1.5.1',
#    jquery_rightClick: 'libs/jquery.rightClick'
    jqueryui: 'libs/jquery-ui-1.8.11'
    underscore: 'libs/underscore'
    backbone: 'libs/backbone'
    text: 'libs/text'
    modernizr: 'libs/modernizr-1.7'

require ['views/game', 'modernizr', 'jquery', 'jqueryui'], (Game)->
  window.appview = new Game 9,9, 10


  $('#wondialog').dialog
#    autoOpen: false
    modal: true
    resizable: false
    title: 'Congrats'
    overlay:
      background: '#99ccff'
    buttons:
      'Ok': ()-> $(this).dialog 'close'
