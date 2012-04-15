var __slice = Array.prototype.slice,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

define(['views/cell', 'text!templates/table-container-template.html', 'jquery', 'underscore', 'backbone'], function() {
  var Cell, CellState, Game, bidimensionalArray, libs, tableTemplate;
  Cell = arguments[0], tableTemplate = arguments[1], libs = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
  CellState = {
    empty: 0,
    hidden: 1,
    info: 2,
    mineBlown: 3,
    mineVisible: 4,
    flagued: 5,
    unknown: 6
  };
  bidimensionalArray = function(defaultValue, rows, cols) {
    var i, j, _results;
    _results = [];
    for (j = 0; 0 <= rows ? j <= rows : j >= rows; 0 <= rows ? j++ : j--) {
      _results.push((function() {
        var _results2;
        _results2 = [];
        for (i = 0; 0 <= cols ? i <= cols : i >= cols; 0 <= cols ? i++ : i--) {
          _results2.push(defaultValue);
        }
        return _results2;
      })());
    }
    return _results;
  };
  Game = (function(_super) {

    __extends(Game, _super);

    function Game() {
      Game.__super__.constructor.apply(this, arguments);
    }

    Game.prototype.el = $('#gameapp');

    Game.prototype.tableTemplate = _.template(tableTemplate);

    Game.prototype.initialize = function(rows, cols, numberOfMines) {
      this.rows = rows;
      this.cols = cols;
      this.numberOfMines = numberOfMines;
      return this.reset();
    };

    Game.prototype.reset = function() {
      this.minesPlaced = false;
      this.gameOver = false;
      this.board = bidimensionalArray(CellState.hidden, this.rows, this.cols);
      this.mines = bidimensionalArray(false, this.rows, this.cols);
      this.visitedCells = bidimensionalArray(false, this.rows, this.cols);
      return this.render();
    };

    Game.prototype.render = function() {
      return this.$('#table-container').html(this.tableTemplate({}));
    };

    Game.prototype.events = {
      "click #table-container tr th": "cellClicked",
      "click #reset-button": "reset"
    };

    Game.prototype.cellClicked = function(event) {
      var col, row;
      row = parseInt(event.currentTarget.attributes['data-row'].value);
      col = parseInt(event.currentTarget.attributes['data-col'].value);
      return this.markCell(row, col);
    };

    Game.prototype.markCell = function(row, col) {
      var cell, mark, visitedCells,
        _this = this;
      if (!this.minesPlaced) this.addMines();
      if (!this.gameOver && this.board[row][col] === CellState.hidden) {
        cell = this.$("th[data-row=" + row + "][data-col=" + col + "]");
        if (this.mines[row][col]) {
          this.showMines();
          return $('div.cell-content', cell).html('x');
        } else {
          visitedCells = this.visitedCells;
          mark = function(i, j) {
            var i1, j1, minesNear, _ref, _ref2, _ref3, _ref4;
            cell = _this.$("th[data-row=" + i + "][data-col=" + j + "]");
            if ((visitedCells[i] != null) && (visitedCells[i][j] != null) && !visitedCells[i][j] && !_this.mines[i][j]) {
              visitedCells[i][j] = true;
              minesNear = _this.countMinesNear(i, j);
              if (minesNear === 0) {
                _this.board[i][j] = CellState.empty;
                $('div.cell-content', cell).removeClass('hidden');
                $('div.cell-content', cell).addClass('emptyxx');
              } else {
                _this.board[i][j] = CellState.info;
                $('div.cell-content', cell).html(minesNear);
              }
              for (i1 = _ref = i - 1, _ref2 = i + 1; _ref <= _ref2 ? i1 <= _ref2 : i1 >= _ref2; _ref <= _ref2 ? i1++ : i1--) {
                for (j1 = _ref3 = j - 1, _ref4 = j + 1; _ref3 <= _ref4 ? j1 <= _ref4 : j1 >= _ref4; _ref3 <= _ref4 ? j1++ : j1--) {
                  if (i1 !== i || j1 !== j) mark(i1, j1);
                }
              }
              return 0;
            }
          };
          return mark(row, col);
        }
      }
    };

    Game.prototype.countMinesNear = function(row, col) {
      var i, j, result, _ref, _ref2, _ref3, _ref4;
      result = 0;
      for (i = _ref = row - 1, _ref2 = row + 1; _ref <= _ref2 ? i <= _ref2 : i >= _ref2; _ref <= _ref2 ? i++ : i--) {
        if (this.mines[i]) {
          for (j = _ref3 = col - 1, _ref4 = col + 1; _ref3 <= _ref4 ? j <= _ref4 : j >= _ref4; _ref3 <= _ref4 ? j++ : j--) {
            if ((i !== row || j !== col) && (this.mines[i][j] != null) && this.mines[i][j]) {
              result += 1;
            }
          }
        }
      }
      return result;
    };

    Game.prototype.showMines = function() {
      var i, j, _ref, _results;
      this.gameOver = true;
      _results = [];
      for (i = 0, _ref = this.rows; 0 <= _ref ? i <= _ref : i >= _ref; 0 <= _ref ? i++ : i--) {
        _results.push((function() {
          var _ref2, _results2;
          _results2 = [];
          for (j = 0, _ref2 = this.cols; 0 <= _ref2 ? j <= _ref2 : j >= _ref2; 0 <= _ref2 ? j++ : j--) {
            if (this.mines[i][j]) {
              _results2.push(this.$("th[data-row=" + i + "][data-col=" + j + "] div").html('0'));
            } else {
              _results2.push(void 0);
            }
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };

    Game.prototype.addMines = function() {
      this.mines[0][2] = true;
      this.mines[1][2] = true;
      this.mines[2][2] = true;
      this.mines[3][2] = true;
      return this.mines[4][2] = true;
    };

    return Game;

  })(Backbone.View);
  return Game;
});
