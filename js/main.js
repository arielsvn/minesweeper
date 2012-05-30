(function() {
  var Cell, CellState, Game, GameState, bidimensionalArray, tableTemplate,
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  CellState = {
    empty: 'empty',
    hidden: 'hidden',
    info: 'info',
    mineBlown: 'mineBlown',
    mineVisible: 'mineVisible',
    flagued: 'flagued',
    unknown: 'unknown'
  };

  Cell = (function(_super) {

    __extends(Cell, _super);

    function Cell() {
      Cell.__super__.constructor.apply(this, arguments);
    }

    Cell.prototype.hasBomb = false;

    Cell.prototype.state = CellState.hidden;

    Cell.prototype.initialize = function() {
      return this.contentDiv = this.$('#cell-content');
    };

    Cell.prototype.mark = function() {
      var neighbor, _i, _len, _ref, _results;
      if (this.state !== CellState.flagued) {
        if (this.hasBomb) {
          this.trigger('bang', this);
          return this.gotoState(CellState.mineBlown);
        } else {
          this.discover();
          if (!this.numberOfNearMines()) {
            _ref = this.neighbors;
            _results = [];
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              neighbor = _ref[_i];
              if (neighbor.state === CellState.hidden && !neighbor.hasBomb) {
                _results.push(neighbor.mark());
              }
            }
            return _results;
          }
        }
      }
    };

    Cell.prototype.flag = function() {
      if (this.state === CellState.hidden) {
        this.gotoState(CellState.flagued);
        return true;
      } else if (this.state === CellState.flagued) {
        this.gotoState(CellState.hidden);
        return true;
      }
      return false;
    };

    Cell.prototype.discover = function() {
      if (this.state === CellState.info && this.numberOfNearMines() === 0) {
        return this.gotoState(CellState.empty);
      } else if (this.state === CellState.hidden && !this.hasBomb) {
        if (this.numberOfNearMines() === 0) {
          return this.gotoState(CellState.empty);
        } else {
          this.contentDiv.html(this.numberOfNearMines());
          return this.gotoState(CellState.info);
        }
      }
    };

    Cell.prototype.numberOfNearMines = function() {
      var n;
      if (this.__nearMines != null) return this.__nearMines;
      return this.__nearMines = ((function() {
        var _i, _len, _ref, _results;
        _ref = this.neighbors;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          n = _ref[_i];
          if (n.hasBomb) _results.push(n.hasBomb);
        }
        return _results;
      }).call(this)).length;
    };

    Cell.prototype.neighbors = function() {
      return [];
    };

    Cell.prototype.cleanCell = function() {
      return this.contentDiv.removeClass(this.state);
    };

    Cell.prototype.gotoState = function(newState) {
      this.cleanCell();
      this.state = newState;
      this.contentDiv.addClass(this.state);
      if (this.state === CellState.info) {
        return this.contentDiv.addClass('num' + this.numberOfNearMines());
      }
    };

    Cell.prototype.reset = function() {
      this.hasBomb = false;
      return this.gotoState(CellState.hidden);
    };

    Cell.prototype.gameOver = function() {
      if (this.hasBomb) return this.gotoState(CellState.mineVisible);
    };

    return Cell;

  })(Backbone.View);

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

  GameState = {
    stand: 'stand',
    playing: 'playing',
    won: 'won',
    lost: 'lost'
  };

  tableTemplate = "<table>\n    <%for (var i=0;i < rows; i++) {%>\n    <tr>\n        <%for (var j=0;j < cols; j++) {%>\n        <th data-row=<%=i%> data-col=<%=j%> >\n            <div id=\"cell-content\" class=\"hidden\"></div>\n        </th>\n        <%}%>\n    </tr>\n    <%}%>\n</table>";

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
      this.state = GameState.stand;
      return this.reset();
    };

    Game.prototype.gotoState = function(state) {
      this.$el.removeClass(this.state);
      this.state = state;
      return this.$el.addClass(this.state);
    };

    Game.prototype.reset = function() {
      this.minesPlaced = false;
      this._gameOver = false;
      this.gotoState(GameState.stand);
      this.$('#time-left').html('0');
      this.flags = 0;
      this.$('#mines-left').html(this.numberOfMines);
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

    Game.prototype.gameOver = function(won) {
      this._gameOver = true;
      if (won) {
        return this.gotoState(GameState.won);
      } else {
        return this.gotoState(GameState.lost);
      }
    };

    Game.prototype.bang = function(e) {
      var i, j, _ref, _results;
      this.gameOver(false);
      _results = [];
      for (i = 0, _ref = this.rows; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
        _results.push((function() {
          var _ref2, _results2;
          _results2 = [];
          for (j = 0, _ref2 = this.cols; 0 <= _ref2 ? j < _ref2 : j > _ref2; 0 <= _ref2 ? j++ : j--) {
            if (this.cells[i][j].hasBomb) {
              _results2.push(this.cells[i][j].gotoState(CellState.mineVisible));
            } else {
              _results2.push(void 0);
            }
          }
          return _results2;
        }).call(this));
      }
      return _results;
    };

    Game.prototype.events = {
      "click #table-container tr th": "cellClicked",
      "click #reset-button": "reset",
      "contextmenu #table-container tr th": 'noContext',
      "mousedown #table-container tr th": 'cellRightClicked'
    };

    Game.prototype.cellRightClicked = function(event) {
      var _this = this;
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
    };

    Game.prototype.flagCell = function(row, col) {
      if (!this._gameOver && this.cells[row][col].flag()) {
        this.flags += this.cells[row][col].state === CellState.flagued ? 1 : -1;
        this.$('#mines-left').html(this.numberOfMines - this.flags);
        if (this.gameWon()) return this.gameOver(true);
      }
    };

    Game.prototype.cellClicked = function(event) {
      var col, row;
      if (!this._gameOver) {
        row = parseInt(event.currentTarget.attributes['data-row'].value);
        col = parseInt(event.currentTarget.attributes['data-col'].value);
        return this.markCell(row, col);
      }
    };

    Game.prototype.startTime = function() {
      var currentTime, time, updateTime,
        _this = this;
      time = this.$('#time-left');
      currentTime = 0;
      updateTime = {};
      updateTime = function() {
        if (!_this._gameOver) {
          time.html(currentTime);
          currentTime++;
          return setTimeout(updateTime, 1000);
        }
      };
      return updateTime();
    };

    Game.prototype.markCell = function(row, col) {
      var c, i, j;
      if (!this.minesPlaced) {
        c = this.numberOfMines;
        while (c > 0) {
          i = Math.round(this.rows * Math.random());
          j = Math.round(this.cols * Math.random());
          if ((i !== row && j !== col) && (0 <= i && i < this.rows) && (0 <= j && j < this.cols) && !this.cells[i][j].hasBomb) {
            this.cells[i][j].hasBomb = true;
            c--;
          }
        }
        this.startTime();
        this.minesPlaced = true;
        this.gotoState(GameState.playing);
      }
      this.cells[row][col].mark();
      if (this.gameWon()) return this.gameOver(true);
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
      this._gameOver = true;
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
      var bombNotFlagued, cellMarked, cells, missFlagued;
      cellMarked = function(cell) {
        return cell.state !== CellState.hidden;
      };
      missFlagued = function(cell) {
        return cell.state === CellState.flagued && !cell.hasBomb;
      };
      bombNotFlagued = function(cell) {
        return cell.state !== CellState.flagued && cell.hasBomb;
      };
      cells = _.union.apply(_, this.cells);
      return !_.any(cells, function(cell) {
        return missFlagued(cell) || bombNotFlagued(cell);
      }) || (!_.any(cells, function(cell) {
        return !cell.hasBomb && !cellMarked(cell);
      }) && !_.any(cells, function(cell) {
        return missFlagued(cell);
      }));
    };

    return Game;

  })(Backbone.View);

  $(function() {
    var game;
    return game = new Game(9, 9, 10);
  });

}).call(this);
