define ['jquery','underscore','backbone'],
  ->
    empty: 'empty' # represent an empty cell, no mines around
    hidden: 'hidden' # represents a cell that hasn't been clicked
    info: 'info' # shows a number with the ammount of mines near this spot
    mineBlown: 'mineBlown' # after the game is completed holds represent the mine that was clicked
    mineVisible: 'mineVisible'
    flagued: 'flagued' # should be a mine here
    unknown: 'unknown'