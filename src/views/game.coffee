define ['views/cell', 'views/cellstate','text!templates/table-container-template.html','jquery','underscore','backbone'],
  (Cell, CellState, tableTemplate)->
    bidimensionalArray = (defaultValue, rows, cols)-> ((defaultValue for i in [0...cols]) for j in [0...rows])

    GameState=
      stand: 'stand'
      playing: 'playing'
      won: 'won'
      lost: 'lost'

    class Game extends Backbone.View
      el: $ '#gameapp'

      tableTemplate: _.template tableTemplate

      initialize: (rows, cols, numberOfMines)->
        this.rows=rows
        this.cols=cols
        this.numberOfMines=numberOfMines
        this.state=GameState.stand

        this.reset()

      gotoState: (state)->
        this.$el.removeClass this.state
        this.state=state
        this.$el.addClass this.state

      reset: ->
        this.minesPlaced=false
        this._gameOver=false

        this.gotoState GameState.stand

        this.$('#time-left').html '0'

        this.flags=0
        this.$('#mines-left').html this.numberOfMines

        this.render()

      render: ->
        renderedTemplate=this.tableTemplate {rows: this.rows, cols: this.cols}
        this.$('#table-container').html renderedTemplate

        this.cells=bidimensionalArray false, this.rows, this.cols

        # create the cells
        for i in [0...this.rows]
          for j in [0...this.cols]
            this.cells[i][j]= new Cell
              el: this.$("th[data-row=#{i}][data-col=#{j}]")

        # update neighbors of each cell after all cells are created
        for i in [0...this.rows]
          for j in [0...this.cols]
            getNeighbors = (row, col) =>
              result=[]
              for i in [row-1..row+1]
                for j in [col-1..col+1]
                  if this.cells[i]? and not (i is row and j is col) and this.cells[i][j]?
                    result.push(this.cells[i][j])
              result
            this.cells[i][j].neighbors = getNeighbors(i, j)
            this.cells[i][j].on('bang', this.bang, this)

        this

      gameOver: (won)->
        this._gameOver=true

        if won
          this.gotoState GameState.won
        else this.gotoState GameState.lost

      bang: (e) ->
        this.gameOver false
        # reveal all mines
        for i in [0...this.rows]
          for j in [0...this.cols]
            if this.cells[i][j].hasBomb
              this.cells[i][j].gotoState CellState.mineVisible

      events:
        "click #table-container tr th":  "cellClicked"
        "click #reset-button":  "reset"

        "contextmenu #table-container tr th": 'noContext'
        "mousedown #table-container tr th": 'cellRightClicked'

      cellRightClicked: (event)->
        if not this._gameOver
          $(event.currentTarget).mouseup (e)=>
            $(event.currentTarget).unbind 'mouseup'
            $(e.currentTarget).unbind 'mouseup'
            if e.currentTarget == event.currentTarget and e.button == event.button == 2

              row= parseInt event.currentTarget.attributes['data-row'].value
              col= parseInt event.currentTarget.attributes['data-col'].value
              this.flagCell row, col

              false
            else true

      flagCell: (row,col)->
        this.cells[row][col].flag()

        this.flags += if this.cells[row][col].state is CellState.flagued then 1 else -1
        this.$('#mines-left').html this.numberOfMines-this.flags

        this.gameOver(true) if this.gameWon()

      cellClicked: (event)->
        if not this._gameOver
          row= parseInt event.currentTarget.attributes['data-row'].value
          col= parseInt event.currentTarget.attributes['data-col'].value

          this.markCell row, col

      startTime: ->
        time=this.$('#time-left')
        currentTime=0
        updateTime = {}
        updateTime = ()=>
          if not this._gameOver
            time.html currentTime
            currentTime++
            setTimeout(updateTime, 1000)

        updateTime()

      markCell:(row,col)->
        # add the mines after the first click
        if not this.minesPlaced
          c=this.numberOfMines
          while c>0
            i=Math.round this.rows * Math.random()
            j=Math.round this.cols * Math.random()
            if (i!=row and j!=col) and 0<=i<this.rows and 0<=j<this.cols and not this.cells[i][j].hasBomb
              this.cells[i][j].hasBomb=true
              c--
          this.startTime()

          this.minesPlaced=true
          this.gotoState GameState.playing

        this.cells[row][col].mark()
        this.gameOver(true) if this.gameWon()

      countMinesNear: (row,col)->
        result=0
        for i in [row-1..row+1]
          if this.mines[i]
            for j in [col-1..col+1]
              if (i isnt row or j isnt col) and this.mines[i][j]? and this.mines[i][j]
                result+=1
        return result

      showMines: ->
        this._gameOver=true
        for i in [0..this.rows]
          for j in [0..this.cols]
            if this.mines[i][j]
              this.$("th[data-row=#{i}][data-col=#{j}] div").html('0')

      noContext: (e)->
        e.preventDefault()
        false

      gameWon: ->
        cellMarked = (cell)-> cell.state isnt CellState.hidden
        missFlagued = (cell)-> cell.state is CellState.flagued and not cell.hasBomb
        bombNotFlagued = (cell)-> cell.state isnt CellState.flagued and cell.hasBomb
        cells = _.union this.cells...

        not _.any(cells, (cell)-> missFlagued(cell) or bombNotFlagued(cell)) \
        or (not _.any(cells, (cell)-> not cell.hasBomb and not cellMarked(cell)) and not _.any(cells, (cell)-> missFlagued cell))

    Game