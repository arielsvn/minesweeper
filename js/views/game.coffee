define ['views/cell','text!templates/table-container-template.html','jquery','underscore','backbone'],
  (Cell, tableTemplate, libs...)->
    # todo remove this
    CellState=
      empty: 0 # represent an empty cell, no mines around
      hidden: 1 # represents a cell that hasn't been clicked
      info: 2 # shows a number with the ammount of mines near this spot
      mineBlown: 3 # after the game is completed holds represent the mine that was clicked
      mineVisible: 4
      flagued: 5 # should be a mine here
      unknown: 6

    bidimensionalArray = (defaultValue, rows, cols)-> ((defaultValue for i in [0..cols]) for j in [0..rows])

    class Game extends Backbone.View
      el: $ '#gameapp'

      tableTemplate: _.template tableTemplate

      initialize: (rows, cols, numberOfMines)->
        this.rows=rows
        this.cols=cols
        this.numberOfMines=numberOfMines

        this.reset()

      reset: ->
        this.minesPlaced=false
        this.gameOver=false
        this.render()

      render: ->
        renderedTemplate=this.tableTemplate
          rows: this.rows
          cols: this.cols
        this.$('#table-container').html renderedTemplate

        this.cells=bidimensionalArray false, this.rows, this.cols
        getNeighbors=(row,col) =>
          (this.cells[i][j] for j in [col-1..col+1] when i!=j and not (i is row and j is col) and this.cells[i][j]? for i in [row-1..row+1] when this.cells[i]?)

        for i in [0...this.rows]
          for j in [0...this.cols]
            cell= new Cell
              el: this.$("th[data-row=#{i}][data-col=#{j}]")
            i1=i; j1=j;
            cell.getNeighbors= ()=>getNeighbors(i1,j1)

            this.cells[i][j]=cell
        this

      events:
        "click #table-container tr th":  "cellClicked"
        "click #reset-button":  "reset"

      cellClicked: (event)->
        row= parseInt event.currentTarget.attributes['data-row'].value
        col= parseInt event.currentTarget.attributes['data-col'].value

        this.markCell row, col

      markCell:(row,col)->
        if not this.minesPlaced
          this.addMines()

        if not this.gameOver and this.board[row][col] is CellState.hidden
          cell=this.$("th[data-row=#{row}][data-col=#{col}]")
          if this.mines[row][col]
            # if there is a mine then game over
            this.showMines()
            $('div.cell-content', cell).html('x') # the cell clicked should look different
          else
            visitedCells=this.visitedCells
            mark=(i,j)=>
              cell=this.$("th[data-row=#{i}][data-col=#{j}]")
              if visitedCells[i]? and visitedCells[i][j]? and not visitedCells[i][j] and not this.mines[i][j]
                visitedCells[i][j]=true
                minesNear=this.countMinesNear(i,j)
                if minesNear is 0
                  this.board[i][j]=CellState.empty
                  $('div.cell-content', cell).removeClass('hidden')
                  $('div.cell-content', cell).addClass('emptyxx')
                else
                  this.board[i][j]=CellState.info
                  $('div.cell-content', cell).html(minesNear)

                for i1 in [i-1..i+1]
                  for j1 in [j-1..j+1]
                    mark(i1,j1) if i1 isnt i or j1 isnt j

                0

            mark row, col

      countMinesNear: (row,col)->
        result=0
        for i in [row-1..row+1]
          if this.mines[i]
            for j in [col-1..col+1]
              if (i isnt row or j isnt col) and this.mines[i][j]? and this.mines[i][j]
                result+=1
        return result

      showMines: ->
        this.gameOver=true
        for i in [0..this.rows]
          for j in [0..this.cols]
            if this.mines[i][j]
              this.$("th[data-row=#{i}][data-col=#{j}] div").html('0')

      addMines:->
        # adds the mines in random positions
        this.mines[0][2]=true
        this.mines[1][2]=true
        this.mines[2][2]=true
        this.mines[3][2]=true
        this.mines[4][2]=true


    return Game