define ['views/cellstate','jquery','underscore','backbone'],
  (CellState)->
    class Cell extends Backbone.View
      hasBomb: false
      state: CellState.hidden

      initialize: ->
        this.contentDiv=this.$('#cell-content')

      mark: ->
        if this.state isnt CellState.flagued
          if this.hasBomb
            this.trigger('bang', this)
            this.gotoState(CellState.mineBlown)
          else
            # marks the current cell as visited and update the Dom
            this.discover()

            # discover all hidden neighbors
            if not this.numberOfNearMines()
              neighbor.mark() for neighbor in this.neighbors when neighbor.state is CellState.hidden and not neighbor.hasBomb

      flag: ->
        if this.state is CellState.hidden
          this.gotoState(CellState.flagued)
          return true
        else if this.state is CellState.flagued
          this.gotoState(CellState.hidden)
          return true
        return false

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
        this.__nearMines=(n.hasBomb for n in this.neighbors when n.hasBomb).length

      neighbors: ->
        # returns an array with the cells around this one
        # this method should be changed by the game class when the cell is created
        []

      cleanCell: ->
        # called before the state of the cell changes
        # removes all state specific tasks
        this.contentDiv.removeClass(this.state)

      gotoState: (newState)->
        # sets the current state of the cell rendering the required content
        this.cleanCell()
        this.state=newState
        this.contentDiv.addClass this.state

        if this.state is CellState.info
          this.contentDiv.addClass 'num'+this.numberOfNearMines()

      reset: ->
        this.hasBomb=false
        this.gotoState(CellState.hidden)

      gameOver: -> this.gotoState(CellState.mineVisible) if this.hasBomb

    return Cell