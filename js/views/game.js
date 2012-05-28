(function() {
  var __slice = Array.prototype.slice,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  define(['views/cell', 'text!templates/table-container-template.html', 'jquery', 'underscore', 'backbone'], function() {
    var Cell, Game, bidimensionalArray, libs, tableTemplate;
    Cell = arguments[0], tableTemplate = arguments[1], libs = 3 <= arguments.length ? __slice.call(arguments, 2) : [];
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
        return this.render();
      };

      Game.prototype.render = function() {
        var cell, getNeighbors, i, i1, j, j1, renderedTemplate, _ref, _ref2,
          _this = this;
        renderedTemplate = this.tableTemplate({
          rows: this.rows,
          cols: this.cols
        });
        this.$('#table-container').html(renderedTemplate);
        this.cells = bidimensionalArray(false, this.rows, this.cols);
        getNeighbors = function(row, col) {
          var i, j, _ref, _ref2, _results;
          _results = [];
          for (i = _ref = row - 1, _ref2 = row + 1; _ref <= _ref2 ? i <= _ref2 : i >= _ref2; _ref <= _ref2 ? i++ : i--) {
            if (_this.cells[i] != null) {
              _results.push((function() {
                var _ref3, _ref4, _results2;
                _results2 = [];
                for (j = _ref3 = col - 1, _ref4 = col + 1; _ref3 <= _ref4 ? j <= _ref4 : j >= _ref4; _ref3 <= _ref4 ? j++ : j--) {
                  if (i !== j && !(i === row && j === col) && (this.cells[i][j] != null)) {
                    _results2.push(this.cells[i][j]);
                  }
                }
                return _results2;
              }).call(_this));
            }
          }
          return _results;
        };
        for (i = 0, _ref = this.rows; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
          for (j = 0, _ref2 = this.cols; 0 <= _ref2 ? j < _ref2 : j > _ref2; 0 <= _ref2 ? j++ : j--) {
            cell = new Cell({
              el: this.$("th[data-row=" + i + "][data-col=" + j + "]")
            });
            i1 = i;
            j1 = j;
            cell.getNeighbors = function() {
              return getNeighbors(i1, j1);
            };
            this.cells[i][j] = cell;
          }
        }
        return this;
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
        if (!this.minesPlaced) this.addMines();
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

      Game.prototype.addMines = function() {
        this.cells[0][2].hasBomb = true;
        this.cells[1][2].hasBomb = true;
        this.cells[2][2].hasBomb = true;
        this.cells[3][2].hasBomb = true;
        return this.cells[4][2].hasBomb = true;
      };

      return Game;

    })(Backbone.View);
    return Game;
  });

}).call(this);
