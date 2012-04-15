define ['jquery','underscore','backbone'],
  (libs...)->
    CellState=
      empty: 'empty' # represent an empty cell, no mines around
      hidden: 'hidden' # represents a cell that hasn't been clicked
      info: 'info' # shows a number with the ammount of mines near this spot
      mineBlown: 'mineBlown' # after the game is completed holds represent the mine that was clicked
      mineVisible: 'mineVisible'
      flagued: 'flagued' # should be a mine here
      unknown: 'unknown'

    class Cell extends Backbone.View
      hasBomb: false
      state: CellState.hidden

      initialize: ->
        this.contentDiv=this.$('#cell-content')

      mark: ->
        # marks the current cell as visited and update the Dom
        this.discover()

        if this.hasBomb
          this.trigger('bang', this)

        # discover all hidden neighbors
        neighbor.discover() for neighbor in this.getNeighbors() when neighbor.state is CellState.hidden
        this

      discover: ->
        # reveals the content of the cell if doesn't have any mines near
        if this.state is CellState.info and this.numberOfNearMines() is 0
          this.gotoState(CellState.empty)
        else if this.state is CellState.hidden and not this.hasBomb
          if this.numberOfNearMines() is 0
            this.gotoState(CellState.empty)
          else
            this.contentDiv.html(this.numberOfNearMines())
            this.gotoState(CellState.info)

      numberOfNearMines: ->
        if this.__nearMines? then return this.__nearMines
        this.__nearMines=(n.hasBomb for n in this.getNeighbors() when n.hasBomb).length

      getNeighbors: ->
        # returns an array with the cells around this one
        # this method should be changed by the game class when the cell is created
        []

      render: ->
        this.contentDiv.addClass(this.state)

      cleanCell: ->
        # called before the state of the cell changes
        # removes all state specific tasks
        this.contentDiv.removeClass(this.state)

      gotoState: (newState)->
        # sets the current state of the cell rendering the required content
        this.cleanCell()
        this.state=newState
        this.render()

      reset: ->
        this.hasBomb=false
        this.marked=false

        this.gotoState(CellState.hidden)

    return Cell