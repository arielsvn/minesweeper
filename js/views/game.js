var __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

define(['views/cell', 'text!templates/table-container-template.html', 'jquery', 'underscore', 'backbone'], function(Cell, tableTemplate) {
  var Game, bidimensionalArray;
  bidimensionalArray = function(defaultValue, rows, cols) {
    var i, j, _results;
    _results = [];
    for (j = 0; 0 <= rows ? j < rows : j > rows; 0 <= rows ? j++ : j--) {
      _results.push((function() {
        var _results2;
        _results2 = [];
        for (i = 0; 0 <= cols ? i < cols : i > cols; 0 <= cols ? i++ : i--) {
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
      return this.render();
    };

    Game.prototype.render = function() {
      var getNeighbors, i, j, renderedTemplate, _ref, _ref2, _ref3, _ref4,
        _this = this;
      renderedTemplate = this.tableTemplate({
        rows: this.rows,
        cols: this.cols
      });
      this.$('#table-container').html(renderedTemplate);
      this.cells = bidimensionalArray(false, this.rows, this.cols);
      for (i = 0, _ref = this.rows; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        for (j = 0, _ref2 = this.cols; 0 <= _ref2 ? j < _ref2 : j > _ref2; 0 <= _ref2 ? j++ : j--) {
          this.cells[i][j] = new Cell({
            el: this.$("th[data-row=" + i + "][data-col=" + j + "]")
          });
        }
      }
      for (i = 0, _ref3 = this.rows; 0 <= _ref3 ? i < _ref3 : i > _ref3; 0 <= _ref3 ? i++ : i--) {
        for (j = 0, _ref4 = this.cols; 0 <= _ref4 ? j < _ref4 : j > _ref4; 0 <= _ref4 ? j++ : j--) {
          getNeighbors = function(row, col) {
            var i, j, result, _ref5, _ref6, _ref7, _ref8;
            result = [];
            for (i = _ref5 = row - 1, _ref6 = row + 1; _ref5 <= _ref6 ? i <= _ref6 : i >= _ref6; _ref5 <= _ref6 ? i++ : i--) {
              for (j = _ref7 = col - 1, _ref8 = col + 1; _ref7 <= _ref8 ? j <= _ref8 : j >= _ref8; _ref7 <= _ref8 ? j++ : j--) {
                if ((_this.cells[i] != null) && !(i === row && j === col) && (_this.cells[i][j] != null)) {
                  result.push(_this.cells[i][j]);
                }
              }
            }
            return result;
          };
          this.cells[i][j].neighbors = getNeighbors(i, j);
          this.cells[i][j].on('bang', this.bang, this);
        }
      }
      return this;
    };

    Game.prototype.bang = function(e) {
      var i, j, _ref, _results;
      this.gameOver = true;
      _results = [];
      for (i = 0, _ref = this.rows; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        _results.push((function() {
          var _ref2, _results2;
          _results2 = [];
          for (j = 0, _ref2 = this.cols; 0 <= _ref2 ? j < _ref2 : j > _ref2; 0 <= _ref2 ? j++ : j--) {
            _results2.push(this.cells[i][j].gameOver());
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };

    Game.prototype.events = {
      "click #table-container tr th": "cellClicked",
      "click #reset-button": "reset",
      "contextmenu": 'noContext',
      "mousedown #table-container tr th": 'cellRightClicked'
    };

    Game.prototype.cellRightClicked = function(event) {
      var _this = this;
      if (!this.gameOver) {
        return $(event.currentTarget).mouseup(function(e) {
          var col, row, _ref;
          $(event.currentTarget).unbind('mouseup');
          $(e.currentTarget).unbind('mouseup');
          if (e.currentTarget === event.currentTarget && (e.button === (_ref = event.button) && _ref === 2)) {
            row = parseInt(event.currentTarget.attributes['data-row'].value);
            col = parseInt(event.currentTarget.attributes['data-col'].value);
            _this.flagCell(row, col);
            return false;
          } else {
            return true;
          }
        });
      }
    };

    Game.prototype.flagCell = function(row, col) {
      this.cells[row][col].flag();
      if (this.gameWon()) return this.gameOver = true;
    };

    Game.prototype.cellClicked = function(event) {
      var col, row;
      if (!this.gameOver) {
        row = parseInt(event.currentTarget.attributes['data-row'].value);
        col = parseInt(event.currentTarget.attributes['data-col'].value);
        return this.markCell(row, col);
      }
    };

    Game.prototype.markCell = function(row, col) {
      var c, i, j;
      if (!this.minesPlaced) {
        c = this.numberOfMines;
        while (c > 0) {
          i = Math.round(this.rows * Math.random());
          j = Math.round(this.cols * Math.random());
          console.log("" + i + " x " + j);
          if ((i !== row && j !== col) && (0 <= i && i < this.rows) && (0 <= j && j < this.cols) && !this.cells[i][j].hasBomb) {
            this.cells[i][j].hasBomb = true;
            c--;
          }
        }
        this.minesPlaced = true;
      }
      return this.cells[row][col].mark();
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

    Game.prototype.noContext = function(e) {
      e.preventDefault();
      return false;
    };

    Game.prototype.gameWon = function() {
      return _.any(_.union.apply(_, this.cells), function(cell) {
        return cell.missFlagued() || cell.bombNotFlagued();
      });
    };

    return Game;

  })(Backbone.View);
  return Game;
});
