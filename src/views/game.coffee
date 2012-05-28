define ['views/cell','text!templates/table-container-template.html','jquery','underscore','backbone'],
  (Cell, tableTemplate, libs...)->
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
        getNeighbors = (row, col) =>
          result=[]
          for i in [row-1..row+1]
            for j in [col-1..col+1]
              if this.cells[i]? and not (i is row and j is col) and this.cells[i][j]?
                result.push(this.cells[i][j])
          result

        for i in [0...this.rows]
          for j in [0...this.cols]
            cell= new Cell
              el: this.$("th[data-row=#{i}][data-col=#{j}]")

            this.cells[i][j]=cell

        for i in [0...this.rows]
          for j in [0...this.cols]
            this.cells[i][j].getNeighbors = getNeighbors(i, j)

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

        this.cells[row][col].mark()

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
        this.cells[0][2].hasBomb=true
        this.cells[1][2].hasBomb=true
        this.cells[2][2].hasBomb=true
        this.cells[3][2].hasBomb=true
        this.cells[4][2].hasBomb=true


    Game